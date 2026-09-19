// 포메이션 점수에 편향이 있는지 재는 검사
//
// 의심: 선수를 4-2-3-1 자리에 입력했으니, 4-2-3-1 배치에서만 전원이
//       "원래 자리" 보너스를 받아 그 포메이션이 구조적으로 유리한 것 아닌가.
//
// 실행: node scripts/test-bias.mjs

import fs from "fs";
const src = fs.readFileSync(new URL("../src/lineup.js", import.meta.url), "utf8");
const mod = await import("data:text/javascript;base64," + Buffer.from(src).toString("base64"));
const { rankFormations, posScore } = mod;

// 능력치를 전부 똑같이 준 선수들.
// 이렇게 하면 점수 차이는 오로지 "어느 자리에 입력했는가"에서만 나옵니다.
const flat = (prefPos) => ({ speed: 70, stamina: 70, physical: 70, techScore: 70, prefPos });

const SQUADS = {
  "4-2-3-1 자리로 입력": ["GK","LB","CB","CB","RB","CM","CM","LW","CAM","RW","ST"],
  "4-3-3 자리로 입력":   ["GK","LB","CB","CB","RB","CM","CM","CM","LW","RW","ST"],
  "3-5-2 자리로 입력":   ["GK","CB","CB","CB","LB","RB","CM","CM","CAM","ST","ST"],
};

console.log("\n같은 능력치(전원 70)로, 입력한 자리만 바꿔서 비교합니다.");
console.log("편향이 없다면 어느 쪽으로 입력해도 순위가 비슷해야 합니다.\n");

const rows = [];
for (const [label, positions] of Object.entries(SQUADS)) {
  const squad = positions.map(flat);
  const r = rankFormations(squad, "textbook");
  const line = r.byData.map(x => `${x.formation.name} ${x.total}`).join("  ");
  const winner = r.byData[0].formation.name;
  rows.push({ label, winner, line, moved: r.byData[0].movedCount });
  console.log(`  ${label}`);
  console.log(`    ${line}`);
  console.log(`    1순위: ${winner} (이동 ${r.byData[0].movedCount}명)\n`);
}

const allSame = rows.every(r => r.winner === rows[0].winner);
console.log(allSame
  ? "  → 입력 자리와 무관하게 같은 포메이션이 1순위입니다."
  : "  → 입력한 자리의 포메이션이 그대로 1순위가 됩니다. 편향이 있습니다.");

// ── 부포지션을 받으면 편향이 줄어드는가 ──────────────────────
console.log("\n같은 명단에 부포지션을 달아주면 어떻게 달라지나:");

// 실제 동호회처럼, 한 명이 두세 자리를 보는 명단
const withSubs = (positions, subsMap) =>
  positions.map(p => ({ ...flat(p), subPos: subsMap[p] || [] }));

const SUBS = {
  ST:  ["CAM"],            // 내려와 연계도 함
  LW:  ["RW", "LB"],       // 좌우 다 서고 윙백도 봄
  RW:  ["LW", "RB"],
  CAM: ["CM", "ST"],       // 한 칸 내려가거나 올라감
  CM:  ["CAM", "CB"],      // 수비형으로도 내려섬
  LB:  ["LW", "CB"],
  RB:  ["RW", "CB"],
  CB:  ["CM"],
  GK:  [],
};

const spread = [];
for (const [label, positions] of Object.entries(SQUADS)) {
  const r = rankFormations(withSubs(positions, SUBS), "textbook");
  const totals = r.byData.map(x => x.total);
  const gap = totals[0] - totals[totals.length - 1];
  spread.push({ label, winner: r.byData[0].formation.name, gap });
  console.log(`  ${label.padEnd(18)} ${r.byData.map(x => `${x.formation.name} ${x.total}`).join("  ")}   (1등-꼴등 ${gap})`);
}

// 부포지션이 없을 때의 격차와 비교
const bareGaps = Object.values(SQUADS).map(positions => {
  const r = rankFormations(positions.map(flat), "textbook");
  const t = r.byData.map(x => x.total);
  return t[0] - t[t.length - 1];
});
const avg = a => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
const bare = avg(bareGaps), withs = avg(spread.map(s => s.gap));
console.log(`\n  입력 포메이션이 벌리는 격차(평균)  부포지션 없음 ${bare}  →  있음 ${withs}`);
console.log(withs < bare
  ? `  → 부포지션이 편향을 ${Math.round((1 - withs / bare) * 100)}% 줄였습니다.`
  : "  → 부포지션이 편향을 줄이지 못했습니다.");

// 얼마나 큰 편향인지 — 같은 선수단에서 "제자리 배치"와 "한 명 이동"의 점수 차
console.log("\n보너스 구조가 만드는 차이:");
const p = flat("CAM");
console.log(`  같은 선수를 CAM 에 두면 ${posScore(p, "CAM").toFixed(1)}`);
console.log(`  CM 에 두면              ${posScore(p, "CM").toFixed(1)}   (차이 ${(posScore(p,"CAM")-posScore(p,"CM")).toFixed(1)})`);
console.log(`  CB 에 두면              ${posScore(p, "CB").toFixed(1)}   (차이 ${(posScore(p,"CAM")-posScore(p,"CB")).toFixed(1)})`);
console.log(`  LW 에 두면              ${posScore(p, "LW").toFixed(1)}   (차이 ${(posScore(p,"CAM")-posScore(p,"LW")).toFixed(1)})`);

console.log("\n축구적으로 말이 되는지 — 공격형 미드필더를 어디에 둘 수 있나:");
for (const pos of ["CAM","CM","ST","LW","RW","LB","RB","CB"]) {
  const s = posScore(p, pos);
  console.log(`  CAM → ${pos.padEnd(4)} ${s.toFixed(1)}`);
}

console.log("\n측면 자원은 어떤가 — 윙어를 어디에 둘 수 있나:");
const w = flat("LW");
for (const pos of ["LW","RW","LB","RB","ST","CAM","CM","CB"]) {
  console.log(`  LW  → ${pos.padEnd(4)} ${posScore(w, pos).toFixed(1)}`);
}
console.log("");
