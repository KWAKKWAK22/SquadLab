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
const MAX_CALLS = 6; // 한 흐름에 2회(팀 분석 + 전술 지시) 부르므로 여유를 둠
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

const TEAM_SCHEMA = {
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
          fitAdjust: {
            type: "INTEGER",
            description:
              "코드가 계산한 적합도에 더할 보정값. -15 ~ +15 사이의 정수. " +
              "능력치 숫자만으로는 안 보이지만 선수들의 플레이 성향에서 드러나는 근거가 있을 때만 움직일 것. " +
              "근거가 약하면 0을 쓰세요. 습관적으로 보정하지 마세요.",
          },
          adjustReason: S("보정한 이유. 1문장, 45자 이내. 반드시 선수 성향을 근거로 들 것. 보정이 0이면 계산값이 왜 타당한지 한 문장."),
          reason: S("이 팀에 이 전술이 왜 그 정도 적합도인지. 1~2문장."),
          pros: STR_LIST("이 팀 기준 장점 2개. 각 20자 이내."),
          cons: STR_LIST("이 팀 기준 단점 2개. 각 20자 이내."),
        },
        required: ["name", "fitAdjust", "adjustReason", "reason", "pros", "cons"],
      },
    },
    recommendation: {
      type: "OBJECT",
      description: "보정을 모두 반영한 뒤 점수가 가장 높은 전술 하나를 최종 추천.",
      properties: {
        name: S("최종 추천 전술 이름. 위 tactics 중 (적합도 + fitAdjust)가 가장 높은 것과 반드시 일치해야 함."),
        headline: S("감독에게 건네는 추천 한 줄. 28자 이내. 예: '스피드로 찌르는 팀입니다'"),
        why: S("왜 이 팀에 이 전술인지. 2문장. 특정 선수의 성향을 최소 하나 이름과 함께 근거로 들 것."),
      },
      required: ["name", "headline", "why"],
    },
  },
  required: ["players", "team", "tactics", "recommendation"],
};

// ───────────────────────────────────────────────────────────────
//  프롬프트 — 계산된 숫자를 함께 넘겨 "말과 숫자가 따로 노는 것"을 막습니다.
// ───────────────────────────────────────────────────────────────
// 선수 한 명을 프롬프트 한 줄로 만듭니다.
// 능력치 등급 + "특징"(3지선다 답변 + 체격·나이·주발)을 함께 넘기는 것이 핵심입니다.
// 이 중 성향 답변은 코드 공식이 보지 못하는 정보라, AI가 보정을 판단할 유일한 근거가 됩니다.
function playerLine(p) {
  const grades = Object.entries(p.grades || {})
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  const traits = (p.traits || []).join(" / ");
  return (
    `- id:${p.id} | ${p.name || "이름없음"} (${p.pos}) | 종합 ${p.overall} | ${grades}` +
    (traits ? `
    특징: ${traits}` : "")
  );
}

function buildTeamPrompt({ teamName, players, computed }) {
  return `당신은 아마추어 축구 동호인 팀을 지도하는 전술 코치입니다.
아래는 "${teamName || "우리 팀"}"의 선수 데이터와, 이미 계산이 끝난 팀 지표입니다.

[중요] 선수 개인 능력치는 "상 / 중 / 하" 3단계로만 측정된 값입니다.
숫자로 환산해서 말하지 마세요. "속도 88" 같은 표현은 실제보다 정밀한 척하는 것이라 금지입니다.
반드시 "속도가 상급", "체력이 하위" 처럼 등급 표현으로만 인용하세요.
팀 종합 지표(아래)는 11명을 합산한 값이라 숫자로 인용해도 됩니다.

[선수 명단]
${players.map(playerLine).join("\n")}

[팀 종합 지표]
${Object.entries(computed.radar)
  .map(([k, v]) => `${k} ${v}`)
  .join(" / ")}

[전술별 적합도 — 코드가 능력치 평균만으로 계산한 기준점]
${computed.tactics.map((t) => `- ${t.name}: ${t.fit}점`).join("\n")}

[전술 추천 방법 — 이번 작업의 핵심]
위 적합도는 속도·체력·피지컬·기술의 평균만 넣은 계산입니다.
따라서 각 선수의 "성향"(선호 움직임, 팀 헌신도, 전술 이해도, 세부 기술 성향)은 전혀 반영되어 있지 않습니다.
당신의 일은 그 성향을 읽고, 계산이 놓친 부분만큼 fitAdjust로 점수를 움직이는 것입니다.

- 보정 근거는 반드시 선수 성향에서 찾으세요. 능력치 등급만 다시 말하는 것은 근거가 아닙니다.
  (좋은 예: "윙어 둘 다 인버티드 성향이라 측면 폭을 못 써 점유율이 막힙니다")
  (나쁜 예: "기술력이 높아서 점유율에 적합합니다" — 이미 계산에 들어간 내용)
- 근거가 뚜렷할수록 크게(최대 ±15), 애매하면 작게, 없으면 0으로 두세요. 세 전술을 다 움직일 필요는 없습니다.
- 보정 결과 1위가 바뀌어도 괜찮습니다. 그게 이 작업의 목적입니다.
- recommendation.name 은 (적합도 + fitAdjust)가 가장 높은 전술과 반드시 같아야 합니다. 계산을 직접 해보고 쓰세요.

[작성 규칙]
- 모든 문장은 한국어 존댓말. 동호인이 바로 알아들을 수 있는 쉬운 표현.
- 정해진 문장 수를 반드시 지킬 것. 길게 쓰지 마세요.
- 선수 ${players.length}명 전원에 대해 빠짐없이 작성할 것.
- 전술 3개 전부에 대해 작성하되, name은 받은 문자열을 그대로 쓸 것.
- 능력치가 낮은 선수도 비하하지 말고, 어떻게 활용하면 되는지를 제시할 것.

[절대 규칙 — 등급과 모순되는 말 금지]
각 선수의 등급은 위에 이미 적혀 있습니다. 그 등급과 어긋나는 문장은 명백한 오류입니다.
- **상급인 항목을 약점(weaknesses)이나 보완점으로 쓰지 마세요.**
  (체력이 상인 선수에게 "평범한 체력", "체력 관리 필요" → 금지)
- **하급인 항목을 강점(strengths)으로 쓰지 마세요.**
- comment 문장에서도 마찬가지입니다. 등급을 인용할 거면 위에 적힌 그대로 인용하세요.
- 쓸 약점이 마땅치 않으면 성향에서 찾으세요. 없는 약점을 지어내지 마세요.`;
}

// ───────────────────────────────────────────────────────────────
//  2차 호출 — 감독이 전술을 고른 뒤, 그 전술 기준 개인별 지시 (5b)
//  화면에 이미 있는 하드코딩 가이드를 함께 넘겨서
//  "같은 말 반복"이 아니라 "이 선수용 조정"만 받아옵니다.
// ───────────────────────────────────────────────────────────────
const TACTIC_SCHEMA = {
  type: "OBJECT",
  properties: {
    orders: {
      type: "ARRAY",
      description: "입력된 선수 전원. 입력 순서와 동일하게.",
      items: {
        type: "OBJECT",
        properties: {
          id: S("입력으로 받은 선수의 id를 그대로"),
          headline: S("이 선수에게 붙일 한 줄 별명형 임무. 18자 이내. 예: '왼쪽을 혼자 잠그는 자물쇠'"),
          instructions: STR_LIST(
            "이 선수만을 위한 구체적 지시 2~3개. 각 35자 이내. " +
            "기본 가이드에 이미 있는 문장을 그대로 반복하지 말고, 이 선수의 성향 때문에 달라지는 부분을 쓸 것."
          ),
          watchout: S("이 선수가 이 전술에서 특히 조심할 점. 1문장, 40자 이내."),
        },
        required: ["id", "headline", "instructions", "watchout"],
      },
    },
    teamNote: S("이 전술에서 11명 전체가 공유해야 할 약속 한 가지. 1~2문장."),
    lockerRoom: {
      type: "ARRAY",
      description:
        "경기 직전 라커룸에서 감독이 선수 11명 앞에 서서 하는 팀 토크. 6~7문장. " +
        "한 문장씩 순서대로 화면에 뜨므로, 읽는 순서대로 감정이 쌓이게 배치할 것.",
      items: {
        type: "OBJECT",
        properties: {
          text: S("한 문장. 50자 이내. 글이 아니라 입으로 하는 말투. 존댓말."),
          tone: {
            type: "STRING",
            enum: ["인사", "현실", "전술", "지목", "각오"],
            description:
              "이 문장의 성격. 인사=주목시키기 / 현실=우리 약점을 솔직히 / " +
              "전술=오늘 뭘 할지 / 지목=특정 선수에게 직접 / 각오=마무리. " +
              "'지목'은 1~2문장만. 마지막 문장은 반드시 '각오'.",
          },
          target: S("'지목' 문장이면 그 선수의 이름, 아니면 빈 문자열."),
        },
        required: ["text", "tone", "target"],
      },
    },
  },
  required: ["orders", "teamNote", "lockerRoom"],
};

function buildTacticPrompt({ teamName, tacticName, players }) {
  return `당신은 아마추어 축구 동호인 팀을 지도하는 전술 코치입니다.
"${teamName || "우리 팀"}" 감독이 이번 경기 전술로 **${tacticName}**을 선택했습니다.
이제 선수 한 명 한 명에게 건넬 개인 지시를 작성하세요.

[중요] 능력치는 "상 / 중 / 하" 3단계 값입니다. 숫자로 환산해 말하지 마세요.

[선수별 데이터와, 이미 화면에 표시 중인 기본 역할 가이드]
${players
  .map(
    (p) =>
      `- id:${p.id} | ${p.name || "이름없음"} (${p.pos}) | 종합 ${p.overall} | ` +
      Object.entries(p.grades || {})
        .map(([k, v]) => `${k} ${v}`)
        .join(", ") +
      `
    특징: ${(p.traits || []).join(" / ") || "정보 없음"}` +
      `
    기본 역할: ${p.baseRole || "-"}` +
      `
    기본 임무(이미 화면에 있음): ${(p.baseTasks || []).join(" · ") || "-"}`
  )
  .join("\n")}

[작성 규칙]
- 기본 임무는 이미 화면에 떠 있습니다. **그 문장을 되풀이하면 실패입니다.**
  당신이 쓸 것은 "이 선수는 이런 성향이니 ${tacticName}에서는 이렇게 조정하라"입니다.
- 지시마다 그 선수의 성향이나 등급 중 최소 하나가 근거로 드러나야 합니다.
- 성향이 이 전술과 잘 안 맞는 선수는 솔직하게 짚되, 반드시 대안을 함께 주세요.
  (예: "오버래핑 자제 성향이라 폭이 안 나옵니다. 대신 LW가 안으로 접을 때 뒷공간만 채우세요.")
- 모든 문장은 한국어 존댓말. 동호인이 경기 전에 읽고 바로 실행할 수 있는 구체적 표현.
- 선수 ${players.length}명 전원에 대해 빠짐없이 작성할 것.

[라커룸 팀 토크 작성 규칙]
경기 시작 직전, 감독이 라커룸에서 실제로 입으로 하는 말입니다. 보고서가 아닙니다.
- 짧게 끊어 말하세요. 한 문장에 한 가지만.
- **모든 문장이 이 팀에만 해당해야 합니다.** 선수 이름·포지션·성향·오늘 전술 중 하나는 반드시 들어가야 합니다.
  아래 같은 문장은 어느 팀에나 붙으므로 한 줄도 쓰지 마세요:
  "최선을 다합시다" / "상대가 누구든 우리 축구를 하면 됩니다" / "후회 없이 뜁시다" / "하나 된 마음으로"
- '현실' 문장에서는 이 팀의 약점을 숨기지 말고 짚되, 그래서 어떻게 할지를 붙이세요.
- **상대 팀에 대한 정보는 하나도 주어지지 않았습니다.** 상대의 전술·약점·선수·스타일을
  아는 것처럼 말하지 마세요. ("오늘 상대는 측면이 약합니다" 같은 문장은 지어낸 것이므로 금지)
  상대를 언급해야 한다면 "상대가 어떻게 나오든" 정도로만 두고, 우리 팀 이야기만 하세요.
- '지목' 문장은 target에 적은 그 선수 한 명을 직접 부르고, 그 선수의 성향과 연결된 한마디를 하세요.
  여러 명을 한꺼번에 부르는 문장은 '지목'이 아니라 '전술'로 분류하고 target은 비워 두세요.
  '지목'에 한해 감독이 선수를 부르는 편한 말투(반말)를 써도 됩니다. 나머지는 존댓말입니다.
- 마지막은 선수들을 경기장으로 내보내는 말로 끝내세요.`;
}

// ───────────────────────────────────────────────────────────────
//  등급 모순 검사
//
//  AI가 "체력 상"인 선수의 보완점에 "평범한 체력"을 쓰는 일이 실제로 있었습니다.
//  프롬프트로 금지해도 완전히 막히지는 않으므로, 서버에서 한 번 더 걸러냅니다.
//  애매한 "중" 등급은 건드리지 않습니다 — 상/하만 명백한 모순입니다.
// ───────────────────────────────────────────────────────────────
const STAT_KEYWORDS = {
  속도: ["속도", "기동력", "스피드", "주력"],
  체력: ["체력", "지구력", "활동량", "스태미"],
  피지컬: ["피지컬", "몸싸움", "제공권"],
  기술: ["기술", "발밑"],
};

function contradicts(text, grades, kind) {
  if (!text || !grades) return false;
  const forbidden = kind === "strength" ? "하" : "상";
  return Object.keys(STAT_KEYWORDS).some(
    (stat) => grades[stat] === forbidden && STAT_KEYWORDS[stat].some((w) => text.includes(w))
  );
}

// ───────────────────────────────────────────────────────────────
//  Gemini 호출 (모델 1개 시도)
// ───────────────────────────────────────────────────────────────
async function callGemini(model, prompt, apiKey, schema) {
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
          responseSchema: schema,
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

// 1차 모델이 실패(429 한도초과 등)하면 2차 모델로 한 번 더
async function askGemini(prompt, apiKey, schema) {
  try {
    return await callGemini(MODEL_PRIMARY, prompt, apiKey, schema);
  } catch (e1) {
    console.error("[1차 실패]", e1.message);
    try {
      return await callGemini(MODEL_FALLBACK, prompt, apiKey, schema);
    } catch (e2) {
      // 둘 중 하나라도 429였으면 "오늘 무료 한도를 다 썼다"로 봅니다.
      // 화면에서 한도 소진과 그냥 실패를 다르게 안내해야 하는데,
      // 사람이 읽는 reason 문장만으로는 구분할 수 없어서 따로 표시해 둡니다.
      if (e1.status === 429 || e2.status === 429) e2.quotaExceeded = true;
      throw e2;
    }
  }
}

// ───────────────────────────────────────────────────────────────
//  본체
// ───────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ source: "fallback", code: "method", reason: "POST만 허용됩니다." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // 키가 없어도 500을 던지지 않습니다. 화면이 깨지면 안 되기 때문입니다.
    return res.status(200).json({ source: "fallback", code: "no-key", reason: "GEMINI_API_KEY 미설정" });
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return res
      .status(200)
      .json({ source: "fallback", code: "rate-limit", reason: "잠시 후 다시 시도해 주세요. (1분에 6회 제한)" });
  }

  const mode = (req.body && req.body.mode) || "team";

  try {
    // ── 2차 호출: 고른 전술 기준 개인 지시 (5b) ──────────────
    if (mode === "tactic") {
      const { teamName, tacticName, players } = req.body || {};
      if (!tacticName || !Array.isArray(players) || !players.length) {
        return res.status(200).json({ source: "fallback", code: "bad-request", reason: "요청 데이터가 부족합니다." });
      }

      const raw = await askGemini(
        buildTacticPrompt({ teamName, tacticName, players }),
        apiKey,
        TACTIC_SCHEMA
      );

      const byId = {};
      for (const o of raw.orders || []) {
        if (o && o.id) byId[o.id] = o;
      }
      return res.status(200).json({
        source: "ai",
        tacticName,
        orders: byId,
        teamNote: raw.teamNote || null,
        lockerRoom: Array.isArray(raw.lockerRoom) ? raw.lockerRoom.filter((l) => l && l.text) : [],
      });
    }

    // ── 1차 호출: 팀·선수·전술 분석 (기존 + 5a) ───────────────
    const { teamName, players, computed } = req.body || {};
    if (!Array.isArray(players) || !players.length || !computed || !computed.radar) {
      return res.status(200).json({ source: "fallback", code: "bad-request", reason: "요청 데이터가 부족합니다." });
    }

    const raw = await askGemini(
      buildTeamPrompt({ teamName, players, computed }),
      apiKey,
      TEAM_SCHEMA
    );

    // 선수 배열을 화면이 쓰기 쉬운 형태({슬롯id: 분석})로 변환하면서
    // 등급과 모순되는 강점·보완점을 걸러냅니다.
    const gradesById = {};
    for (const p of players) gradesById[String(p.id)] = p.grades || {};

    const byId = {};
    let dropped = 0;
    for (const p of raw.players || []) {
      if (!p || !p.id) continue;
      const g = gradesById[String(p.id)];
      const before = (p.strengths || []).length + (p.weaknesses || []).length;
      p.strengths = (p.strengths || []).filter((t) => !contradicts(t, g, "strength"));
      p.weaknesses = (p.weaknesses || []).filter((t) => !contradicts(t, g, "weakness"));
      dropped += before - p.strengths.length - p.weaknesses.length;
      byId[p.id] = p;
    }
    // 전부 걸러져 비면 화면이 알아서 기존 계산식 결과로 되돌아갑니다.
    if (dropped) console.error("[등급 모순 제거]", dropped, "건");

    // ── AI 보정값 검증 (5a) ─────────────────────────────────
    // AI가 ±15를 넘기거나 숫자가 아닌 값을 주는 경우를 서버에서 막습니다.
    // 화면 쪽에서 방어하지 않고 여기서 끝내야, 나중에 UI를 고쳐도 안전합니다.
    const baseFit = new Map(computed.tactics.map((t) => [t.name, t.fit]));
    const tactics = (raw.tactics || [])
      .filter((t) => t && baseFit.has(t.name))
      .map((t) => {
        const n = Number(t.fitAdjust);
        const adjust = Number.isFinite(n) ? Math.max(-15, Math.min(15, Math.round(n))) : 0;
        const base = baseFit.get(t.name);
        return {
          ...t,
          fitAdjust: adjust,
          fitBase: base,
          fitFinal: Math.max(10, Math.min(99, base + adjust)),
        };
      });

    // 추천 전술은 "보정 후 점수 1위"가 정답입니다.
    // AI가 다른 이름을 적어 보내면(계산 실수) 추천 문구는 버리고 순위만 신뢰합니다.
    const top = [...tactics].sort((a, b) => b.fitFinal - a.fitFinal)[0];
    let recommendation = raw.recommendation || null;
    if (!top || !recommendation || recommendation.name !== top.name) {
      if (recommendation) console.warn("[추천 불일치] AI:", recommendation.name, "계산:", top && top.name);
      recommendation = top
        ? { name: top.name, headline: null, why: top.reason || null }
        : null;
    }

    return res.status(200).json({
      source: "ai",
      players: byId,
      team: raw.team || null,
      tactics,
      recommendation,
    });
  } catch (e) {
    console.error("[AI 분석 실패]", mode, e.message);
    // 여기까지 오면 화면은 기존 계산식 결과를 그대로 보여줍니다.
    return res.status(200).json({
      source: "fallback",
      code: e.quotaExceeded ? "quota" : e.name === "AbortError" ? "timeout" : "error",
      reason: e.message,
    });
  }
};
