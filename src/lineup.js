// ═══════════════════════════════════════════════════════════════
//  라인업 계산 — 누구를 어디에 세울 것인가
//
//  이 파일에는 AI 호출이 없습니다. 전부 코드가 계산합니다.
//
//  AI에게 "베스트 11을 짜줘"라고 하면 그럴듯한 답이 나오지만
//  물을 때마다 달라지고, 그게 최적인지 확인할 방법이 없습니다.
//  조합 최적화는 LLM이 원래 못하는 종류의 문제입니다.
//
//  그래서 배치는 여기서 계산하고, AI는 그 결과에 설명만 붙입니다.
//  같은 명단은 언제나 같은 배치가 나오고, 왜 그런지 점수로 답할 수 있습니다.
// ═══════════════════════════════════════════════════════════════

// ── 포지션마다 무엇이 얼마나 중요한가 ──────────────────────────
//
//  합이 100입니다. 동호회 기준이라 프로와 다르게 잡은 곳이 있습니다 —
//  교체 없이 풀타임을 뛰므로 체력 비중이 높고, 조직력이 낮아
//  속도 하나로 갈리는 장면이 자주 나옵니다.
//
//  tech(기술)는 그 선수가 자기 포지션에서 답한 전문 문항의 평균입니다.
//  다른 포지션으로 옮길 때는 그대로 쓰지 않습니다 — 아래 techFor() 참조.
export const POS_WEIGHTS = {
  ST:  { speed: 25, stamina: 10, physical: 30, tech: 35 }, // 등지고 버티기 + 마무리
  LW:  { speed: 40, stamina: 20, physical:  5, tech: 35 }, // 속도가 전부에 가깝다
  RW:  { speed: 40, stamina: 20, physical:  5, tech: 35 },
  CAM: { speed: 15, stamina: 20, physical: 10, tech: 55 }, // 시야와 발밑
  CM:  { speed: 10, stamina: 35, physical: 20, tech: 35 }, // 활동량이 핵심
  LB:  { speed: 30, stamina: 35, physical: 15, tech: 20 }, // 90분 오르내린다
  RB:  { speed: 30, stamina: 35, physical: 15, tech: 20 },
  CB:  { speed: 15, stamina: 10, physical: 45, tech: 30 }, // 제공권과 몸싸움
  GK:  { speed:  5, stamina:  5, physical: 25, tech: 65 }, // 손과 반응
};

// ── 포지션 계열 ────────────────────────────────────────────────
//  전혀 다른 자리로 옮기는 것과, 비슷한 자리로 옮기는 것을 구분합니다.
//  측면 수비수가 측면 공격을 보는 건 흔하지만,
//  중앙 수비수가 윙어를 보는 건 드뭅니다.
const FAMILY = {
  ST: "front", LW: "wide", RW: "wide", CAM: "center", CM: "center",
  LB: "wide", RB: "wide", CB: "back", GK: "keeper",
};

// 계열이 달라도 서로 통하는 조합 (양방향)
const NEIGHBOR = [
  ["front", "center"],  // ST ↔ CAM/CM — 내려와 연계하는 유형
  ["wide", "front"],    // 윙 ↔ ST
  ["center", "back"],   // CM ↔ CB — 수비형 미드가 내려서는 경우
  ["wide", "center"],   // 윙백 ↔ 중앙 미드
];

// ── 보정값 ─────────────────────────────────────────────────────
const PREF_BONUS   = 12; // 본인이 뛰던 자리
const FAMILY_BONUS =  5; // 같은 계열
const NEIGHBOR_BNS =  2; // 통하는 계열
const OFF_PENALTY  = -8; // 전혀 다른 계열

// 전문 능력을 모르는 포지션에서는 tech 값을 평균 쪽으로 끌어당깁니다.
// ST로 입력한 선수의 "결정력 87"이 CB의 "빌드업 87"을 뜻하지는 않기 때문입니다.
// 값을 버리지도, 그대로 믿지도 않는 절충입니다.
const TECH_TRUST = 0.6;
const TECH_BASE  = 65;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function techFor(player, pos) {
  const raw = player.techScore ?? TECH_BASE;
  if (player.prefPos === pos) return raw;              // 직접 답한 자리
  return raw * TECH_TRUST + TECH_BASE * (1 - TECH_TRUST); // 추정
}

function familyFit(prefPos, pos) {
  if (!prefPos) return 0;
  const a = FAMILY[prefPos], b = FAMILY[pos];
  if (a === b) return FAMILY_BONUS;
  if (NEIGHBOR.some(([x, y]) => (a === x && b === y) || (a === y && b === x))) return NEIGHBOR_BNS;
  return OFF_PENALTY;
}

// ── 선수 한 명을 특정 자리에 뒀을 때의 점수 ────────────────────
//  player 는 { speed, stamina, physical, techScore, prefPos } 형태의
//  이미 숫자로 환산된 값입니다. (App.jsx 의 toLineupPlayer 가 만듭니다)
export function posScore(player, pos) {
  // 골키퍼는 오가지 않습니다. 손으로 하는 일이라 필드 능력과 종류가 다릅니다.
  if (pos === "GK" && player.prefPos !== "GK") return -Infinity;
  if (pos !== "GK" && player.prefPos === "GK") return -Infinity;

  const w = POS_WEIGHTS[pos];
  const base =
    (player.speed    * w.speed +
     player.stamina  * w.stamina +
     player.physical * w.physical +
     techFor(player, pos) * w.tech) / 100;

  const bonus =
    (player.prefPos === pos ? PREF_BONUS : 0) +
    (player.prefPos === pos ? 0 : familyFit(player.prefPos, pos));

  return clamp(base + bonus, 0, 120);
}

// ═══════════════════════════════════════════════════════════════
//  헝가리안 알고리즘 — 최적 배치를 찾는 표준 방법
//
//  11명을 11자리에 놓는 경우의 수는 약 4천만 가지입니다.
//  전부 해보지 않고도 총점이 가장 높은 조합을 찾아냅니다.
//  (e-maxx 의 O(n³) 구현. 최소 비용 기준이라 점수를 뒤집어 넣습니다)
// ═══════════════════════════════════════════════════════════════
export function hungarian(cost) {
  const n = cost.length;
  if (!n) return [];
  const m = cost[0].length;
  const INF = Infinity;
  const u = new Array(n + 1).fill(0);
  const v = new Array(m + 1).fill(0);
  const p = new Array(m + 1).fill(0);
  const way = new Array(m + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(m + 1).fill(INF);
    const used = new Array(m + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = INF, j1 = 0;
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }

  const assign = new Array(n).fill(-1);
  for (let j = 1; j <= m; j++) if (p[j] > 0) assign[p[j] - 1] = j - 1;
  return assign; // assign[선수 index] = 자리 index
}

// ═══════════════════════════════════════════════════════════════
//  포메이션 — 포지션 종류는 기존 9개를 재배열해 씁니다.
//  그래야 이미 써둔 포지션별 역할 가이드를 그대로 쓸 수 있습니다.
//  x, y 는 피치 위 백분율 좌표입니다 (y가 작을수록 상대 골대 쪽).
// ═══════════════════════════════════════════════════════════════
export const FORMATIONS = [
  {
    key: "4231", name: "4-2-3-1", label: "균형형",
    desc: "2선 공격형 미드필더가 경기를 만드는 가장 표준적인 형태",
    slots: [
      { id: 1,  pos: "ST",  x: 50, y: 8  },
      { id: 2,  pos: "LW",  x: 18, y: 25 },
      { id: 3,  pos: "CAM", x: 50, y: 25 },
      { id: 4,  pos: "RW",  x: 82, y: 25 },
      { id: 5,  pos: "CM",  x: 32, y: 45 },
      { id: 6,  pos: "CM",  x: 68, y: 45 },
      { id: 7,  pos: "LB",  x: 10, y: 65 },
      { id: 8,  pos: "CB",  x: 33, y: 65 },
      { id: 9,  pos: "CB",  x: 67, y: 65 },
      { id: 10, pos: "RB",  x: 90, y: 65 },
      { id: 11, pos: "GK",  x: 50, y: 84 },
    ],
  },
  {
    key: "433", name: "4-3-3", label: "중원 장악형",
    desc: "중원 3명이 두껍게 받치고 윙이 전방에서 폭을 넓히는 형태",
    slots: [
      { id: 1,  pos: "ST",  x: 50, y: 8  },
      { id: 2,  pos: "LW",  x: 16, y: 14 },
      { id: 3,  pos: "RW",  x: 84, y: 14 },
      { id: 4,  pos: "CM",  x: 50, y: 33 },
      { id: 5,  pos: "CM",  x: 28, y: 45 },
      { id: 6,  pos: "CM",  x: 72, y: 45 },
      { id: 7,  pos: "LB",  x: 10, y: 65 },
      { id: 8,  pos: "CB",  x: 33, y: 65 },
      { id: 9,  pos: "CB",  x: 67, y: 65 },
      { id: 10, pos: "RB",  x: 90, y: 65 },
      { id: 11, pos: "GK",  x: 50, y: 84 },
    ],
  },
  {
    key: "352", name: "3-5-2", label: "중앙 집중형",
    desc: "수비를 셋으로 줄이고 중원을 다섯으로 늘려 중앙을 장악하는 형태",
    slots: [
      { id: 1,  pos: "ST",  x: 36, y: 9  },
      { id: 2,  pos: "ST",  x: 64, y: 9  },
      { id: 3,  pos: "CAM", x: 50, y: 30 },
      { id: 4,  pos: "LB",  x: 10, y: 38 }, // 윙백 — 측면을 혼자 전담
      { id: 5,  pos: "RB",  x: 90, y: 38 },
      { id: 6,  pos: "CM",  x: 34, y: 48 },
      { id: 7,  pos: "CM",  x: 66, y: 48 },
      { id: 8,  pos: "CB",  x: 25, y: 68 },
      { id: 9,  pos: "CB",  x: 50, y: 70 },
      { id: 10, pos: "CB",  x: 75, y: 68 },
      { id: 11, pos: "GK",  x: 50, y: 84 },
    ],
  },
];

// ── 명단 하나를 특정 포메이션에 최적 배치 ──────────────────────
//
//  BIG    — 점수(높을수록 좋음)를 비용(낮을수록 좋음)으로 뒤집는 기준값
//  FORBID — 골키퍼처럼 "절대 안 되는" 배정에 매기는 비용.
//           한 판의 총비용(약 11만)보다 훨씬 커야 합니다. 그래야 다른 자리에서
//           아무리 이득을 봐도 금지된 배정을 고르는 일이 생기지 않습니다.
const BIG = 1e4;
const FORBID = 1e7;

export function bestLineup(players, formation) {
  const slots = formation.slots;
  const n = players.length, m = slots.length;
  if (n < m) return null; // 인원 부족

  // 헝가리안은 정사각 행렬에서만 완전 매칭을 찾습니다.
  // 선수가 자리보다 많으면 "벤치"라는 가상의 자리를 채워 정사각으로 만듭니다.
  // (이 처리가 없으면 12명부터 알고리즘이 끝나지 않습니다)
  const size = Math.max(n, m);
  const cost = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      if (i >= n || j >= m) { row.push(0); continue; } // 가상 선수 · 가상 자리(벤치)
      const sc = posScore(players[i], slots[j].pos);
      row.push(sc === -Infinity ? FORBID : BIG - sc);
    }
    cost.push(row);
  }

  const assign = hungarian(cost);

  const placements = [];
  let total = 0, impossible = false;
  for (let playerIdx = 0; playerIdx < n; playerIdx++) {
    const slotIdx = assign[playerIdx];
    if (slotIdx < 0 || slotIdx >= m) continue; // 벤치
    const slot = slots[slotIdx], player = players[playerIdx];
    const sc = posScore(player, slot.pos);
    if (sc === -Infinity) { impossible = true; continue; }
    placements.push({
      slotId: slot.id, pos: slot.pos, x: slot.x, y: slot.y,
      player,
      score: Math.round(sc),
      onPref: player.prefPos === slot.pos,
    });
    total += sc;
  }

  if (impossible || placements.length < m) return null;

  placements.sort((a, b) => a.slotId - b.slotId);
  const benched = players.filter((_, i) => assign[i] < 0 || assign[i] >= m);

  return {
    formation,
    placements,
    benched,
    total: Math.round(total),
    avg: Math.round(total / m),
    movedCount: placements.filter(p => !p.onPref).length,
  };
}

// ── 코치가 선호하는 형태 ───────────────────────────────────────
//
//  전술 추천에서 쓴 방식과 같습니다 — 코치의 취향은 측정되는 값이 아니므로
//  계산으로 위장하지 않고 고정값으로 두고 화면에 "성향"이라 밝힙니다.
//
//  공격파는 4-3-3을 밉니다. 전방 세 명이 그대로 압박 시작점이 되기 때문입니다.
//  수비파는 4-2-3-1을 밉니다. 중앙 미드 둘이 뒷공간을 받쳐주기 때문입니다.
//  3-5-2는 윙백을 어떻게 쓰느냐에 따라 공격도 수비도 되므로 어느 쪽도 밀지 않습니다.
export const COACH_FORMATION_BIAS = {
  textbook: { "4231":   0, "433":   0, "352": 0 },
  attack:   { "4231":  -5, "433":  20, "352": 0 },
  defense:  { "4231":  12, "433": -15, "352": 0 },
};

export const COACH_FORMATION_WHY = {
  attack: {
    "433":  "전방 세 명이 그대로 압박 시작점이 됩니다.",
    "4231": "중앙 미드 둘이 뒤에 남는 건 소극적이라고 봅니다.",
    "352":  "윙백이 올라가 준다면 반대하지 않습니다.",
  },
  defense: {
    "4231": "중앙 미드 둘이 뒷공간을 받쳐줍니다.",
    "433":  "윙이 높이 서면 뒷공간이 열린다고 봅니다.",
    "352":  "윙백만 관리되면 쓸 만하다고 봅니다.",
  },
  textbook: {
    "4231": "계산 결과를 그대로 따릅니다.",
    "433":  "계산 결과를 그대로 따릅니다.",
    "352":  "계산 결과를 그대로 따릅니다.",
  },
};

// ── 세 포메이션을 모두 계산 ────────────────────────────────────
//
//  데이터가 고른 순서와 코치가 고른 순서를 둘 다 돌려줍니다.
//  코치가 순위를 갈아치우면 "그럼 계산은 뭘 믿나"가 되므로,
//  화면에서 둘을 나란히 보여주기 위함입니다.
export function rankFormations(players, coachId) {
  const results = FORMATIONS.map(f => bestLineup(players, f)).filter(Boolean);
  if (!results.length) return null;

  const bias = COACH_FORMATION_BIAS[coachId] || COACH_FORMATION_BIAS.textbook;
  const why = COACH_FORMATION_WHY[coachId] || COACH_FORMATION_WHY.textbook;

  results.forEach(r => {
    r.bias = bias[r.formation.key] ?? 0;
    r.coachTotal = r.total + r.bias;
    r.coachWhy = why[r.formation.key] || "";
  });

  const byData  = [...results].sort((a, b) => b.total - a.total);
  const byCoach = [...results].sort((a, b) => b.coachTotal - a.coachTotal);
  return { byData, byCoach, dataPick: byData[0], coachPick: byCoach[0] };
}
