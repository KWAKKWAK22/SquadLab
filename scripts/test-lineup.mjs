// 라인업 계산 검증
//   1) 헝가리안이 정말 최적해를 내는가 — 전수 탐색과 대조
//   2) 실제 선수 같은 값을 넣었을 때 배치가 말이 되는가
//
// 실행: node scripts/test-lineup.mjs

import fs from "fs";

// src/lineup.js 는 CRA용 ES 모듈이라 그대로는 node가 못 읽습니다.
// 내용을 data URL 로 감싸 import 합니다.
const src = fs.readFileSync(new URL("../src/lineup.js", import.meta.url), "utf8");
const mod = await import("data:text/javascript;base64," + Buffer.from(src).toString("base64"));
const { hungarian, posScore, bestLineup, rankFormations, FORMATIONS, POS_WEIGHTS } = mod;

let pass = 0, fail = 0;
const ok = (cond, label, extra = "") => {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label} ${extra}`); }
};

// ─────────────────────────────────────────────────────────────
console.log("\n[1] 헝가리안 — 전수 탐색과 대조");
// ─────────────────────────────────────────────────────────────

function bruteForceMin(cost) {
  const n = cost.length;
  const idx = [...Array(n).keys()];
  let best = Infinity;
  const permute = (arr, k) => {
    if (k === arr.length) {
      let s = 0;
      for (let i = 0; i < n; i++) s += cost[i][arr[i]];
      if (s < best) best = s;
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  permute(idx, 0);
  return best;
}

const sumOf = (cost, assign) => assign.reduce((s, j, i) => s + cost[i][j], 0);

// 손으로 답을 아는 작은 예
const tiny = [[4, 1, 3], [2, 0, 5], [3, 2, 2]];
{
  const a = hungarian(tiny);
  ok(sumOf(tiny, a) === 5, "3×3 알려진 최소비용 5", `→ ${sumOf(tiny, a)}`);
}

// 무작위 행렬 200개를 전수 탐색과 대조
{
  let mismatch = 0, worstGap = 0;
  for (let t = 0; t < 200; t++) {
    const n = 3 + (t % 5); // 3~7
    const cost = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => Math.floor(Math.random() * 100))
    );
    const a = hungarian(cost);
    const got = sumOf(cost, a);
    const want = bruteForceMin(cost);
    if (got !== want) { mismatch++; worstGap = Math.max(worstGap, got - want); }
    // 배정이 순열인지도 확인
    if (new Set(a).size !== n || a.some(j => j < 0)) mismatch++;
  }
  ok(mismatch === 0, "무작위 200개(3~7칸) 전부 최적해 일치", `불일치 ${mismatch}건, 최대 차이 ${worstGap}`);
}

// 11×11 성능
{
  const cost = Array.from({ length: 11 }, () =>
    Array.from({ length: 11 }, () => Math.floor(Math.random() * 1000))
  );
  const t0 = Date.now();
  for (let i = 0; i < 1000; i++) hungarian(cost);
  const ms = Date.now() - t0;
  ok(ms < 1000, `11×11 을 1000번 푸는 데 ${ms}ms`, "");
}

// ─────────────────────────────────────────────────────────────
console.log("\n[2] 포지션 점수 — 상식에 맞는가");
// ─────────────────────────────────────────────────────────────

const mk = (o) => ({ speed: 65, stamina: 65, physical: 65, techScore: 65, prefPos: "CM", ...o });

{
  // 느리고 큰 선수 vs 빠르고 작은 선수
  const big   = mk({ speed: 45, physical: 92, prefPos: "CB" });
  const quick = mk({ speed: 90, physical: 45, prefPos: "LW" });
  ok(posScore(big, "CB") > posScore(quick, "CB"), "덩치 큰 선수가 CB에서 더 높다");
  ok(posScore(quick, "LW") > posScore(big, "LW"), "빠른 선수가 LW에서 더 높다");
  ok(posScore(quick, "LW") > posScore(quick, "CB"), "빠른 선수는 LW가 CB보다 높다");
}

{
  // 골키퍼는 오가지 않는다
  const gk = mk({ prefPos: "GK" });
  const field = mk({ prefPos: "CM" });
  ok(posScore(field, "GK") === -Infinity, "필드 선수는 GK 자리에 못 간다");
  ok(posScore(gk, "CM") === -Infinity, "GK 는 필드로 안 나간다");
  ok(posScore(gk, "GK") > 0, "GK 는 GK 자리에서 점수가 난다");
}

{
  // 같은 능력이면 원래 자리가 유리해야 한다
  const a = mk({ prefPos: "CM" });
  ok(posScore(a, "CM") > posScore(a, "CB"), "선호 자리 보너스가 실제로 작동한다");
}

{
  // 전문 능력 추정 — 다른 자리로 가면 tech 가 평균 쪽으로 당겨진다
  const star = mk({ techScore: 95, prefPos: "CAM" });
  const dull = mk({ techScore: 30, prefPos: "CAM" });
  const gapHome = posScore(star, "CAM") - posScore(dull, "CAM");
  const gapAway = posScore(star, "CB") - posScore(dull, "CB");
  ok(gapHome > gapAway, "낯선 자리에서는 기술 격차가 줄어든다(추정 반영)", `${gapHome.toFixed(1)} vs ${gapAway.toFixed(1)}`);
}

// ─────────────────────────────────────────────────────────────
console.log("\n[2-b] 포지션 이동이 축구적으로 말이 되는가");
// ─────────────────────────────────────────────────────────────

{
  const { moveDistance } = mod;
  const POSITIONS = ["ST","LW","RW","CAM","CM","LB","RB","CB"];

  // 표가 대칭이어야 합니다 — A→B 와 B→A 가 다르면 배치가 방향에 따라 흔들립니다
  let asym = [];
  for (const a of POSITIONS) for (const b of POSITIONS) {
    if (moveDistance(a, b) !== moveDistance(b, a)) asym.push(`${a}/${b}`);
  }
  ok(asym.length === 0, "이동 표가 대칭이다", asym.slice(0, 5).join(", "));
  ok(POSITIONS.every(p => moveDistance(p, p) === 0), "자기 자리 거리는 0");

  const cam = mk({ prefPos: "CAM" });
  const wing = mk({ prefPos: "LW" });

  // 감독 피드백: 공미가 3-5-2에서 우측 센터백으로 가던 문제
  ok(posScore(cam, "CB") < posScore(cam, "CM") - 20,
     "공미를 센터백에 두는 건 중앙 미드보다 훨씬 낮다",
     `CB ${posScore(cam,"CB").toFixed(1)} vs CM ${posScore(cam,"CM").toFixed(1)}`);
  ok(posScore(cam, "CB") < posScore(cam, "LW") - 10,
     "공미는 센터백보다 차라리 윙이 낫다",
     `CB ${posScore(cam,"CB").toFixed(1)} vs LW ${posScore(cam,"LW").toFixed(1)}`);

  // 감독 피드백: 측면 자원의 윙 ↔ 윙백은 열려 있어야 한다
  ok(posScore(wing, "LB") > posScore(wing, "CM"),
     "윙어는 윙백으로 가는 편이 중앙 미드보다 자연스럽다",
     `LB ${posScore(wing,"LB").toFixed(1)} vs CM ${posScore(wing,"CM").toFixed(1)}`);
  ok(posScore(wing, "LB") > posScore(wing, "CB") + 20,
     "윙어는 중앙 수비로는 잘 안 간다",
     `LB ${posScore(wing,"LB").toFixed(1)} vs CB ${posScore(wing,"CB").toFixed(1)}`);

  // 중앙 미드가 내려서는 건 여전히 가능해야 합니다
  const cm = mk({ prefPos: "CM" });
  ok(moveDistance("CM", "CB") < moveDistance("CAM", "CB"),
     "수비형으로 내려서는 건 중앙 미드가 공미보다 가깝다");
}

// ─────────────────────────────────────────────────────────────
console.log("\n[3] 실제 명단으로 배치");
// ─────────────────────────────────────────────────────────────

// 포지션이 뚜렷한 11명 (자기 자리가 정답이어야 함)
const clean = [
  mk({ prefPos: "GK",  techScore: 80, physical: 75 }),
  mk({ prefPos: "CB",  physical: 90, speed: 50 }),
  mk({ prefPos: "CB",  physical: 88, speed: 52 }),
  mk({ prefPos: "LB",  speed: 78, stamina: 85 }),
  mk({ prefPos: "RB",  speed: 76, stamina: 84 }),
  mk({ prefPos: "CM",  stamina: 90, techScore: 75 }),
  mk({ prefPos: "CM",  stamina: 88, techScore: 72 }),
  mk({ prefPos: "CAM", techScore: 92, speed: 62 }),
  mk({ prefPos: "LW",  speed: 92, techScore: 78 }),
  mk({ prefPos: "RW",  speed: 90, techScore: 76 }),
  mk({ prefPos: "ST",  physical: 85, techScore: 82 }),
];

{
  const f4231 = FORMATIONS.find(f => f.key === "4231");
  const r = bestLineup(clean, f4231);
  ok(r !== null, "4-2-3-1 배치 성공");
  if (r) {
    const moved = r.placements.filter(p => !p.onPref);
    ok(moved.length === 0, "포지션이 뚜렷한 팀은 전원 제자리", `이동 ${moved.length}명: ${moved.map(p => `${p.player.prefPos}→${p.pos}`).join(", ")}`);
    console.log(`    총점 ${r.total} / 평균 ${r.avg}`);
  }
}

{
  // 세 포메이션 순위
  const ranked = rankFormations(clean, "textbook");
  ok(ranked.byData.length === 3, "세 포메이션 모두 계산됨");
  console.log("    " + ranked.byData.map(r => `${r.formation.name} ${r.total}점(이동 ${r.movedCount}명)`).join(" · "));
  ok(ranked.byData[0].total >= ranked.byData[1].total && ranked.byData[1].total >= ranked.byData[2].total, "점수 내림차순 정렬");
  ok(ranked.byData[0].formation.key === ranked.byCoach[0].formation.key, "정석파는 데이터 추천과 언제나 같다");
  ok(ranked.byData.every(r => r.bias === 0), "정석파는 보정이 전부 0");
}

{
  // 윙어가 없는 팀 — 4-3-3 이나 4-2-3-1 은 누군가를 윙에 세워야 한다
  const noWings = [
    mk({ prefPos: "GK", techScore: 80 }),
    mk({ prefPos: "CB", physical: 90 }), mk({ prefPos: "CB", physical: 88 }), mk({ prefPos: "CB", physical: 85 }),
    mk({ prefPos: "CM", stamina: 90 }), mk({ prefPos: "CM", stamina: 88 }), mk({ prefPos: "CM", stamina: 86 }),
    mk({ prefPos: "CAM", techScore: 90 }),
    mk({ prefPos: "ST", physical: 84 }), mk({ prefPos: "ST", physical: 82 }),
    mk({ prefPos: "LB", speed: 80, stamina: 86 }),
  ];
  const ranked = rankFormations(noWings, "textbook");
  console.log("    윙어 없는 팀: " + ranked.byData.map(r => `${r.formation.name} ${r.total}점(이동 ${r.movedCount}명)`).join(" · "));
  ok(ranked.byData[0].formation.key === "352", "윙어 없고 CB·CM 많은 팀에는 3-5-2 가 1순위", `→ ${ranked.byData[0].formation.name}`);
}

// ─────────────────────────────────────────────────────────────
console.log("\n[4] 코치 성향이 포메이션 추천을 바꾸는가");
// ─────────────────────────────────────────────────────────────

{
  const tb  = rankFormations(clean, "textbook");
  const atk = rankFormations(clean, "attack");
  const def = rankFormations(clean, "defense");

  const line = (r) => r.byCoach.map(x => `${x.formation.name} ${x.total}${x.bias >= 0 ? "+" : ""}${x.bias}=${x.coachTotal}`).join(" · ");
  console.log(`    정석파: ${line(tb)}`);
  console.log(`    공격파: ${line(atk)}`);
  console.log(`    수비파: ${line(def)}`);

  ok(tb.coachPick.formation.key === tb.dataPick.formation.key, "정석파 추천 = 데이터 추천");
  ok(atk.byCoach.find(r => r.formation.key === "433").bias === 20, "공격파는 4-3-3 에 +20");
  ok(def.byCoach.find(r => r.formation.key === "433").bias === -15, "수비파는 4-3-3 에 −15");
  ok(atk.byData[0].total === def.byData[0].total, "데이터 점수 자체는 코치와 무관하게 동일");

  // 데이터 1순위가 4-2-3-1(976) 이고 4-3-3 이 960 이므로,
  // 공격파의 +20 은 순위를 뒤집을 수 있어야 합니다. 그게 이 기능의 존재 이유입니다.
  ok(atk.coachPick.formation.key === "433", "공격파는 4-3-3 으로 갈아탄다", `→ ${atk.coachPick.formation.name}`);
  ok(def.coachPick.formation.key === "4231", "수비파는 4-2-3-1 을 지킨다", `→ ${def.coachPick.formation.name}`);
}

{
  // 인원 부족
  const short = clean.slice(0, 9);
  ok(bestLineup(short, FORMATIONS[0]) === null, "9명이면 배치 불가(null)");
}

{
  // 골키퍼가 없으면 배치 불가여야 한다
  const noGk = clean.filter(p => p.prefPos !== "GK").concat([mk({ prefPos: "CM" })]);
  ok(bestLineup(noGk, FORMATIONS[0]) === null, "골키퍼가 없으면 배치 불가(null)");
}

{
  // 12명 이상 — 한 명은 벤치로
  const twelve = [...clean, mk({ prefPos: "ST", physical: 60, techScore: 55 })];
  const r = bestLineup(twelve, FORMATIONS.find(f => f.key === "4231"));
  ok(r && r.benched.length === 1, "12명이면 1명이 벤치로 남는다", `벤치 ${r?.benched.length}`);
  ok(r && r.placements.length === 11, "선발은 정확히 11명");
  // 벤치에 남은 사람이 더 약한 ST 여야 한다
  const strongST = clean.find(p => p.prefPos === "ST");
  ok(r && r.benched[0].techScore === 55, "더 약한 쪽이 벤치로 간다", `벤치 techScore ${r?.benched[0]?.techScore}`);
}

{
  // 골키퍼 지원자가 둘인 경우 — 한 명은 벤치로 가야 한다
  const twoGk = [...clean, mk({ prefPos: "GK", techScore: 60, physical: 65 })];
  const r = bestLineup(twoGk, FORMATIONS.find(f => f.key === "4231"));
  ok(r !== null, "골키퍼가 둘이어도 배치된다");
  if (r) {
    const gkSlot = r.placements.find(p => p.pos === "GK");
    ok(gkSlot?.player.prefPos === "GK", "골문에는 GK 입력 선수가 선다");
    ok(gkSlot?.player.techScore === 80, "둘 중 나은 GK 가 선발", `→ ${gkSlot?.player.techScore}`);
    ok(r.benched.length === 1 && r.benched[0].prefPos === "GK", "나머지 GK 는 벤치");
    ok(r.placements.every(p => p.pos === "GK" || p.player.prefPos !== "GK"), "GK 가 필드로 나가지 않는다");
  }
}

{
  // 금지 배정이 다른 이득에 밀리지 않는지 — 필드 자원을 일부러 약하게 만든다
  const weakField = [
    mk({ prefPos: "GK", techScore: 88, physical: 80 }),
    ...Array.from({ length: 10 }, (_, i) =>
      mk({ prefPos: ["CB","CB","LB","RB","CM","CM","CAM","LW","RW","ST"][i], speed: 40, stamina: 40, physical: 40, techScore: 40 })
    ),
  ];
  const r = bestLineup(weakField, FORMATIONS.find(f => f.key === "4231"));
  ok(r !== null, "필드가 약해도 배치는 된다");
  ok(r && r.placements.find(p => p.pos === "GK")?.player.prefPos === "GK", "약한 필드여도 GK 자리가 뒤바뀌지 않는다");
}

// ─────────────────────────────────────────────────────────────
console.log(`\n결과: ${pass}개 통과, ${fail}개 실패\n`);
process.exit(fail ? 1 : 0);
