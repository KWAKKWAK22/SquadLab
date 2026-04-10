import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// 상수 & 데이터
// ═══════════════════════════════════════════════════════════════

const FORMATION_4231 = [
  { id: 1, pos: "ST", x: 50, y: 8 },
  { id: 2, pos: "LW", x: 18, y: 25 },
  { id: 3, pos: "CAM", x: 50, y: 25 },
  { id: 4, pos: "RW", x: 82, y: 25 },
  { id: 5, pos: "CM", x: 32, y: 45 },
  { id: 6, pos: "CM", x: 68, y: 45 },
  { id: 7, pos: "LB", x: 10, y: 65 },
  { id: 8, pos: "CB", x: 33, y: 65 },
  { id: 9, pos: "CB", x: 67, y: 65 },
  { id: 10, pos: "RB", x: 90, y: 65 },
  { id: 11, pos: "GK", x: 50, y: 84 },
];

const FOOT_OPTIONS = ["왼발", "오른발", "양발"];

const PHYSICAL_STATS = [
  { key: "speed", label: "속도 / 기동력", icon: "⚡", levels: [{ value: "하", desc: "조깅 페이스" }, { value: "중", desc: "빠른 편" }, { value: "상", desc: "팀 내 최상위권" }] },
  { key: "stamina", label: "지구력 / 활동량", icon: "🫀", levels: [{ value: "하", desc: "후반 급격히 처짐" }, { value: "중", desc: "90분 무난히 소화" }, { value: "상", desc: "후반에도 스프린트 가능" }] },
  { key: "physical", label: "피지컬 / 제공권", icon: "💪", levels: [{ value: "하", desc: "몸싸움 회피" }, { value: "중", desc: "버티는 편" }, { value: "상", desc: "적극적 몸싸움 우위" }] },
];

const TECH_STATS = [
  { key: "kick", label: "킥 / 패스", icon: "🎯" },
  { key: "dribble", label: "드리블 / 탈압박", icon: "⚽" },
  { key: "shooting", label: "슈팅 / 결정력", icon: "🥅" },
  { key: "defense", label: "수비 / 태클", icon: "🛡️" },
];
const TECH_LEVELS = ["약함", "보통", "강함"];

const STYLE_OPTIONS = {
  attack: { label: "공격 참여도", tags: ["수비형", "밸런스형", "공격형"] },
  defense: { label: "수비 참여도", tags: ["최전방압박", "중간라인유지", "후방대기"] },
  movement: { label: "선호 움직임", tags: ["공간침투", "연계플레이", "키핑볼", "오버래핑", "포스트플레이"], multi: true },
  risk: { label: "위험 감수", tags: ["안전제일", "상황따라", "과감한플레이"] },
};

const MENTAL_TAGS = ["팀 분위기 메이커", "묵묵히 제 역할", "경기 조율형"];
const EXP_TAGS = ["축구 처음", "동네 축구", "동호인 리그 경험", "엘리트 경험"];

const STAT_SCORE = { 하: 45, 중: 68, 상: 88 };
const TECH_SCORE = { 약함: 42, 보통: 65, 강함: 87 };

const PLAYER_COMPARISONS = {
  GK: { name: "알리송 베커", club: "리버풀", color: "#1a3a6b", accent: "#f0c040" },
  LW: { name: "킬리안 음바페", club: "레알 마드리드", color: "#003087", accent: "#ffd700" },
  CAM: { name: "마르틴 외데고르", club: "아스널", color: "#ef0107", accent: "#ffffff" },
  RW: { name: "모하메드 살라", club: "리버풀", color: "#1a3a6b", accent: "#f0c040" },
  CM: { name: "케빈 데브라위너", club: "맨체스터 시티", color: "#6cabdd", accent: "#ffffff" },
  LB: { name: "앤드류 로버트슨", club: "리버풀", color: "#1a3a6b", accent: "#f0c040" },
  CB: { name: "버질 판다이크", club: "리버풀", color: "#1a3a6b", accent: "#f0c040" },
  RB: { name: "트렌트 알렉산더-아놀드", club: "레알 마드리드", color: "#003087", accent: "#ffd700" },
  ST: { name: "에를링 홀란드", club: "맨체스터 시티", color: "#6cabdd", accent: "#ffffff" },
};

const ROLE_GUIDES = {
  ST: { role: "최전방 타깃 & 마무리", color: "#ef4444", tasks: ["수비 시 상대 CB 압박으로 빌드업 방해", "역습 발동 시 빠르게 앞으로 달려 깊이 확보", "크로스 및 2선 패스 침투 후 결정적 마무리"], keyAction: "공간 침투 타이밍", focus: "수비→공격 전환 시 즉시 스프린트", tip: "역습 시 오프사이드 트랩 주의, 라인 체크 필수" },
  LW: { role: "좌측 역습 가담 & 돌파", color: "#f59e0b", tasks: ["수비 시 좌측 미드필드 라인 유지", "볼 탈취 즉시 중앙 또는 ST 향해 빠른 전진", "좌측 공간에서 1대1 돌파 후 크로스/슈팅"], keyAction: "측면 스피드 돌파", focus: "볼 탈취 후 3초 내 전방 연결", tip: "오버래핑 LB와 역할 분담 — 동시 전진 금지" },
  CAM: { role: "역습 연결고리 & 찬스 메이커", color: "#a78bfa", tasks: ["수비 시 상대 CM 사이 공간 차단", "역습 시 ST와 윙 사이에서 연결 패스 공급", "전방 침투 타이밍에 박스 안 진입 시도"], keyAction: "전환 패스 & 침투", focus: "역습 시 공간 읽기와 빠른 패스", tip: "볼 로스트 상황에서 즉시 전환 스위치" },
  RW: { role: "우측 역습 가담 & 슈팅", color: "#f59e0b", tasks: ["수비 시 우측 미드필드 수비 가담", "역습 전환 시 우측 공간으로 스프린트", "안으로 cut-in 후 슈팅 또는 ST 연결"], keyAction: "컷인 슈팅", focus: "오른발잡이라면 왼쪽으로 좁혀 슈팅 각도 확보", tip: "RB 오버래핑 공간 비워두기" },
  CM: { role: "중원 장악 & 역습 스위치", color: "#60a5fa", tasks: ["수비 시 상대 미드필더 마크 및 공간 차단", "볼 탈취 후 빠른 전방 전환 패스로 역습 스위치", "상황에 따라 전방 지원 또는 수비 커버"], keyAction: "볼 탈취 & 전환 패스", focus: "2선에서 최전방으로 정확하고 빠른 패스", tip: "두 CM 중 한 명은 항상 수비 커버 대기" },
  LB: { role: "좌측 수비 & 제한적 오버래핑", color: "#4ade80", tasks: ["상대 우측 윙어 적극 마크", "역습 시 LW 지원 또는 측면 오버래핑 (상황 판단)", "세트피스 시 좌측 크로스 담당"], keyAction: "수비 우선 + 기회적 가담", focus: "역습 중 LW와 동시 전진 자제", tip: "공격 가담 후 빠른 귀환 — 역습 허용 시 위험" },
  CB: { role: "수비 라인 핵심 & 빌드업 시작", color: "#4ade80", tasks: ["상대 스트라이커 마크 및 공중볼 경합", "역습 허용 시 빠른 귀환 및 지연 수비", "GK 볼 배급 시 빌드업 첫 패스 연결"], keyAction: "라인 유지 & 클리어링", focus: "오프사이드 라인 조율은 CB 간 소통 필수", tip: "역습 전술 상 수비 라인이 깊어질 수 있음 — 집중력 유지" },
  RB: { role: "우측 수비 & 제한적 오버래핑", color: "#4ade80", tasks: ["상대 좌측 윙어 적극 마크", "역습 시 RW 지원 또는 측면 오버래핑 (상황 판단)", "세트피스 시 우측 크로스 담당"], keyAction: "수비 우선 + 기회적 가담", focus: "역습 중 RW와 동시 전진 자제", tip: "공격 가담 후 빠른 귀환 — 역습 허용 시 위험" },
  GK: { role: "골문 수호 & 빠른 배급", color: "#94a3b8", tasks: ["역습 전술 핵심 — 볼 잡은 즉시 전방 빠른 배급", "긴 킥으로 ST 또는 윙에게 직접 연결 시도", "수비 라인 뒤 공간 케어 및 스위퍼 역할"], keyAction: "빠른 배급 & 롱킥", focus: "역습 시작점 — 불필요한 지연 없이 즉시 배급", tip: "발밑 기술 있다면 숏패스 빌드업도 상황에 따라 활용" },
};

const defaultPlayer = () => ({
  name: "",
  age: "",
  height: "",
  weight: "",
  foot: null,
  multiPositions: [],
  physical: {},
  tech: {},
  style: { movement: [] },
  mental: null,
  experience: null,
});

// ═══════════════════════════════════════════════════════════════
// 분석 함수
// ═══════════════════════════════════════════════════════════════

function analyzePlayer(player, pos) {
  const comp = PLAYER_COMPARISONS[pos] || PLAYER_COMPARISONS.CM;
  const s = {
    speed: STAT_SCORE[player.physical?.speed] || 65,
    stamina: STAT_SCORE[player.physical?.stamina] || 65,
    physical: STAT_SCORE[player.physical?.physical] || 65,
    kick: TECH_SCORE[player.tech?.kick] || 65,
    dribble: TECH_SCORE[player.tech?.dribble] || 65,
    shooting: TECH_SCORE[player.tech?.shooting] || 65,
    defense: TECH_SCORE[player.tech?.defense] || 65,
  };
  const overall = Math.round((s.speed + s.stamina + s.physical + s.kick + s.dribble + s.shooting + s.defense) / 7);
  const similarity = Math.min(93, Math.max(58, overall - 3 + Math.floor(Math.random() * 12)));
  const strengths = [];
  const weaknesses = [];
  if (s.speed >= 80) strengths.push("압도적인 스피드");
  if (s.stamina >= 80) strengths.push("탁월한 체력");
  if (s.physical >= 80) strengths.push("강한 피지컬");
  if (s.kick >= 80) strengths.push("정확한 킥/패스");
  if (s.dribble >= 80) strengths.push("뛰어난 드리블");
  if (s.shooting >= 80) strengths.push("강력한 슈팅");
  if (s.defense >= 80) strengths.push("탄탄한 수비");
  if (s.speed <= 55) weaknesses.push("기동력 부족");
  if (s.stamina <= 55) weaknesses.push("체력 관리 필요");
  if (s.kick <= 55) weaknesses.push("패스 정확도");
  if (s.shooting <= 55) weaknesses.push("결정력 향상 필요");
  if (!strengths.length) strengths.push("균형잡힌 올라운더");
  if (!weaknesses.length) weaknesses.push("뚜렷한 약점 없음");
  return { comp, overall, similarity, stats: s, strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 2) };
}

function analyzeTeam(players) {
  const list = Object.values(players).filter((p) => p && p.name);
  if (!list.length) return null;
  const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const speeds = list.map((p) => STAT_SCORE[p.physical?.speed] || 65);
  const staminas = list.map((p) => STAT_SCORE[p.physical?.stamina] || 65);
  const physicals = list.map((p) => STAT_SCORE[p.physical?.physical] || 65);
  const kicks = list.map((p) => TECH_SCORE[p.tech?.kick] || 65);
  const dribbles = list.map((p) => TECH_SCORE[p.tech?.dribble] || 65);
  const shootings = list.map((p) => TECH_SCORE[p.tech?.shooting] || 65);
  const defenses = list.map((p) => TECH_SCORE[p.tech?.defense] || 65);
  const avgSpeed = avg(speeds);
  const avgStamina = avg(staminas);
  const avgPhysical = avg(physicals);
  const avgKick = avg(kicks);
  const avgDribble = avg(dribbles);
  const avgShooting = avg(shootings);
  const avgDefense = avg(defenses);
  const radar = {
    공격력: Math.round(avgShooting * 0.6 + avgDribble * 0.4),
    수비력: Math.round(avgDefense * 0.7 + avgPhysical * 0.3),
    스피드: avgSpeed,
    체력: avgStamina,
    기술력: Math.round(avgKick * 0.5 + avgDribble * 0.3 + avgShooting * 0.2),
  };
  const pressers = list.filter((p) => p.style?.defense === "최전방압박").length;
  const strengths = [];
  const weaknesses = [];
  if (avgSpeed >= 72) strengths.push({ icon: "⚡", text: "빠른 측면 기동력", desc: "팀 전반적으로 스피드가 뛰어나 역습과 측면 돌파에 유리합니다." });
  if (avgDefense >= 72) strengths.push({ icon: "🛡️", text: "탄탄한 수비 조직력", desc: "수비 능력이 안정적이며 실점 리스크가 낮습니다." });
  if (avgKick >= 72) strengths.push({ icon: "🎯", text: "정확한 패스 빌드업", desc: "킥/패스 능력이 우수하여 점유율 기반 플레이가 가능합니다." });
  if (avgDribble >= 72) strengths.push({ icon: "⚽", text: "개인기 돌파 능력", desc: "드리블이 뛰어나 1대1 상황에서 강점을 보입니다." });
  if (avgShooting >= 72) strengths.push({ icon: "🥅", text: "강력한 슈팅 결정력", desc: "결정력이 좋아 찬스를 득점으로 연결하는 능력이 있습니다." });
  if (avgStamina >= 72) strengths.push({ icon: "🫀", text: "높은 활동량", desc: "체력이 좋아 후반에도 압박과 빠른 전환이 가능합니다." });
  if (avgSpeed <= 58) weaknesses.push({ icon: "🐢", text: "전체적인 기동력 부족", desc: "빠른 역습이나 측면 침투에 약점이 있습니다." });
  if (avgShooting <= 58) weaknesses.push({ icon: "🎯", text: "결정력 향상 필요", desc: "득점 기회를 만들어도 마무리가 약해 득점력이 아쉽습니다." });
  if (avgDefense <= 58) weaknesses.push({ icon: "⚠️", text: "수비 안정성 부족", desc: "수비 라인이 불안정하여 실점 리스크 관리가 필요합니다." });
  if (avgPhysical <= 58) weaknesses.push({ icon: "💪", text: "피지컬 경합 열세", desc: "몸싸움과 공중볼 경합에서 밀릴 수 있습니다." });
  if (!strengths.length) strengths.push({ icon: "⚖️", text: "균형잡힌 팀 구성", desc: "고른 능력치를 보유하고 있습니다." });
  if (!weaknesses.length) weaknesses.push({ icon: "📈", text: "전반적 향상 필요", desc: "모든 부분에서 고르게 발전이 필요한 팀입니다." });
  const tactics = [
    { name: "역습 축구", eng: "COUNTER ATTACK", icon: "⚡", color: "#ef4444", accent: "#fca5a5", fit: Math.min(95, Math.round(avgSpeed * 0.5 + avgShooting * 0.3 + pressers * 5 + 20)), desc: "빠른 전환과 측면 스피드를 활용한 역습 전술", keyPlayers: "빠른 윙어, 결정력 있는 스트라이커", pros: ["적은 체력 소모", "빠른 전환으로 찬스 창출"], cons: ["점유율 낮음", "수비 집중력 요구"] },
    { name: "점유율 축구", eng: "POSSESSION", icon: "🔄", color: "#3b82f6", accent: "#93c5fd", fit: Math.min(95, Math.round(avgKick * 0.4 + avgStamina * 0.3 + avgDribble * 0.2 + 15)), desc: "패스와 볼 점유를 통해 경기를 지배하는 전술", keyPlayers: "패스 능력 좋은 미드필더, 활동량 많은 윙어", pros: ["경기 주도권 확보", "상대 체력 소모"], cons: ["높은 기술력 요구", "체력 소모 많음"] },
    { name: "압박 축구", eng: "HIGH PRESS", icon: "🔥", color: "#f59e0b", accent: "#fcd34d", fit: Math.min(95, Math.round(avgStamina * 0.5 + avgSpeed * 0.3 + pressers * 8 + 10)), desc: "전방부터 강한 압박으로 상대 빌드업을 차단", keyPlayers: "체력 좋은 공격수, 빠른 미드필더", pros: ["상대 실수 유도", "높은 위치에서 볼 탈취"], cons: ["높은 체력 요구", "압박 실패시 역습 위험"] },
  ].sort((a, b) => b.fit - a.fit);
  const overallRating = Math.round(Object.values(radar).reduce((a, b) => a + b, 0) / 5);
  return { radar, strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 2), tactics, overallRating, stats: { avgSpeed, avgStamina, avgPhysical, avgKick, avgDribble, avgShooting, avgDefense } };
}

// ═══════════════════════════════════════════════════════════════
// 공통 UI 컴포넌트
// ═══════════════════════════════════════════════════════════════

const Tag = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.15s", background: active ? "#16a34a" : "rgba(255,255,255,0.04)", color: active ? "#f0fdf4" : "#94a3b8", border: active ? "1px solid #4ade80" : "1px solid rgba(255,255,255,0.1)" }}>{label}</button>
);

const StatLevelBtn = ({ value, desc, active, onClick }) => {
  const c = value === "하" ? "#ef4444" : value === "중" ? "#f59e0b" : "#4ade80";
  return (
    <button onClick={onClick} title={desc} style={{ flex: 1, padding: "8px 6px", borderRadius: 10, border: active ? `1.5px solid ${c}` : "1px solid rgba(255,255,255,0.08)", background: active ? `${c}22` : "rgba(255,255,255,0.03)", color: active ? c : "#64748b", fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 10, marginTop: 2, color: active ? `${c}cc` : "#475569" }}>{desc}</div>
    </button>
  );
};

const TechBtn = ({ value, active, onClick }) => {
  const c = value === "약함" ? "#ef4444" : value === "보통" ? "#f59e0b" : "#4ade80";
  return <button onClick={onClick} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: active ? `1.5px solid ${c}` : "1px solid rgba(255,255,255,0.08)", background: active ? `${c}22` : "rgba(255,255,255,0.03)", color: active ? c : "#64748b", fontWeight: active ? 700 : 500, fontSize: 11, cursor: "pointer" }}>{value}</button>;
};

const StatBar = ({ label, value, color = "#4ade80" }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}</span>
    </div>
    <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: `linear-gradient(90deg,${color}88,${color})`, borderRadius: 3 }} />
    </div>
  </div>
);

const Header = ({ phase }) => {
  const steps = ["팀 설정", "선수 입력", "개인 분석", "팀 분석", "전술 가이드"];
  const stepIndex = phase === "team-setup" ? 0 : phase === "formation" ? 1 : phase === "player-analysis" ? 2 : phase === "team-analysis" ? 3 : 4;
  return (
    <div style={{ background: "linear-gradient(180deg,#071a0e,#060b14)", borderBottom: "1px solid rgba(74,222,128,0.2)", padding: "16px 20px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>⚽</div>
          <div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 21, fontWeight: 700, color: "#4ade80", letterSpacing: 2, lineHeight: 1 }}>SquadLab</div>
            <div style={{ fontSize: 10, color: "#4ade80aa", letterSpacing: 3 }}>AI TACTICAL ADVISOR</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 2, background: i <= stepIndex ? "#4ade80" : "rgba(255,255,255,0.08)" }} />
              <div style={{ fontSize: 9, color: i <= stepIndex ? "#4ade80" : "#334155", marginTop: 4, textAlign: "center" }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Phase 0: 팀 설정
// ═══════════════════════════════════════════════════════════════

function TeamSetup({ onNext }) {
  const [teamName, setTeamName] = useState("");
  const [teamType, setTeamType] = useState(null);
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 16px 60px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#f0fdf4", marginBottom: 8 }}>팀 정보를 입력해주세요</div>
        <div style={{ fontSize: 14, color: "#475569" }}>전술 분석을 위한 기본 정보가 필요해요</div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 16, padding: "24px 28px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 12 }}>팀 이름</div>
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="예) FC 친구들" style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0fdf4", fontSize: 16 }} />
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 16, padding: "24px 28px", marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 16 }}>팀 유형</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "fixed", label: "주전이 어느정도 정해진 팀", desc: "Best 11이 대략 정해져 있고 후보 몇 명이 있는 경우", icon: "✅" },
            { key: "open", label: "라인업이 유동적인 팀", desc: "팀원이 많고 아직 포지션 배분이 정해지지 않은 경우", icon: "🔄", disabled: true },
          ].map((opt) => (
            <button key={opt.key} onClick={() => !opt.disabled && setTeamType(opt.key)} style={{ padding: "16px 20px", borderRadius: 12, border: `1.5px solid ${teamType === opt.key ? "#4ade80" : "rgba(255,255,255,0.08)"}`, background: teamType === opt.key ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.02)", cursor: opt.disabled ? "not-allowed" : "pointer", textAlign: "left", opacity: opt.disabled ? 0.4 : 1, transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{opt.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: teamType === opt.key ? "#4ade80" : "#cbd5e1" }}>{opt.label}</span>
                {opt.disabled && <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 8px", color: "#475569" }}>준비중</span>}
              </div>
              <div style={{ fontSize: 12, color: "#475569", paddingLeft: 28 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => teamName && teamType && onNext(teamName)} disabled={!teamName || !teamType} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: teamName && teamType ? "linear-gradient(135deg,#16a34a,#4ade80)" : "rgba(255,255,255,0.06)", color: teamName && teamType ? "#052e16" : "#334155", fontSize: 16, fontWeight: 700, cursor: teamName && teamType ? "pointer" : "not-allowed", letterSpacing: 1 }}>
        {teamName && teamType ? "포메이션 선택 →" : "팀 이름과 유형을 선택해주세요"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 1: 포메이션 + 선수 입력 팝업
// ═══════════════════════════════════════════════════════════════

function PlayerInputPopup({ slot, player, onSave, onClose }) {
  const [form, setForm] = useState(player || defaultPlayer());
  const toggleMovement = (tag) =>
    setForm((f) => ({
      ...f,
      style: {
        ...f.style,
        movement: f.style.movement?.includes(tag) ? f.style.movement.filter((t) => t !== tag) : [...(f.style.movement || []), tag],
      },
    }));
  const isComplete = form.name && form.foot && Object.keys(form.physical).length === 3 && Object.keys(form.tech).length === 4 && form.style.attack && form.style.defense && form.style.risk && form.mental && form.experience;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "20px 16px" }}>
      <div style={{ width: "100%", maxWidth: 560, background: "#0d1420", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 20, padding: "28px 24px", marginTop: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ display: "inline-block", background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#052e16", letterSpacing: 1, marginBottom: 6 }}>{slot.pos}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f0fdf4" }}>선수 정보 입력</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#64748b", fontSize: 18, cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* 기본 정보 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 10 }}>기본 정보</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="이름" style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0fdf4", fontSize: 14 }} />
            </div>
            {[{ k: "age", ph: "나이" }, { k: "height", ph: "키 (cm)" }, { k: "weight", ph: "몸무게 (kg)" }].map((f) => (
              <input key={f.k} value={form[f.k]} onChange={(e) => setForm((fm) => ({ ...fm, [f.k]: e.target.value }))} placeholder={f.ph} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0fdf4", fontSize: 13 }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>주발</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>{FOOT_OPTIONS.map((f) => <Tag key={f} label={f} active={form.foot === f} onClick={() => setForm((fm) => ({ ...fm, foot: f }))} />)}</div>
        </div>

        {/* 신체 능력 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 12 }}>신체 및 운동 능력</div>
          {PHYSICAL_STATS.map((stat) => (
            <div key={stat.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
                {stat.icon} {stat.label}
              </div>
              <div style={{ display: "flex", gap: 6 }}>{stat.levels.map((l) => <StatLevelBtn key={l.value} value={l.value} desc={l.desc} active={form.physical[stat.key] === l.value} onClick={() => setForm((f) => ({ ...f, physical: { ...f.physical, [stat.key]: l.value } }))} />)}</div>
            </div>
          ))}
        </div>

        {/* 기술 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 12 }}>기술적 강점</div>
          {TECH_STATS.map((stat) => (
            <div key={stat.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", minWidth: 110 }}>
                {stat.icon} {stat.label}
              </div>
              <div style={{ display: "flex", gap: 5, flex: 1 }}>{TECH_LEVELS.map((l) => <TechBtn key={l} value={l} active={form.tech[stat.key] === l} onClick={() => setForm((f) => ({ ...f, tech: { ...f.tech, [stat.key]: l } }))} />)}</div>
            </div>
          ))}
        </div>

        {/* 플레이 성향 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 12 }}>플레이 성향</div>
          {Object.entries(STYLE_OPTIONS).map(([key, opt]) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{opt.label}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{opt.tags.map((tag) => <Tag key={tag} label={tag} active={opt.multi ? (form.style.movement || []).includes(tag) : form.style[key] === tag} onClick={() => { if (opt.multi) toggleMovement(tag); else setForm((f) => ({ ...f, style: { ...f.style, [key]: tag } })); }} />)}</div>
            </div>
          ))}
        </div>

        {/* 멘탈 + 경험 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>멘탈 / 리더십</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{MENTAL_TAGS.map((t) => <Tag key={t} label={t} active={form.mental === t} onClick={() => setForm((f) => ({ ...f, mental: t }))} />)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>경험 수준</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{EXP_TAGS.map((t) => <Tag key={t} label={t} active={form.experience === t} onClick={() => setForm((f) => ({ ...f, experience: t }))} />)}</div>
          </div>
        </div>

        <button onClick={() => isComplete && onSave(form)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: isComplete ? "linear-gradient(135deg,#16a34a,#4ade80)" : "rgba(255,255,255,0.06)", color: isComplete ? "#052e16" : "#334155", fontSize: 15, fontWeight: 700, cursor: isComplete ? "pointer" : "not-allowed", letterSpacing: 1 }}>
          {isComplete ? "✓ 저장 완료" : "모든 항목을 입력해주세요"}
        </button>
      </div>
    </div>
  );
}

function FormationScreen({ teamName, players, onPlayerSave, onNext, onBack }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const completedCount = FORMATION_4231.filter((s) => players[s.id]?.name).length;
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 16px 60px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 2, marginBottom: 6 }}>STEP 2</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>{teamName} 선수 입력</div>
        <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>포지션을 클릭해서 선수 정보를 입력하세요</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#052e16", letterSpacing: 2 }}>4-2-3-1</div>
        <div style={{ fontSize: 13, color: "#475569" }}>{completedCount} / 11명 완료</div>
        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(completedCount / 11) * 100}%`, background: "linear-gradient(90deg,#16a34a,#4ade80)", borderRadius: 2, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* 축구장 */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "130%", background: "linear-gradient(180deg,#1a4a2a,#1e5c30,#1a4a2a)", borderRadius: 16, border: "2px solid rgba(74,222,128,0.2)", overflow: "hidden", marginBottom: 20 }}>
        {[...Array(8)].map((_, i) => <div key={i} style={{ position: "absolute", top: `${i * 12.5}%`, left: 0, right: 0, height: "6.25%", background: i % 2 === 0 ? "rgba(0,0,0,0.08)" : "transparent" }} />)}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 130" preserveAspectRatio="none">
          <rect x="4" y="3" width="92" height="124" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="4" y1="65" x2="96" y2="65" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <circle cx="50" cy="65" r="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <rect x="22" y="3" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="34" y="3" width="32" height="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <rect x="22" y="109" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="34" y="120" width="32" height="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <rect x="40" y="1.5" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
          <rect x="40" y="125.5" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        </svg>
        {FORMATION_4231.map((slot) => {
          const p = players[slot.id];
          const filled = !!p?.name;
          return (
            <button key={slot.id} onClick={() => setSelectedSlot(slot)} style={{ position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, transform: "translate(-50%,-50%)", width: 52, height: 52, borderRadius: "50%", border: filled ? "2.5px solid #4ade80" : "2px dashed rgba(255,255,255,0.35)", background: filled ? "linear-gradient(135deg,#16a34a,#166534)" : "rgba(0,0,0,0.45)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: filled ? "0 0 12px rgba(74,222,128,0.4)" : "none", padding: 2 }}>
              {filled ? (
                <>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#4ade80" }}>{slot.pos}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#f0fdf4", maxWidth: 44, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{slot.pos}</div>
                  <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>+</div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* 선수 현황 리스트 */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#4ade8099", letterSpacing: 1, marginBottom: 12 }}>선수 현황</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {FORMATION_4231.map((slot) => {
            const p = players[slot.id];
            return (
              <div key={slot.id} onClick={() => setSelectedSlot(slot)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: p?.name ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${p?.name ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.05)"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", minWidth: 32 }}>{slot.pos}</div>
                <div style={{ fontSize: 12, color: p?.name ? "#f0fdf4" : "#334155" }}>{p?.name || "미입력"}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 팀 설정</button>
        <button onClick={() => completedCount === 11 && onNext()} disabled={completedCount < 11} style={{ flex: 2, padding: "14px", borderRadius: 14, border: "none", background: completedCount === 11 ? "linear-gradient(135deg,#16a34a,#4ade80)" : "rgba(255,255,255,0.06)", color: completedCount === 11 ? "#052e16" : "#334155", fontSize: 15, fontWeight: 700, cursor: completedCount === 11 ? "pointer" : "not-allowed", letterSpacing: 1 }}>
          {completedCount === 11 ? "⚽ 개인 분석 시작" : `${11 - completedCount}명 더 입력해주세요`}
        </button>
      </div>

      {selectedSlot && <PlayerInputPopup slot={selectedSlot} player={players[selectedSlot.id]} onSave={(data) => { onPlayerSave(selectedSlot.id, data); setSelectedSlot(null); }} onClose={() => setSelectedSlot(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 2: 개인 선수 분석 슬라이더
// ═══════════════════════════════════════════════════════════════

function PlayerCard({ player, slot }) {
  const { comp, overall, similarity, stats, strengths, weaknesses } = analyzePlayer(player, slot.pos);
  return (
    <div style={{ minWidth: "100%", padding: "0 2px" }}>
      <div style={{ background: `linear-gradient(145deg,${comp.color} 0%,#0a0e1a 65%)`, border: `2px solid ${comp.accent}44`, borderRadius: 20, padding: "24px 20px", position: "relative", overflow: "hidden", marginBottom: 14 }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `${comp.accent}08` }} />
        <div style={{ position: "relative" }}>
          <span style={{ background: `${comp.accent}22`, border: `1px solid ${comp.accent}55`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: comp.accent, letterSpacing: 1, display: "inline-block", marginBottom: 12 }}>{slot.pos}</span>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", minWidth: 75 }}>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 56, fontWeight: 700, color: comp.accent, lineHeight: 1 }}>{overall}</div>
              <div style={{ fontSize: 10, color: `${comp.accent}88`, marginTop: 3, letterSpacing: 1 }}>OVR</div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 3 }}>
                {[["PAC", stats.speed], ["STA", stats.stamina], ["PHY", stats.physical]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 5 }}>
                    <span style={{ fontSize: 9, color: comp.accent, fontWeight: 700, minWidth: 22 }}>{k}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#f0fdf4" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: `${comp.accent}88`, letterSpacing: 1, marginBottom: 2 }}>이런 선수와 비슷해요</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 2 }}>{comp.name}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>{comp.club}</div>
              <div style={{ background: `${comp.accent}12`, border: `1px solid ${comp.accent}30`, borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${similarity}%`, background: `linear-gradient(90deg,${comp.accent}88,${comp.accent})`, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, fontWeight: 700, color: comp.accent }}>{similarity}%</span>
                </div>
                <div style={{ fontSize: 9, color: `${comp.accent}55`, marginTop: 2 }}>유사도</div>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[["킥", stats.kick], ["드리블", stats.dribble], ["슈팅", stats.shooting], ["수비", stats.defense]].map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 7px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#64748b" }}>{k}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: v >= 80 ? "#4ade80" : v >= 60 ? "#f59e0b" : "#ef4444" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 14, padding: "16px 18px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 12 }}>📊 능력치 상세</div>
        <StatBar label="속도 / 기동력" value={stats.speed} color="#4ade80" />
        <StatBar label="지구력 / 활동량" value={stats.stamina} color="#4ade80" />
        <StatBar label="피지컬 / 제공권" value={stats.physical} color="#f59e0b" />
        <StatBar label="킥 / 패스" value={stats.kick} color="#60a5fa" />
        <StatBar label="드리블" value={stats.dribble} color="#a78bfa" />
        <StatBar label="슈팅 / 결정력" value={stats.shooting} color="#f87171" />
        <StatBar label="수비 / 태클" value={stats.defense} color="#fb923c" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: 12, padding: "12px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>💪 강점</div>
          {strengths.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 12, padding: "12px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>🔧 보완점</div>
          {weaknesses.map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{w}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerAnalysis({ players, teamName, onNext, onBack }) {
  const [current, setCurrent] = useState(0);
  const slots = FORMATION_4231;
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>개인 선수 분석</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#f0fdf4" }}>{teamName} 선수단 리포트</div>
        <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>선수를 클릭하거나 좌우 버튼으로 넘겨보세요</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: current === 0 ? "rgba(255,255,255,0.02)" : "rgba(74,222,128,0.1)", color: current === 0 ? "#334155" : "#4ade80", fontSize: 20, cursor: current === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ‹
        </button>
        <div style={{ flex: 1, overflowX: "auto", display: "flex", gap: 5 }}>
          {slots.map((slot, i) => (
            <button key={slot.id} onClick={() => setCurrent(i)} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 20, border: `1px solid ${current === i ? "#4ade80" : "rgba(255,255,255,0.08)"}`, background: current === i ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.02)", color: current === i ? "#4ade80" : "#64748b", fontSize: 10, fontWeight: current === i ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>
              <span style={{ opacity: 0.7 }}>{slot.pos} </span>
              {players[slot.id]?.name || "?"}
            </button>
          ))}
        </div>
        <button onClick={() => setCurrent((c) => Math.min(slots.length - 1, c + 1))} disabled={current === slots.length - 1} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: current === slots.length - 1 ? "rgba(255,255,255,0.02)" : "rgba(74,222,128,0.1)", color: current === slots.length - 1 ? "#334155" : "#4ade80", fontSize: 20, cursor: current === slots.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ›
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 20 }}>
        {slots.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 18 : 5, height: 5, borderRadius: 3, background: i === current ? "#4ade80" : "rgba(255,255,255,0.12)", cursor: "pointer", transition: "all 0.3s" }} />
        ))}
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", transform: `translateX(-${current * 100}%)`, transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
          {slots.map((slot) => (
            <div key={slot.id} style={{ minWidth: "100%" }}>
              <PlayerCard player={players[slot.id] || {}} slot={slot} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 선수 수정</button>
        <button onClick={onNext} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#16a34a,#4ade80)", color: "#052e16", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>팀 전체 분석 →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 3: 팀 분석
// ═══════════════════════════════════════════════════════════════

function RadarChart({ data }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);
  const keys = Object.keys(data);
  const values = Object.values(data);
  const n = keys.length;
  const cx = 130;
  const cy = 130;
  const r = 100;
  const angleOf = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i, pct) => ({ x: cx + r * pct * Math.cos(angleOf(i)), y: cy + r * pct * Math.sin(angleOf(i)) });
  const polygon = (pct) =>
    keys
      .map((_, i) => {
        const p = point(i, pct);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  const dataPolygon = keys
    .map((_, i) => {
      const p = point(i, animated ? values[i] / 100 : 0);
      return `${p.x},${p.y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 260 260" style={{ width: "100%", maxWidth: 280 }}>
      {[0.25, 0.5, 0.75, 1].map((pct, gi) => (
        <polygon key={gi} points={polygon(pct)} fill="none" stroke="rgba(74,222,128,0.12)" strokeWidth="0.8" />
      ))}
      {keys.map((_, i) => {
        const p = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(74,222,128,0.15)" strokeWidth="0.8" />;
      })}
      <polygon points={dataPolygon} fill="rgba(74,222,128,0.18)" stroke="#4ade80" strokeWidth="2" style={{ transition: "all 0.8s ease" }} />
      {keys.map((_, i) => {
        const p = point(i, animated ? values[i] / 100 : 0);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#4ade80" stroke="#060b14" strokeWidth="2" style={{ transition: "all 0.8s ease" }} />;
      })}
      {keys.map((key, i) => {
        const lp = point(i, 1.28);
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill="#94a3b8">
            {key}
          </text>
        );
      })}
      {keys.map((_, i) => {
        const vp = point(i, animated ? values[i] / 100 - 0.15 : 0);
        return (
          <text key={i} x={vp.x} y={vp.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#4ade80" style={{ transition: "all 0.8s ease" }}>
            {animated ? values[i] : ""}
          </text>
        );
      })}
    </svg>
  );
}

function TeamAnalysis({ players, teamName, onNext, onBack }) {
  const [loading, setLoading] = useState(true);
  const [selectedTactic, setSelectedTactic] = useState(0);
  const analysis = analyzeTeam(players);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (loading)
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        <div style={{ fontSize: 52, animation: "spin 1.2s linear infinite", marginBottom: 28 }}>⚽</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#4ade80", marginBottom: 20, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 2 }}>팀 분석 중...</div>
        {["11명 선수 데이터 수집", "팀 강점/약점 도출", "전술 적합도 계산"].map((t, i) => (
          <div key={i} style={{ fontSize: 13, color: "#4ade8066", marginBottom: 8, animation: `pulse 1.5s ease ${i * 0.4}s infinite` }}>
            ✓ {t}
          </div>
        ))}
      </div>
    );

  if (!analysis) return null;
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>팀 전체 분석</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>{teamName} 분석 리포트</div>
      </div>

      {/* 종합 레이팅 */}
      <div style={{ background: "linear-gradient(135deg,rgba(22,163,74,0.12),rgba(96,165,250,0.08))", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 18, padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 64, fontWeight: 700, color: "#4ade80", lineHeight: 1 }}>{analysis.overallRating}</div>
          <div style={{ fontSize: 11, color: "#4ade8088", letterSpacing: 1, marginTop: 4 }}>팀 종합 레이팅</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4", marginBottom: 4 }}>{teamName}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>4-2-3-1 · 11명</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[["공격", analysis.stats.avgShooting], ["수비", analysis.stats.avgDefense], ["패스", analysis.stats.avgKick], ["스피드", analysis.stats.avgSpeed], ["체력", analysis.stats.avgStamina]].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "5px 10px" }}>
                <div style={{ fontSize: 9, color: "#64748b" }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: v >= 75 ? "#4ade80" : v >= 60 ? "#f59e0b" : "#ef4444" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 레이더 */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 16, padding: "20px", marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 16, alignSelf: "flex-start" }}>📡 팀 역량 레이더</div>
        <RadarChart data={analysis.radar} />
      </div>

      {/* 강점 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80", marginBottom: 12 }}>💪 팀 강점</div>
        {analysis.strengths.map((s, i) => (
          <div key={i} style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4", marginBottom: 3 }}>{s.text}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 약점 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 12 }}>🔧 보완 필요</div>
        {analysis.weaknesses.map((w, i) => (
          <div key={i} style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{w.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4", marginBottom: 3 }}>{w.text}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{w.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 전술 추천 */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f0fdf4", marginBottom: 4 }}>🧠 추천 전술</div>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>원하는 전술을 선택하세요</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {analysis.tactics.map((tactic, i) => (
            <div key={i} onClick={() => setSelectedTactic(i)} style={{ background: selectedTactic === i ? `${tactic.color}18` : "rgba(255,255,255,0.03)", border: `${selectedTactic === i ? "2px" : "1px"} solid ${selectedTactic === i ? tactic.color : "rgba(255,255,255,0.08)"}`, borderRadius: 16, padding: "20px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}>
              {i === 0 && <div style={{ position: "absolute", top: 12, right: 12, background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#052e16" }}>추천</div>}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${tactic.color}22`, border: `1px solid ${tactic.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{tactic.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: tactic.accent, letterSpacing: 1, marginBottom: 2 }}>{tactic.eng}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#f0fdf4", marginBottom: 4 }}>{tactic.name}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{tactic.desc}</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>팀 적합도</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tactic.color }}>{tactic.fit}%</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${tactic.fit}%`, background: `linear-gradient(90deg,${tactic.color}88,${tactic.color})`, borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>{tactic.pros.map((p, j) => <div key={j} style={{ display: "flex", gap: 5, marginBottom: 4 }}><span style={{ color: "#4ade80", fontSize: 11 }}>+</span><span style={{ fontSize: 11, color: "#94a3b8" }}>{p}</span></div>)}</div>
                <div>{tactic.cons.map((c, j) => <div key={j} style={{ display: "flex", gap: 5, marginBottom: 4 }}><span style={{ color: "#ef4444", fontSize: 11 }}>−</span><span style={{ fontSize: 11, color: "#94a3b8" }}>{c}</span></div>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 개인 분석</button>
        <button onClick={() => onNext(analysis.tactics[selectedTactic])} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#16a34a,#4ade80)", color: "#052e16", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>
          {analysis.tactics[selectedTactic]?.name} 전술로 →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 4: 전술 역할 가이드
// ═══════════════════════════════════════════════════════════════

function TacticalGuide({ players, teamName, tactic, onBack }) {
  const [selectedId, setSelectedId] = useState(1);
  const currentSlot = FORMATION_4231.find((s) => s.id === selectedId);
  const currentPlayer = players[selectedId];
  const currentGuide = ROLE_GUIDES[currentSlot?.pos];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>전술 역할 가이드</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>
          {teamName} · 포지션별 임무
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <div style={{ background: `${tactic.color}18`, border: `1px solid ${tactic.color}44`, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: tactic.color }}>
            {tactic.icon} {tactic.name} 적용 중
          </div>
          <div style={{ fontSize: 12, color: "#475569" }}>선수를 클릭해 역할 확인</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 16, marginBottom: 24 }}>
        {/* 포메이션 미니맵 */}
        <div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, textAlign: "center" }}>4-2-3-1</div>
          <div style={{ position: "relative", width: "100%", paddingBottom: "140%", background: "linear-gradient(180deg,#1a4a2a,#1e5c30,#1a4a2a)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(74,222,128,0.2)", marginBottom: 12 }}>
            {[...Array(7)].map((_, i) => <div key={i} style={{ position: "absolute", top: `${i * 14.3}%`, left: 0, right: 0, height: "7%", background: i % 2 === 0 ? "rgba(0,0,0,0.08)" : "transparent" }} />)}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 140" preserveAspectRatio="none">
              <rect x="4" y="3" width="92" height="134" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
              <line x1="4" y1="70" x2="96" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <rect x="24" y="3" width="52" height="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <rect x="24" y="119" width="52" height="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            </svg>
            {FORMATION_4231.map((slot) => {
              const p = players[slot.id];
              const isSel = selectedId === slot.id;
              return (
                <button key={slot.id} onClick={() => setSelectedId(slot.id)} style={{ position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, transform: "translate(-50%,-50%)", width: isSel ? 48 : 38, height: isSel ? 48 : 38, borderRadius: "50%", border: isSel ? "2.5px solid #4ade80" : "1.5px solid rgba(255,255,255,0.3)", background: isSel ? "linear-gradient(135deg,#16a34a,#1a5c2a)" : "rgba(0,0,0,0.55)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: isSel ? "0 0 14px rgba(74,222,128,0.5)" : "none", padding: 2, zIndex: isSel ? 2 : 1 }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: isSel ? "#4ade80" : "rgba(255,255,255,0.5)" }}>{slot.pos}</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: isSel ? "#f0fdf4" : "rgba(255,255,255,0.6)", maxWidth: 36, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p?.name || "?"}</div>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {FORMATION_4231.map((slot) => (
              <button key={slot.id} onClick={() => setSelectedId(slot.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 7, border: `1px solid ${selectedId === slot.id ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.04)"}`, background: selectedId === slot.id ? "rgba(74,222,128,0.08)" : "transparent", cursor: "pointer" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#4ade80", minWidth: 26 }}>{slot.pos}</span>
                <span style={{ fontSize: 10, color: selectedId === slot.id ? "#f0fdf4" : "#64748b" }}>{players[slot.id]?.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 역할 카드 */}
        {currentGuide && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 18, padding: "20px 18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${currentGuide.color}22`, border: `1.5px solid ${currentGuide.color}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: currentGuide.color }}>{currentSlot?.pos}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f0fdf4", marginBottom: 2 }}>{currentPlayer?.name}</div>
                <div style={{ fontSize: 11, color: currentGuide.color, fontWeight: 600 }}>{currentGuide.role}</div>
              </div>
            </div>

            <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 1, marginBottom: 10 }}>핵심 임무</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
              {currentGuide.tasks.map((task, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 9, padding: "9px 10px" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${currentGuide.color}22`, border: `1px solid ${currentGuide.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: currentGuide.color, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{task}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ background: `${currentGuide.color}10`, border: `1px solid ${currentGuide.color}25`, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 9, color: currentGuide.color, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5 }}>⚡ 핵심 액션</div>
                <div style={{ fontSize: 12, color: "#f0fdf4", fontWeight: 600 }}>{currentGuide.keyAction}</div>
              </div>
              <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 700, letterSpacing: 0.5, marginBottom: 5 }}>🎯 집중 포인트</div>
                <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{currentGuide.focus}</div>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg,rgba(22,163,74,0.08),rgba(96,165,250,0.06))", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 10, padding: "10px 12px", display: "flex", gap: 8 }}>
              <span style={{ fontSize: 14 }}>💬</span>
              <div>
                <div style={{ fontSize: 9, color: "#4ade8088", marginBottom: 2 }}>랩장의 한마디</div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{currentGuide.tip}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 팀 전술 요약 */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 14 }}>📋 팀 전술 요약 — {tactic.name}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[{ phase: "수비 시", icon: "🛡️", desc: "4-4-2 블록 유지\n컴팩트한 라인" }, { phase: "전환 순간", icon: "⚡", desc: "볼 탈취 즉시\n전방 빠른 배급" }, { phase: "공격 시", icon: "🥅", desc: "ST + 윙 삼각형\n빠른 마무리" }].map((item, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", marginBottom: 5 }}>{item.phase}</div>
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 전술 적합도 */}
      <div style={{ background: "linear-gradient(135deg,rgba(22,163,74,0.1),rgba(96,165,250,0.08))", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 16, padding: "20px 22px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#4ade8088", marginBottom: 4 }}>🏆 예상 전술 효과</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0fdf4" }}>{tactic.name} 적용 시 팀 전력</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>팀 데이터 기반 전술 적합도</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 48, fontWeight: 700, color: "#4ade80", lineHeight: 1 }}>{tactic.fit}%</div>
            <div style={{ fontSize: 11, color: "#4ade8066" }}>전술 적합도</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 팀 분석</button>
        <button style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#16a34a,#4ade80)", color: "#052e16", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>✓ 전술 확정 & 저장</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 메인 앱
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [phase, setPhase] = useState("team-setup");
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState({});
  const [selectedTactic, setSelectedTactic] = useState(null);

  const savePlayer = (slotId, data) => setPlayers((prev) => ({ ...prev, [slotId]: data }));

  return (
    <div style={{ minHeight: "100vh", background: "#060b14", fontFamily: "'Pretendard','Noto Sans KR',sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #334155; }
        input:focus { outline: none; border-color: #4ade80 !important; }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e3a1e; border-radius: 4px; }
      `}</style>

      <Header phase={phase} />

      {phase === "team-setup" && <TeamSetup onNext={(name) => { setTeamName(name); setPhase("formation"); }} />}
      {phase === "formation" && <FormationScreen teamName={teamName} players={players} onPlayerSave={savePlayer} onNext={() => setPhase("player-analysis")} onBack={() => setPhase("team-setup")} />}
      {phase === "player-analysis" && <PlayerAnalysis players={players} teamName={teamName} onNext={() => setPhase("team-analysis")} onBack={() => setPhase("formation")} />}
      {phase === "team-analysis" && <TeamAnalysis players={players} teamName={teamName} onNext={(tactic) => { setSelectedTactic(tactic); setPhase("tactical-guide"); }} onBack={() => setPhase("player-analysis")} />}
      {phase === "tactical-guide" && selectedTactic && <TacticalGuide players={players} teamName={teamName} tactic={selectedTactic} onBack={() => setPhase("team-analysis")} />}
    </div>
  );
}
