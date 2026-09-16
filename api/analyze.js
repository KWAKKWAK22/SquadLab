// ═══════════════════════════════════════════════════════════════
//  SquadLab — AI 분석 API
//
//  ⚠️ 이 파일은 Vercel 서버에서만 실행됩니다. 브라우저로 내려가지 않습니다.
//     그래서 여기서만 API 키를 사용할 수 있습니다.
//     src/ 안에서는 절대로 키를 언급하지 마세요.
// ═══════════════════════════════════════════════════════════════

// 모델 ID — 나중에 바꿀 일이 생기면 이 줄만 고치면 됩니다
const MODEL_PRIMARY  = "gemini-3.5-flash-lite"; // 런타임 (500 RPD / 15 RPM)
const MODEL_FALLBACK = "gemini-3.1-flash-lite"; // 1차가 429일 때 2차 시도

const GEMINI_URL = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

// ───────────────────────────────────────────────────────────────
//  호출 횟수 제한 (같은 IP 기준 60초에 3회)
//  새로고침 연타로 무료 할당량이 타는 것을 막습니다.
// ───────────────────────────────────────────────────────────────
const WINDOW_MS = 60 * 1000;
const MAX_CALLS = 3;
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_CALLS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear(); // 메모리 보호
  return false;
}

// ───────────────────────────────────────────────────────────────
//  AI에게 받을 응답의 형식을 미리 못 박아 둡니다.
//  이렇게 하면 "형식이 틀려서 파싱 실패"가 거의 발생하지 않습니다.
// ───────────────────────────────────────────────────────────────
const S = (d) => ({ type: "STRING", description: d });
const STR_LIST = (d) => ({ type: "ARRAY", items: { type: "STRING" }, description: d });

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    players: {
      type: "ARRAY",
      description: "입력된 선수 전원에 대한 분석. 입력 순서와 동일하게.",
      items: {
        type: "OBJECT",
        properties: {
          id: S("입력으로 받은 선수의 id를 그대로"),
          comment: S("이 선수에 대한 코칭 코멘트. 정확히 2문장. 능력치는 '상/중/하' 등급 표현으로만 인용할 것. 숫자 금지."),
          strengths: STR_LIST("강점 2~3개. 각 12자 이내의 짧은 구."),
          weaknesses: STR_LIST("보완점 1~2개. 각 12자 이내의 짧은 구."),
        },
        required: ["id", "comment", "strengths", "weaknesses"],
      },
    },
    team: {
      type: "OBJECT",
      properties: {
        summary: S("팀 전체 총평. 정확히 2문장."),
        strengths: {
          type: "ARRAY",
          description: "팀 강점 2~3개",
          items: {
            type: "OBJECT",
            properties: { text: S("강점 제목. 15자 이내."), desc: S("설명 1문장.") },
            required: ["text", "desc"],
          },
        },
        weaknesses: {
          type: "ARRAY",
          description: "팀 약점 1~2개",
          items: {
            type: "OBJECT",
            properties: { text: S("약점 제목. 15자 이내."), desc: S("설명 1문장.") },
            required: ["text", "desc"],
          },
        },
      },
      required: ["summary", "strengths", "weaknesses"],
    },
    tactics: {
      type: "ARRAY",
      description: "전술 3개 전부. 입력으로 받은 name을 그대로 사용.",
      items: {
        type: "OBJECT",
        properties: {
          name: S("전술 이름. 입력받은 것 그대로."),
          reason: S("이 팀에 이 전술이 왜 그 정도 적합도인지. 1~2문장. 숫자 근거 포함."),
          pros: STR_LIST("장점 2개. 각 20자 이내."),
          cons: STR_LIST("단점 2개. 각 20자 이내."),
        },
        required: ["name", "reason", "pros", "cons"],
      },
    },
  },
  required: ["players", "team", "tactics"],
};

// ───────────────────────────────────────────────────────────────
//  프롬프트 — 계산된 숫자를 함께 넘겨 "말과 숫자가 따로 노는 것"을 막습니다.
// ───────────────────────────────────────────────────────────────
function buildPrompt({ teamName, players, computed }) {
  return `당신은 아마추어 축구 동호인 팀을 지도하는 전술 코치입니다.
아래는 "${teamName || "우리 팀"}"의 선수 데이터와, 이미 계산이 끝난 팀 지표입니다.

[중요] 선수 개인 능력치는 "상 / 중 / 하" 3단계로만 측정된 값입니다.
숫자로 환산해서 말하지 마세요. "속도 88" 같은 표현은 실제보다 정밀한 척하는 것이라 금지입니다.
반드시 "속도가 상급", "체력이 하위" 처럼 등급 표현으로만 인용하세요.
팀 종합 지표(아래)는 11명을 합산한 값이라 숫자로 인용해도 됩니다.

[선수 명단]
${players
  .map(
    (p) =>
      `- id:${p.id} | ${p.name || "이름없음"} (${p.pos}) | 종합 ${p.overall} | ` +
      Object.entries(p.grades || {})
        .map(([k, v]) => `${k} ${v}`)
        .join(", ")
  )
  .join("\n")}

[팀 종합 지표]
${Object.entries(computed.radar)
  .map(([k, v]) => `${k} ${v}`)
  .join(" / ")}

[전술별 적합도 — 이 수치는 이미 계산된 값입니다]
${computed.tactics.map((t) => `- ${t.name}: 적합도 ${t.fit}`).join("\n")}

[작성 규칙]
- 모든 문장은 한국어 존댓말. 동호인이 바로 알아들을 수 있는 쉬운 표현.
- 정해진 문장 수를 반드시 지킬 것. 길게 쓰지 마세요.
- 선수 ${players.length}명 전원에 대해 빠짐없이 작성할 것.
- 전술 3개 전부에 대해 작성하되, name은 받은 문자열을 그대로 쓸 것.
- 능력치가 낮은 선수도 비하하지 말고, 어떻게 활용하면 되는지를 제시할 것.`;
}

// ───────────────────────────────────────────────────────────────
//  Gemini 호출 (모델 1개 시도)
// ───────────────────────────────────────────────────────────────
async function callGemini(model, prompt, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000); // 25초 넘으면 포기

  try {
    const res = await fetch(GEMINI_URL(model), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      const err = new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini 응답에 본문이 없습니다.");
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

// ───────────────────────────────────────────────────────────────
//  본체
// ───────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ source: "fallback", reason: "POST만 허용됩니다." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // 키가 없어도 500을 던지지 않습니다. 화면이 깨지면 안 되기 때문입니다.
    return res.status(200).json({ source: "fallback", reason: "GEMINI_API_KEY 미설정" });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return res
      .status(200)
      .json({ source: "fallback", reason: "잠시 후 다시 시도해 주세요. (1분에 3회 제한)" });
  }

  try {
    const { teamName, players, computed } = req.body || {};
    if (!Array.isArray(players) || !players.length || !computed || !computed.radar) {
      return res.status(200).json({ source: "fallback", reason: "요청 데이터가 부족합니다." });
    }

    const prompt = buildPrompt({ teamName, players, computed });

    let raw;
    try {
      raw = await callGemini(MODEL_PRIMARY, prompt, apiKey);
    } catch (e) {
      // 429(한도 초과)나 5xx면 두 번째 모델로 한 번 더 시도
      console.error("[1차 실패]", e.message);
      raw = await callGemini(MODEL_FALLBACK, prompt, apiKey);
    }

    // 선수 배열을 화면이 쓰기 쉬운 형태({슬롯id: 분석})로 변환
    const byId = {};
    for (const p of raw.players || []) {
      if (p && p.id) byId[p.id] = p;
    }

    return res.status(200).json({
      source: "ai",
      players: byId,
      team: raw.team || null,
      tactics: raw.tactics || [],
    });
  } catch (e) {
    console.error("[AI 분석 실패]", e.message);
    // 여기까지 오면 화면은 기존 계산식 결과를 그대로 보여줍니다.
    return res.status(200).json({ source: "fallback", reason: e.message });
  }
};
