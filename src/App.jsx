import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
// 상수 & 설정
// ═══════════════════════════════════════════════════════════════
const FORMATION_4231 = [
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
];

const POS_CONFIG = {
  ST:  { label: "원톱 스트라이커",    emoji: "⚡", color: "#ef4444", tech: [{ key: "finishing", label: "골 결정력 / 슈팅", options: ["약함", "보통", "원샷원킬"] }, { key: "postPlay", label: "포스트 플레이 (등딱)", options: ["잘 밀림", "버팀", "철벽 키핑"] }, { key: "aerial", label: "공중볼 / 헤더", options: ["약함", "보통", "타점 높음"] }], styleSpecific: [{ key: "movement", label: "선호 움직임", options: ["타겟맨 (중앙 대기)", "라인 브레이커 (뒷공간 침투)", "펄스 나인 (내려와 연계)"] }] },
  LW:  { label: "좌측 윙어",          emoji: "🌪️", color: "#f59e0b", tech: [{ key: "acceleration", label: "순간 가속 / 폭발력", options: ["느림", "보통", "치달의 달인"] }, { key: "dribble", label: "드리블 돌파 (1vs1)", options: ["백패스 위주", "간결한 탈압박", "크랙 (파괴자)"] }, { key: "cross", label: "크로스 정확도", options: ["부정확", "평범", "택배 크로스"] }], styleSpecific: [{ key: "movement", label: "선호 움직임", options: ["클래식 윙어 (터치라인 돌파)", "인버티드 윙어 (중앙 접고 슈팅)", "하프스페이스 침투"] }] },
  RW:  { label: "우측 윙어",          emoji: "🌪️", color: "#f59e0b", tech: [{ key: "acceleration", label: "순간 가속 / 폭발력", options: ["느림", "보통", "치달의 달인"] }, { key: "dribble", label: "드리블 돌파 (1vs1)", options: ["백패스 위주", "간결한 탈압박", "크랙 (파괴자)"] }, { key: "cross", label: "크로스 정확도", options: ["부정확", "평범", "택배 크로스"] }], styleSpecific: [{ key: "movement", label: "선호 움직임", options: ["클래식 윙어 (터치라인 돌파)", "인버티드 윙어 (중앙 접고 슈팅)", "하프스페이스 침투"] }] },
  CAM: { label: "공격형 미드필더",    emoji: "🎨", color: "#a78bfa", tech: [{ key: "vision", label: "시야 / 킬패스", options: ["평범함", "시야 넓음", "대지를 가르는 패스"] }, { key: "tightControl", label: "좁은 공간 탈압박", options: ["투박함", "무난함", "유려한 발밑"] }, { key: "longShot", label: "중거리 슛", options: ["시도 안함", "위협적", "대포알"] }], styleSpecific: [{ key: "movement", label: "선호 움직임", options: ["정통 플레이메이커 (볼 배급)", "섀도우 스트라이커 (박스 침투)", "프리롤 (자유로운 스위칭)"] }] },
  CM:  { label: "중앙 미드필더",      emoji: "🔄", color: "#60a5fa", tech: [{ key: "marking", label: "대인 마크 / 태클", options: ["조심스러움", "깔끔함", "진공청소기"] }, { key: "positioning", label: "위치 선정 / 인터셉트", options: ["늦음", "예측력 좋음", "길목 차단 달인"] }, { key: "longPass", label: "후방 빌드업 / 롱패스", options: ["짧은 패스 위주", "안정적", "롱패스 능함"] }], styleSpecific: [{ key: "movement", label: "선호 움직임", options: ["홀딩 (후방 수비 보호)", "박스-투-박스 (공수 양면)", "딥라잉 플레이메이커 (후방 조율)"] }] },
  LB:  { label: "좌측 풀백",          emoji: "🏃", color: "#34d399", tech: [{ key: "defending1v1", label: "측면 1vs1 수비", options: ["잘 뚫림", "끈질김", "통곡의 벽"] }, { key: "overlapping", label: "오버래핑 / 활동량", options: ["수비 집중", "적절한 타이밍", "지치지 않는 체력"] }, { key: "attackSupport", label: "공격 지원 (크로스/연계)", options: ["아쉬움", "무난함", "날카로움"] }], styleSpecific: [{ key: "movement", label: "선호 움직임", options: ["공격형 풀백 (오버래핑)", "인버티드 풀백 (중앙 빌드업)", "수비형 풀백 (오버래핑 자제)"] }] },
  RB:  { label: "우측 풀백",          emoji: "🏃", color: "#34d399", tech: [{ key: "defending1v1", label: "측면 1vs1 수비", options: ["잘 뚫림", "끈질김", "통곡의 벽"] }, { key: "overlapping", label: "오버래핑 / 활동량", options: ["수비 집중", "적절한 타이밍", "지치지 않는 체력"] }, { key: "attackSupport", label: "공격 지원 (크로스/연계)", options: ["아쉬움", "무난함", "날카로움"] }], styleSpecific: [{ key: "movement", label: "선호 움직임", options: ["공격형 풀백 (오버래핑)", "인버티드 풀백 (중앙 빌드업)", "수비형 풀백 (오버래핑 자제)"] }] },
  CB:  { label: "센터백",             emoji: "🏰", color: "#4ade80", tech: [{ key: "aerial", label: "공중볼 / 헤더 클리어링", options: ["약함", "안정적", "제공권 장악"] }, { key: "leadership", label: "수비 조율 / 리더십", options: ["조용함", "라인 컨트롤 능함", "수비진의 사령관"] }, { key: "buildUp", label: "발밑 / 전진 패스", options: ["걷어내기 위주", "안정적인 짧은 패스", "롱패스 빌드업"] }], styleSpecific: [{ key: "movement", label: "선호 움직임", options: ["파이터형 (도전적으로 커트)", "커맨더형 (물러서며 공간 커버)"] }] },
  GK:  { label: "골키퍼",             emoji: "🧤", color: "#94a3b8", tech: [{ key: "reflexes", label: "반사신경", options: ["약함", "보통", "슈퍼세이브"] }, { key: "aerialHandling", label: "공중볼 처리", options: ["약함", "보통", "완벽한 제공권"] }, { key: "kickAndBuild", label: "킥력 / 빌드업", options: ["약함", "보통", "정확한 배급"] }], styleSpecific: [{ key: "keeperStyle", label: "플레이 스타일", options: ["스위퍼 키퍼 (박스 밖까지 커버)", "클래식 키퍼 (골문 앞 안정감)"] }] },
};

const PHYSICAL_STATS = [
  { key: "speed",    label: "속도 / 기동력",   icon: "⚡", levels: [{ value: "하", desc: "조깅 페이스" }, { value: "중", desc: "빠른 편" }, { value: "상", desc: "팀 내 최상위권" }] },
  { key: "stamina",  label: "지구력 / 활동량", icon: "🫀", levels: [{ value: "하", desc: "후반 급격히 처짐" }, { value: "중", desc: "90분 무난히 소화" }, { value: "상", desc: "후반에도 스프린트 가능" }] },
  { key: "physical", label: "몸싸움 적극성", icon: "💪", levels: [{ value: "하", desc: "부딪힘을 피함" }, { value: "중", desc: "붙으면 버팀" }, { value: "상", desc: "먼저 부딪힘" }] },
];

const COMMON_STYLE = [
  { key: "teamDedication", label: "팀 헌신도",      options: ["개인 스포트라이트 선호", "팀 플레이어", "궂은일 전담반"] },
  { key: "crisisResponse", label: "위기 상황 대처", options: ["쉽게 흔들림", "평정심 유지", "클러치 (위기에 강함)"] },
];

const TEAM_INFLUENCE = [
  { key: "leadership",    label: "멘탈 / 리더십",    icon: "👑", options: ["팀 분위기 메이커", "묵묵히 제 역할", "경기 조율형 (주장급)"] },
  { key: "communication", label: "소통 및 콜 플레이", icon: "📣", options: ["조용한 편 (개인 플레이)", "필요한 소통만", "적극적인 콜 플레이"] },
  { key: "tacticalIQ",    label: "전술 이해도",       icon: "🧠", options: ["정해진 롤만 소화", "기본 전술 충실", "높은 전술 이해도"] },
];

const TECH_SCORE = { "약함": 42, "보통": 65, "강함": 87, "느림": 42, "치달의 달인": 87, "백패스 위주": 42, "간결한 탈압박": 65, "크랙 (파괴자)": 87, "부정확": 42, "평범": 65, "택배 크로스": 87, "평범함": 42, "시야 넓음": 65, "대지를 가르는 패스": 87, "투박함": 42, "무난함": 65, "유려한 발밑": 87, "시도 안함": 42, "위협적": 65, "대포알": 87, "조심스러움": 42, "깔끔함": 65, "진공청소기": 87, "늦음": 42, "예측력 좋음": 65, "길목 차단 달인": 87, "짧은 패스 위주": 42, "안정적": 65, "롱패스 능함": 87, "잘 뚫림": 42, "끈질김": 65, "통곡의 벽": 87, "수비 집중": 42, "적절한 타이밍": 65, "지치지 않는 체력": 87, "아쉬움": 42, "날카로움": 87, "안정적인 짧은 패스": 65, "롱패스 빌드업": 87, "조용함": 42, "라인 컨트롤 능함": 65, "수비진의 사령관": 87, "걷어내기 위주": 42, "슈퍼세이브": 87, "완벽한 제공권": 87, "정확한 배급": 87, "잘 밀림": 42, "버팀": 65, "철벽 키핑": 87, "타점 높음": 87, "원샷원킬": 87, "제공권 장악": 87 };

// 포지션별 카드 색 테마 (TACTICAL_ROLES의 포지션 색 팔레트와 동일 계열)
// color = 카드 배경 그라데이션 시작색, accent = 강조색(OVR 숫자·테두리·라벨)
const POSITION_THEME = {
  ST: { color: "#3f1010", accent: "#ef4444" },
  LW: { color: "#3f2a08", accent: "#f59e0b" },
  RW: { color: "#3f2a08", accent: "#f59e0b" },
  CAM:{ color: "#2a1f4d", accent: "#a78bfa" },
  CM: { color: "#11284a", accent: "#60a5fa" },
  LB: { color: "#0d3320", accent: "#4ade80" },
  RB: { color: "#0d3320", accent: "#4ade80" },
  CB: { color: "#0b332a", accent: "#34d399" },
  GK: { color: "#1e293b", accent: "#94a3b8" },
};

const TACTICAL_ROLES = {
  "역습 축구": {
    color: "#ef4444", icon: "⚡", eng: "COUNTER ATTACK",
    teamSummary: [{ phase: "수비 시", icon: "🛡️", desc: "4-4-2 블록\n컴팩트 유지" }, { phase: "전환 순간", icon: "⚡", desc: "볼 탈취 즉시\n전방 빠른 배급" }, { phase: "공격 시", icon: "🥅", desc: "ST + 윙 삼각형\n빠른 마무리" }],
    positions: {
      ST:  { role: "최전방 타깃 & 마무리",       color: "#ef4444", tasks: ["상대 CB 압박으로 빌드업 방해", "역습 발동 시 즉시 스프린트로 깊이 확보", "크로스 및 2선 패스 침투 후 결정적 마무리"], keyAction: "공간 침투 타이밍", focus: "수비→공격 전환 시 즉시 스프린트", tip: "오프사이드 트랩 주의 — 라인 항상 체크" },
      LW:  { role: "좌측 역습 가담 & 돌파",      color: "#f59e0b", tasks: ["수비 시 좌측 미드필드 라인 유지", "볼 탈취 즉시 ST 향해 빠른 전진", "1대1 돌파 후 크로스/슈팅"], keyAction: "측면 스피드 돌파", focus: "볼 탈취 후 3초 내 전방 연결", tip: "LB와 동시 전진 금지 — 역할 분담 필수" },
      RW:  { role: "우측 역습 가담 & 슈팅",      color: "#f59e0b", tasks: ["수비 시 우측 미드필드 수비 가담", "역습 전환 시 우측 공간으로 즉시 스프린트", "안으로 컷인 후 슈팅 또는 ST 연결"], keyAction: "컷인 슈팅", focus: "오른발잡이라면 중앙으로 접어 슈팅 각도 확보", tip: "RB 오버래핑 공간 침범 금지" },
      CAM: { role: "역습 연결고리 & 찬스 메이커", color: "#a78bfa", tasks: ["수비 시 상대 CM 사이 공간 차단", "역습 시 ST와 윙 사이 연결 패스 공급", "박스 안 침투 타이밍 노리기"], keyAction: "전환 패스 & 침투", focus: "역습 시 공간 읽기와 빠른 원터치 패스", tip: "볼 로스트 즉시 압박 전환 — 지체 시 역습 차단 실패" },
      CM:  { role: "중원 장악 & 역습 스위치",    color: "#60a5fa", tasks: ["상대 미드필더 마크 및 공간 차단", "볼 탈취 후 빠른 전방 전환 패스", "상황에 따라 전방 지원 또는 수비 커버"], keyAction: "볼 탈취 & 전환 패스", focus: "2선에서 최전방으로 정확하고 빠른 패스", tip: "두 CM 중 한 명은 항상 수비 커버 대기" },
      LB:  { role: "좌측 수비 & 제한적 오버래핑", color: "#4ade80", tasks: ["상대 우측 윙어 끈질기게 마크", "역습 시 LW 지원 (상황 판단 필수)", "세트피스 시 좌측 크로스 담당"], keyAction: "수비 우선 + 기회적 가담", focus: "역습 중 LW와 동시 전진 절대 금지", tip: "공격 가담 후 빠른 귀환 필수" },
      RB:  { role: "우측 수비 & 제한적 오버래핑", color: "#4ade80", tasks: ["상대 좌측 윙어 끈질기게 마크", "역습 시 RW 지원 (상황 판단 필수)", "세트피스 시 우측 크로스 담당"], keyAction: "수비 우선 + 기회적 가담", focus: "역습 중 RW와 동시 전진 절대 금지", tip: "공격 가담 후 빠른 귀환 필수" },
      CB:  { role: "수비 라인 핵심 & 빌드업 시작", color: "#34d399", tasks: ["ST 마크 및 공중볼 경합", "역습 허용 시 빠른 귀환 및 지연 수비", "GK 볼 배급 시 빌드업 첫 패스"], keyAction: "라인 유지 & 클리어링", focus: "오프사이드 라인 — CB 간 소통 필수", tip: "역습 전술상 수비 라인 깊어질 수 있음 — 집중력 유지" },
      GK:  { role: "골문 수호 & 빠른 배급",      color: "#94a3b8", tasks: ["볼 잡는 즉시 전방 빠른 배급 (역습 핵심)", "롱킥으로 ST 또는 윙에게 직접 연결", "수비 라인 뒤 공간 케어"], keyAction: "빠른 배급 & 롱킥", focus: "불필요한 지연 없이 즉시 배급", tip: "발밑 기술 있다면 숏패스 빌드업도 상황에 따라 활용" },
    },
  },
  "점유율 축구": {
    color: "#3b82f6", icon: "🔄", eng: "POSSESSION",
    teamSummary: [{ phase: "수비 시", icon: "🛡️", desc: "4-4-2 블록\n볼 압박 즉시" }, { phase: "빌드업", icon: "🔄", desc: "GK → CB → CM\n천천히 조율" }, { phase: "공격 시", icon: "🎯", desc: "폭 활용 + 침투\n공간 지배" }],
    positions: {
      ST:  { role: "연계형 타깃 & 공간 창출",     color: "#ef4444", tasks: ["전방에서 볼 받아 미드필더와 연계 플레이", "포스트 플레이로 볼 받고 돌아서며 공간 열기", "CAM·윙과 삼각형 연계로 찬스 만들기"], keyAction: "연계 & 공간 창출", focus: "등지고 받아 돌아서는 포스트 플레이 반복", tip: "역습 버리기 — 점유율 우선이라 연계가 핵심" },
      LW:  { role: "좌측 폭 유지 & 패스 루트",    color: "#f59e0b", tasks: ["터치라인 쪽에서 폭을 넓게 유지", "LB 오버래핑 시 중앙으로 이동해 패스 루트 제공", "1대1 기회 시 과감한 돌파 후 크로스"], keyAction: "폭 유지 & 연계", focus: "터치라인 근처에서 볼 받아 템포 조율", tip: "LB 오버래핑 시 동시에 움직여 공간 활용" },
      RW:  { role: "우측 폭 유지 & 패스 루트",    color: "#f59e0b", tasks: ["터치라인 쪽에서 폭을 넓게 유지", "RB 오버래핑 시 중앙으로 이동해 패스 루트 제공", "1대1 기회 시 과감한 돌파 후 크로스"], keyAction: "폭 유지 & 연계", focus: "터치라인 근처에서 볼 받아 템포 조율", tip: "RB 오버래핑 시 동시에 움직여 공간 활용" },
      CAM: { role: "경기 템포 조율 & 키 패서",    color: "#a78bfa", tasks: ["중앙에서 볼 받아 좌우 패스로 공격 방향 결정", "좁은 공간에서 원터치 패스로 압박 탈출", "타이밍 좋게 ST 또는 윙 뒤로 스루 패스"], keyAction: "템포 조율 & 킬패스", focus: "볼 오래 갖지 말 것 — 원터치·투터치 빠른 배급", tip: "직접 득점보다 연결고리 역할이 핵심인 전술" },
      CM:  { role: "볼 순환 핵심 & 압박 탈출",    color: "#60a5fa", tasks: ["CB까지 깊게 내려와 빌드업 참여", "상대 압박 시 빠른 전환 패스로 압박 탈출", "폭넓은 활동량으로 패스 루트 제공"], keyAction: "볼 순환 & 압박 탈출", focus: "어떤 상황에서도 탈압박 — 볼 손실 최소화", tip: "수비 시도는 신중히 — 위치 이탈하면 공간 생긴다" },
      LB:  { role: "좌측 오버래핑 & 빌드업 기여", color: "#4ade80", tasks: ["공격 시 높은 위치까지 올라가 폭 제공", "LW와 역할 교환하며 패스 루트 다양화", "정확한 크로스로 찬스 창출"], keyAction: "적극적 오버래핑", focus: "LW가 중앙으로 들어올 때 빈 공간 오버래핑", tip: "공격 가담 후 빠른 귀환 필수" },
      RB:  { role: "우측 오버래핑 & 빌드업 기여", color: "#4ade80", tasks: ["공격 시 높은 위치까지 올라가 폭 제공", "RW와 역할 교환하며 패스 루트 다양화", "정확한 크로스로 찬스 창출"], keyAction: "적극적 오버래핑", focus: "RW가 중앙으로 들어올 때 빈 공간 오버래핑", tip: "공격 가담 후 빠른 귀환 필수" },
      CB:  { role: "빌드업 시작점 & 라인 조율",   color: "#34d399", tasks: ["GK로부터 볼 받아 빌드업 첫 단계 시작", "상대 압박 시 GK로 백패스 후 재시도", "오프사이드 라인 조율로 상대 공격 차단"], keyAction: "침착한 빌드업 배급", focus: "볼을 발 앞에 두고 패스 루트 미리 확인", tip: "점유율 전술의 시작은 CB의 침착함 — 허겁지겁 걷어내기 금지" },
      GK:  { role: "빌드업 참여 & 11번째 필드플레이어", color: "#94a3b8", tasks: ["짧은 패스로 CB에게 배급해 빌드업 시작", "상대 전방 압박 시 적극적으로 빌드업 참여", "높은 위치에서 수비 뒤 공간 케어"], keyAction: "짧은 배급 & 빌드업 참여", focus: "롱킥보다 짧은 패스 선호 — 점유율 유지가 핵심", tip: "발밑 기술 필수 — 압박 받을 때 침착한 패스 판단" },
    },
  },
  "압박 축구": {
    color: "#f59e0b", icon: "🔥", eng: "HIGH PRESS",
    teamSummary: [{ phase: "수비 시", icon: "🔥", desc: "전방 압박\n볼 탈취 목표" }, { phase: "전환 순간", icon: "⚡", desc: "탈취 즉시\n빠른 전환 공격" }, { phase: "공격 시", icon: "🥅", desc: "높은 위치에서\n빠른 마무리" }],
    positions: {
      ST:  { role: "최전방 압박 선봉 & 마무리",   color: "#ef4444", tasks: ["상대 GK·CB 직접 압박으로 빌드업 방해", "압박으로 유도한 실수에서 즉시 득점", "압박 실패 시 빠른 후퇴로 수비 유지"], keyAction: "전방 압박 & 즉시 마무리", focus: "GK 배급 방향 예측해 미리 압박 루트 차단", tip: "체력 소모 최대 — 전반 강하게, 후반 조절 전략 필요" },
      LW:  { role: "좌측 압박 & 상대 RB 가두기",  color: "#f59e0b", tasks: ["상대 RB 볼 받기 전 압박 루트 차단", "터치라인 쪽으로 몰아 탈출 공간 제거", "볼 탈취 후 즉시 역습 가담"], keyAction: "측면 압박 & 공간 차단", focus: "상대 RB와 CB 사이 패스 루트 차단이 핵심", tip: "압박 중 위치 이탈하면 상대가 공간 역이용 — 라인 유지" },
      RW:  { role: "우측 압박 & 상대 LB 가두기",  color: "#f59e0b", tasks: ["상대 LB 볼 받기 전 압박 루트 차단", "터치라인 쪽으로 몰아 탈출 공간 제거", "볼 탈취 후 즉시 역습 가담"], keyAction: "측면 압박 & 공간 차단", focus: "상대 LB와 CB 사이 패스 루트 차단이 핵심", tip: "압박 중 위치 이탈하면 상대가 공간 역이용 — 라인 유지" },
      CAM: { role: "2선 압박 & 중원 차단",         color: "#a78bfa", tasks: ["상대 CM 볼 받는 순간 즉시 압박", "수비 형태에서 가장 위험한 패스 루트 차단", "볼 탈취 후 빠른 전진 패스로 역습 연결"], keyAction: "2선 압박 & 인터셉트", focus: "상대 미드필더 볼 받기 전 예측 이동", tip: "전술 이해도가 가장 필요한 포지션 — 압박 타이밍 판단이 핵심" },
      CM:  { role: "공간 커버 & 볼 탈취 기계",    color: "#60a5fa", tasks: ["전방 압박 후 생기는 공간 즉시 커버", "상대 볼 트래핑 순간 타이밍 태클", "볼 탈취 후 전방 연결 또는 공격 지원"], keyAction: "공간 커버 & 타이밍 태클", focus: "전방 압박 팀원과 연동 — 혼자 압박하면 공간 생긴다", tip: "두 CM 중 한 명은 항상 수비 균형 유지 담당" },
      LB:  { role: "높은 수비 라인 & 측면 압박",  color: "#4ade80", tasks: ["높은 수비 라인 유지로 상대 공간 압박", "상대 윙어 볼 받는 순간 즉시 압박 가담", "오프사이드 트랩 적극 활용"], keyAction: "높은 라인 유지 & 압박 가담", focus: "CB와 라인 맞추기 — 오프사이드 조율이 핵심", tip: "라인이 높을수록 뒷공간 리스크 — 집중력 절대 유지" },
      RB:  { role: "높은 수비 라인 & 측면 압박",  color: "#4ade80", tasks: ["높은 수비 라인 유지로 상대 공간 압박", "상대 윙어 볼 받는 순간 즉시 압박 가담", "오프사이드 트랩 적극 활용"], keyAction: "높은 라인 유지 & 압박 가담", focus: "CB와 라인 맞추기 — 오프사이드 조율이 핵심", tip: "라인이 높을수록 뒷공간 리스크 — 집중력 절대 유지" },
      CB:  { role: "높은 라인 수비 & 전진 커버",  color: "#34d399", tasks: ["전체 수비 라인을 높게 유지해 상대 공간 압박", "전방 압박 실패 시 빠른 뒷공간 커버", "볼 탈취 후 빌드업 또는 즉시 전진 패스"], keyAction: "높은 라인 조율 & 전진 커버", focus: "라인 높이 유지 — 뒤로 물러서면 압박 전술 붕괴", tip: "스피드가 가장 중요한 CB 전술 — 뒷공간 대응 능력 필수" },
      GK:  { role: "높은 라인 뒤 스위퍼 & 재시작", color: "#94a3b8", tasks: ["높은 수비 라인 뒤 공간 적극적으로 커버", "뒷공간 침투 볼 신속하게 처리", "볼 잡으면 빠른 배급으로 압박 연속성 유지"], keyAction: "스위퍼 역할 & 빠른 재시작", focus: "페널티 박스 밖까지 나와 공간 케어 가능해야 함", tip: "압박 전술에서 GK 실수는 치명적 — 볼 처리 신중하게" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// 유틸 함수
// ═══════════════════════════════════════════════════════════════
const defaultPlayer = () => ({ name: "", age: "", height: "", weight: "", leftFoot: null, rightFoot: null, physical: {}, tech: {}, style: {}, teamInfluence: {} });

const STAT_S = { "하": 45, "중": 68, "상": 88 };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ── 피지컬 = 체격 × 얼마나 몸을 쓰는가 ────────────────────────
// 축구에서 몸싸움은 키·몸무게만으로도, 의지만으로도 결정되지 않습니다.
// 그래서 키·몸무게로 체격 점수를 내고, 적극성을 계수로 곱합니다.
// 큰 선수가 안 부딪히면 피지컬이 안 나오고, 작은 선수가 악착같이 붙어도
// 체격 차이를 다 뒤집지는 못합니다.
const PHYS_DRIVE = { "하": 0.78, "중": 1, "상": 1.16 };

// 눈금은 동호회 성인 남성 기준입니다. 162cm/55kg를 바닥, 188cm/92kg를 천장으로 둡니다.
// 몸싸움에서는 체중 쪽이 조금 더 크게 작용한다고 보고 45:55로 섞습니다.
function frameScore(height, weight) {
  const h = Number(height), w = Number(weight);
  if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) return null;
  const hs = clamp(((h - 162) / 26) * 100, 0, 100);
  const ws = clamp(((w - 55) / 37) * 100, 0, 100);
  return 0.45 * hs + 0.55 * ws;
}

function physicalScore(player) {
  const frame = frameScore(player?.height, player?.weight);
  // 키·몸무게가 없는 예전 저장본은 적극성만으로 예전 방식대로 냅니다
  if (frame === null) return STAT_S[player?.physical?.physical] || 65;
  const drive = PHYS_DRIVE[player?.physical?.physical] ?? 1;
  return Math.round(clamp((30 + frame * 0.62) * drive, 35, 95));
}

// 5점 척도 두 개를 사람이 읽는 말로 바꿉니다.
// AI에게 "왼발 2"만 던지면 그게 좋은 건지 나쁜 건지 알 수 없습니다.
function footNote(lf, rf) {
  if (!lf || !rf) return null;
  const gap = Math.abs(lf - rf);
  const strong = lf > rf ? "왼발" : "오른발";
  if (gap <= 1) return `양발잡이 (왼${lf}/오${rf})`;
  if (gap >= 3) return `${strong}만 씀 (왼${lf}/오${rf})`;
  return `${strong} 위주 (왼${lf}/오${rf})`;
}

// ── 코치 3인 (Phase 3) ──────────────────────────────────────
// 코치는 데이터를 덮어쓰는 사람이 아니라 "다르게 읽는 사람"입니다.
// 코치가 순위를 소리 없이 갈아치우면 "그럼 앞의 분석은 뭘 믿나"가 되기 때문에,
// 화면에는 계산 적합도와 코치 적합도를 언제나 나란히 둡니다.
//
// bias는 측정값이 아니라 설계된 취향입니다. 그래서 숫자를 계산으로 위장하지 않고
// "성향"이라고 이름 붙여 따로 표시하고, 코치마다 그렇게 보는 이유를 한 줄씩 답니다.
const COACHES = [
  {
    id: "textbook", name: "정석파", title: "원칙주의자", icon: "📐", color: "#60a5fa",
    tagline: "데이터가 가리키는 대로 갑니다.",
    desc: "성향 보정이 0입니다. 코치 추천이 데이터 추천과 언제나 같으므로, 나머지 두 코치를 견줘 볼 기준선이 됩니다.",
    bias: { "역습 축구": 0, "점유율 축구": 0, "압박 축구": 0 },
    why: {
      "역습 축구": "계산 결과를 그대로 따릅니다.",
      "점유율 축구": "계산 결과를 그대로 따릅니다.",
      "압박 축구": "계산 결과를 그대로 따릅니다.",
    },
    voice: "차분하고 건조하게 말합니다. 근거를 먼저 대고 지시를 뒤에 붙입니다. 과장하지 않고, 데이터에 없는 말은 하지 않습니다.",
  },
  {
    id: "attack", name: "공격파", title: "전방 압박 신봉자", icon: "⚔️", color: "#ef4444",
    tagline: "뺏을 거면 상대 진영에서 뺏습니다.",
    desc: "라인을 올려 앞에서 끊는 축구를 좋아합니다. 내려서서 기다리는 전술은 소극적이라고 봅니다.",
    bias: { "역습 축구": -5, "점유율 축구": 3, "압박 축구": 8 },
    why: {
      "역습 축구": "내려서서 기다리는 시간을 못 견딥니다.",
      "점유율 축구": "볼을 쥐고 상대를 밀어붙일 수 있다면 찬성입니다.",
      "압박 축구": "상대 진영에서 끊는 순간이 곧 득점 기회라고 봅니다.",
    },
    voice: "짧고 뜨겁게 말합니다. 약점보다 기회를 먼저 말하고, 망설이지 말라고 밀어붙입니다. 문장을 길게 늘이지 않습니다.",
  },
  {
    id: "defense", name: "수비파", title: "실리주의자", icon: "🛡️", color: "#4ade80",
    tagline: "안 먹히는 게 먼저입니다.",
    desc: "라인을 내려 뒷공간을 지우고, 뺏은 뒤에 찌르는 축구를 좋아합니다. 높은 압박은 뒷공간을 내주는 도박으로 봅니다.",
    bias: { "역습 축구": 7, "점유율 축구": 2, "압박 축구": -8 },
    why: {
      "역습 축구": "지킬 것을 지킨 다음 찌르는 게 가장 확실하다고 봅니다.",
      "점유율 축구": "우리가 볼을 쥐고 있는 동안은 실점하지 않는다는 쪽입니다.",
      "압박 축구": "라인을 올리는 순간 뒷공간이 열린다고 봅니다.",
    },
    voice: "단호하고 낮게 말합니다. 실수하면 어떻게 되는지를 먼저 짚고, 지킬 것을 분명히 정해줍니다. 칭찬은 짧습니다.",
  },
];

const coachById = id => COACHES.find(c => c.id === id) || COACHES[0];

// 받침이 있으면 앞것, 없으면 뒷것. josa("역습 축구","을","를") → "를"
function josa(word, withBatchim, without) {
  const last = String(word || "").trim().slice(-1);
  if (!last) return without;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return without;   // 한글이 아니면 받침 없음으로 봅니다
  return (code - 0xac00) % 28 ? withBatchim : without;
}

// 코치 성향을 얹은 순위. 계산값(dataFit)은 손대지 않고 따로 들고 갑니다.
function applyCoach(tactics, coach) {
  return (tactics || [])
    .map(t => {
      const bias = coach?.bias?.[t.name] ?? 0;
      return {
        ...t,
        dataFit: t.fit,                                       // 계산 + AI 보정까지 끝난 값
        coachBias: bias,
        coachFit: Math.max(20, Math.min(95, t.fit + bias)),
        coachWhy: coach?.why?.[t.name] || null,
      };
    })
    .sort((a, b) => b.coachFit - a.coachFit);
}

// AI가 코치를 못 골랐을 때(폴백) 코드가 대신 고릅니다.
// 앞에서 뺏을 체력·속도가 되면 공격파, 버티는 힘이 앞서면 수비파, 애매하면 정석파.
function suggestCoach(stats) {
  if (!stats) return COACHES[0];
  const press = (stats.avgStamina + stats.avgSpeed) / 2;
  const hold = (stats.avgPhysical + stats.avgTech) / 2;
  if (press >= 68 && press - hold >= 3) return coachById("attack");
  if (hold >= 66 && hold - press >= 5) return coachById("defense");
  return COACHES[0];
}

// 입력이 3지선다(하/중/상)이므로 화면에도 등급으로 되돌려 보여줍니다.
// 45/68/88 같은 숫자는 실제보다 정밀해 보이게 만드는 과장 표현이라 쓰지 않습니다.
// (단, 여러 항목을 합산한 OVR 종합 레이팅은 숫자로 유지합니다)
const GRADES = [
  { min: 0,  label: "하", level: 1, color: "#ef4444" },
  { min: 58, label: "중", level: 2, color: "#f59e0b" },
  { min: 79, label: "상", level: 3, color: "#4ade80" },
];
const gradeOf = (v) => GRADES.filter(g => v >= g.min).pop() || GRADES[0];
function analyzePlayer(player, pos) {
  const theme = POSITION_THEME[pos] || POSITION_THEME["CM"];
  const techVals = Object.values(player.tech || {}).map(v => TECH_SCORE[v] || 65);
  const avgTech = techVals.length ? Math.round(techVals.reduce((a, b) => a + b, 0) / techVals.length) : 65;
  const s = { speed: STAT_S[player.physical?.speed] || 65, stamina: STAT_S[player.physical?.stamina] || 65, physical: physicalScore(player), kick: avgTech, dribble: avgTech, shooting: avgTech, defense: avgTech };
  const overall = Math.round((s.speed + s.stamina + s.physical + s.kick + s.dribble + s.shooting + s.defense) / 7);
  const strengths = [], weaknesses = [];
  if (s.speed >= 80) strengths.push("압도적인 스피드"); if (s.stamina >= 80) strengths.push("탁월한 체력"); if (s.physical >= 80) strengths.push("강한 피지컬"); if (avgTech >= 80) strengths.push("뛰어난 기술력");
  if (s.speed <= 55) weaknesses.push("기동력 부족"); if (s.stamina <= 55) weaknesses.push("체력 관리 필요"); if (avgTech <= 55) weaknesses.push("기술 향상 필요");
  if (!strengths.length) strengths.push("균형잡힌 올라운더");
  if (!weaknesses.length) weaknesses.push("뚜렷한 약점 없음");
  return { theme, overall, stats: s, strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 2) };
}

// 압박 축구를 실제로 굴릴 수 있는 성향들 (선수 입력 화면의 "선호 움직임" 선택지와 동일한 문자열)
const PRESS_TRAITS = [
  "라인 브레이커 (뒷공간 침투)", "하프스페이스 침투", "섀도우 스트라이커 (박스 침투)",
  "박스-투-박스 (공수 양면)", "공격형 풀백 (오버래핑)", "파이터형 (도전적으로 커트)",
  "스위퍼 키퍼 (박스 밖까지 커버)",
];

function analyzeTeam(players) {
  const list = Object.values(players).filter(p => p?.name);
  if (!list.length) return null;
  const avg = arr => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  const speeds = list.map(p => STAT_S[p.physical?.speed] || 65);
  const staminas = list.map(p => STAT_S[p.physical?.stamina] || 65);
  const physicals = list.map(p => physicalScore(p));
  const avgSpeed = avg(speeds), avgStamina = avg(staminas), avgPhysical = avg(physicals);
  const avgTech = avg(list.map(p => { const vals = Object.values(p.tech || {}).map(v => TECH_SCORE[v] || 65); return vals.length ? avg(vals) : 65; }));
  const radar = { 공격력: Math.round(avgTech * 0.7 + avgSpeed * 0.3), 수비력: Math.round(avgTech * 0.5 + avgPhysical * 0.5), 스피드: avgSpeed, 체력: avgStamina, 기술력: avgTech };
  // 압박 성향 선수 비율.
  // (예전 코드는 존재하지 않는 style.defense 항목을 찾고 있어서 항상 0이었습니다)
  // 입력 화면에 "압박" 문항이 따로 없으므로, 압박 축구에 실제로 필요한 답변들로 셉니다.
  const pressers = list.filter(p =>
    p.physical?.stamina === "상" ||
    PRESS_TRAITS.includes(p.style?.movement) ||
    p.tech?.positioning === "길목 차단 달인" ||
    p.tech?.marking === "진공청소기" ||
    p.tech?.overlapping === "지치지 않는 체력"
  ).length;
  const pressRatio = pressers / list.length;
  const strengths = [], weaknesses = [];
  if (avgSpeed >= 72) strengths.push({ icon: "⚡", text: "빠른 측면 기동력", desc: "스피드가 뛰어나 역습과 측면 돌파에 유리합니다." });
  if (avgTech >= 72) strengths.push({ icon: "🎯", text: "뛰어난 기술력", desc: "전반적인 기술 수준이 높아 다양한 전술 소화가 가능합니다." });
  if (avgStamina >= 72) strengths.push({ icon: "🫀", text: "높은 활동량", desc: "체력이 좋아 후반에도 압박과 빠른 전환이 가능합니다." });
  if (avgPhysical >= 72) strengths.push({ icon: "💪", text: "강한 피지컬", desc: "몸싸움과 공중볼 경합에서 우위를 점합니다." });
  if (avgSpeed <= 58) weaknesses.push({ icon: "🐢", text: "전체적인 기동력 부족", desc: "빠른 역습이나 측면 침투에 약점이 있습니다." });
  if (avgTech <= 58) weaknesses.push({ icon: "🔧", text: "기술력 향상 필요", desc: "전반적인 기술 수준을 높여야 전술 실행력이 올라갑니다." });
  if (avgPhysical <= 58) weaknesses.push({ icon: "⚠️", text: "피지컬 경합 열세", desc: "몸싸움과 공중볼 경합에서 밀릴 수 있습니다." });
  if (!strengths.length) strengths.push({ icon: "⚖️", text: "균형잡힌 팀 구성", desc: "고른 능력치를 보유하고 있습니다." });
  if (!weaknesses.length) weaknesses.push({ icon: "📈", text: "전반적 향상 필요", desc: "모든 부분에서 고르게 발전이 필요합니다." });
  const tactics = [
    { name: "역습 축구", eng: "COUNTER ATTACK", icon: "⚡", color: "#ef4444", accent: "#fca5a5", fit: Math.min(95, Math.round(avgSpeed * 0.5 + avgTech * 0.3 + pressRatio * 8 + 20)), desc: "빠른 전환과 측면 스피드를 활용한 역습 전술", pros: ["적은 체력 소모", "빠른 전환으로 찬스 창출"], cons: ["점유율 낮음", "수비 집중력 요구"] },
    { name: "점유율 축구", eng: "POSSESSION", icon: "🔄", color: "#3b82f6", accent: "#93c5fd", fit: Math.min(95, Math.round(avgTech * 0.5 + avgStamina * 0.3 + 15)), desc: "패스와 볼 점유를 통해 경기를 지배하는 전술", pros: ["경기 주도권 확보", "상대 체력 소모"], cons: ["높은 기술력 요구", "체력 소모 많음"] },
    { name: "압박 축구", eng: "HIGH PRESS", icon: "🔥", color: "#f59e0b", accent: "#fcd34d", fit: Math.min(95, Math.round(avgStamina * 0.5 + avgSpeed * 0.3 + pressRatio * 20 + 10)), desc: "전방부터 강한 압박으로 상대 빌드업을 차단", pros: ["상대 실수 유도", "높은 위치 볼 탈취"], cons: ["높은 체력 요구", "압박 실패시 역습 위험"] },
  ].sort((a, b) => b.fit - a.fit);
  const overallRating = Math.round(Object.values(radar).reduce((a, b) => a + b, 0) / 5);
  return { radar, strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 2), tactics, overallRating, stats: { avgSpeed, avgStamina, avgPhysical, avgTech } };
}

// ───────────────────────────────────────────────────────────────
//  AI에게 넘길 선수 명단 만들기
//
//  코드 공식(analyzeTeam)은 속도·체력·피지컬·기술 평균만 봅니다.
//  입력 화면에서 고른 "선호 움직임 / 팀 헌신도 / 전술 이해도" 같은 성향 답변은
//  숫자로 환산되지 않아 공식이 통째로 놓치는 정보입니다.
//  그래서 이 답변들을 문장 그대로 AI에게 넘깁니다 — AI가 전술 점수를 보정할 유일한 근거입니다.
// ───────────────────────────────────────────────────────────────
function traitsOf(player, pos) {
  const cfg = POS_CONFIG[pos] || POS_CONFIG["CM"];
  const out = [];
  const push = (label, value) => { if (value) out.push(`${label}: ${value}`); };
  // 아래 셋은 점수 공식에 직접 들어가지는 않지만, AI가 문장을 쓸 때 실마리가 됩니다.
  // (체격은 피지컬 점수로도 이미 반영되어 있습니다)
  if (player.height && player.weight) push("체격", `${player.height}cm / ${player.weight}kg`);
  if (player.age) push("나이", `${player.age}세`);
  push("주발", footNote(player.leftFoot, player.rightFoot));
  cfg.tech.forEach(t => push(t.label, player.tech?.[t.key]));
  cfg.styleSpecific.forEach(x => push(x.label, player.style?.[x.key]));
  COMMON_STYLE.forEach(x => push(x.label, player.style?.[x.key]));
  TEAM_INFLUENCE.forEach(x => push(x.label, player.teamInfluence?.[x.key]));
  return out;
}

function buildRoster(playerMap) {
  return FORMATION_4231
    .filter(slot => playerMap[slot.id]?.name)
    .map(slot => {
      const player = playerMap[slot.id];
      const a = analyzePlayer(player, slot.pos);
      return {
        id: slot.id,
        name: player.name,
        pos: slot.pos,
        overall: a.overall,
        grades: {
          속도: gradeOf(a.stats.speed).label,
          체력: gradeOf(a.stats.stamina).label,
          피지컬: gradeOf(a.stats.physical).label,
          기술: gradeOf(a.stats.kick).label,
        },
        traits: traitsOf(player, slot.pos),
      };
    });
}

// ───────────────────────────────────────────────────────────────
//  데모 팀 프리셋
//
//  선수 한 명당 채워야 할 값이 14개, 11명이면 154개입니다.
//  선택지 문자열("치달의 달인")을 직접 쓰면 오타 하나로 TECH_SCORE 조회가 실패해
//  전부 65점으로 뭉개지고, 화면에는 아무 표시도 안 납니다.
//  그래서 아래 표는 전부 **선택지 번호(0·1·2)** 로만 적고,
//  실제 문자열은 POS_CONFIG에서 꺼내 씁니다. 오타가 구조적으로 불가능합니다.
//
//  한 줄 형식:
//  [이름, 나이, 키, 몸무게, 왼발, 오른발, [속도,체력,피지컬], [기술1,기술2,기술3],
//   선호움직임, [팀헌신도,위기대처], [리더십,소통,전술이해도]]
// ───────────────────────────────────────────────────────────────
const LV = ["하", "중", "상"];

function presetPlayer(pos, spec) {
  const cfg = POS_CONFIG[pos] || POS_CONFIG["CM"];
  const [name, age, height, weight, lf, rf, phys, tech, styleIdx, common, infl] = spec;
  // CB의 선호 움직임과 GK의 플레이 스타일은 선택지가 2개뿐이라 번호를 잘라 줍니다
  const pick = (opts, i) => opts[Math.min(i, opts.length - 1)];
  const p = {
    name, age: String(age), height: String(height), weight: String(weight),
    leftFoot: lf, rightFoot: rf, physical: {}, tech: {}, style: {}, teamInfluence: {},
  };
  PHYSICAL_STATS.forEach((x, i) => { p.physical[x.key] = LV[phys[i]]; });
  cfg.tech.forEach((x, i) => { p.tech[x.key] = pick(x.options, tech[i]); });
  cfg.styleSpecific.forEach(x => { p.style[x.key] = pick(x.options, styleIdx); });
  COMMON_STYLE.forEach((x, i) => { p.style[x.key] = pick(x.options, common[i]); });
  TEAM_INFLUENCE.forEach((x, i) => { p.teamInfluence[x.key] = pick(x.options, infl[i]); });
  return p;
}

function buildDemoSquad(team) {
  const squad = {};
  FORMATION_4231.forEach((slot, i) => { squad[slot.id] = presetPlayer(slot.pos, team.squad[i]); });
  return squad;
}

const DEMO_TEAMS = [
  {
    id: "speed",
    name: "청춘 FC",
    label: "20대 초반 · 속도형",
    tagline: "다 어리고 빠르다. 대신 발밑이 거칠고 전술 이해도가 낮다.",
    accent: "#ef4444",
    squad: [
      ["한도현", 22, 178, 70, 2, 4, [2,2,1], [1,0,1], 1, [1,1], [0,1,0]], // ST 라인 브레이커
      ["서지훈", 21, 174, 66, 4, 2, [2,2,0], [2,1,0], 0, [1,0], [0,1,0]], // LW 클래식 윙어
      ["박찬영", 23, 176, 69, 2, 4, [1,2,1], [1,1,1], 1, [1,1], [1,1,1]], // CAM 섀도우 스트라이커
      ["오세빈", 20, 172, 64, 2, 4, [2,2,0], [2,2,1], 0, [0,1], [0,0,0]], // RW 개인기 좋고 이기적
      ["김태윤", 22, 180, 74, 3, 3, [1,2,1], [1,1,1], 1, [2,1], [1,1,1]], // CM 박스-투-박스
      ["노준석", 24, 177, 72, 2, 3, [1,2,1], [1,0,0], 1, [2,1], [1,2,0]], // CM 박스-투-박스
      ["배시현", 21, 175, 68, 4, 2, [2,2,0], [0,2,1], 0, [1,0], [1,1,0]], // LB 공격형 풀백
      ["문정후", 23, 185, 80, 2, 4, [1,1,2], [1,0,0], 0, [1,1], [1,1,0]], // CB 파이터형
      ["신재혁", 22, 182, 77, 3, 3, [2,1,1], [1,1,0], 0, [1,1], [1,1,1]], // CB 파이터형
      ["조민석", 20, 173, 65, 2, 4, [2,2,0], [1,2,1], 0, [1,1], [0,1,0]], // RB 공격형 풀백
      ["윤태경", 25, 186, 79, 3, 3, [1,1,1], [1,1,1], 0, [1,1], [1,2,1]], // GK 스위퍼 키퍼
    ],
  },
  {
    id: "tech",
    name: "강남 로얄즈",
    label: "30대 중후반 · 기술형",
    tagline: "느리다. 대신 발밑과 전술 이해도로 경기를 지배한다.",
    accent: "#3b82f6",
    squad: [
      ["강현우", 36, 180, 78, 3, 4, [0,0,1], [2,2,1], 2, [1,2], [2,2,2]], // ST 펄스 나인
      ["정대석", 34, 176, 72, 4, 2, [1,1,1], [1,1,2], 0, [1,1], [1,2,2]], // LW 클래식 윙어 (폭 유지)
      ["홍기범", 35, 174, 70, 3, 5, [0,1,0], [2,2,1], 0, [1,2], [2,2,2]], // CAM 정통 플레이메이커
      ["백승주", 33, 175, 71, 2, 4, [1,1,1], [1,1,2], 0, [1,1], [1,1,2]], // RW 클래식 윙어
      ["차인호", 37, 178, 75, 3, 4, [0,1,1], [1,2,2], 2, [2,2], [2,2,2]], // CM 딥라잉 플레이메이커
      ["노태섭", 34, 181, 77, 3, 3, [0,0,1], [1,1,2], 0, [2,1], [1,1,2]], // CM 홀딩
      ["유상현", 35, 174, 71, 4, 2, [1,0,1], [1,1,2], 1, [1,1], [1,1,2]], // LB 인버티드 풀백
      ["민경호", 38, 186, 84, 2, 4, [0,0,2], [2,2,2], 1, [1,2], [2,2,2]], // CB 커맨더형 · 주장
      ["곽재민", 36, 183, 81, 3, 3, [0,1,2], [1,1,1], 1, [1,1], [1,1,2]], // CB 커맨더형
      ["서동철", 33, 176, 73, 2, 4, [1,1,1], [1,1,1], 1, [2,1], [1,1,1]], // RB 인버티드 풀백
      ["진영수", 39, 184, 82, 3, 4, [0,1,1], [1,1,2], 1, [1,2], [1,2,2]], // GK 클래식 키퍼
    ],
  },
  {
    id: "mixed",
    name: "목요일 조기축구회",
    label: "20~40대 혼재 · 애매한 팀",
    tagline: "능력치는 다 고만고만. 그런데 뛰는 스타일이 제각각이라 답이 안 보인다.",
    accent: "#f59e0b",
    squad: [
      ["고영남", 41, 177, 82, 2, 3, [0,0,2], [1,2,2], 0, [0,1], [0,1,1]], // ST 타겟맨 · 맏형
      ["류현석", 27, 172, 67, 4, 2, [2,1,0], [2,2,0], 1, [0,0], [0,0,0]], // LW 인버티드 · 이기적
      ["안대호", 33, 175, 73, 3, 3, [1,1,1], [1,1,1], 2, [1,1], [1,1,1]], // CAM 프리롤
      ["심우진", 38, 170, 70, 2, 3, [0,1,1], [0,1,2], 0, [2,1], [1,2,1]], // RW 느리지만 택배 크로스
      ["지승우", 29, 179, 76, 3, 3, [1,2,1], [2,1,1], 1, [2,2], [1,2,2]], // CM 박스-투-박스
      ["표한결", 45, 173, 74, 2, 3, [0,0,1], [1,2,2], 0, [1,1], [2,2,2]], // CM 홀딩 · 주장
      ["남기훈", 31, 176, 72, 4, 2, [1,1,1], [1,0,1], 2, [1,1], [1,1,0]], // LB 수비형 풀백
      ["봉재석", 35, 181, 83, 2, 3, [0,1,2], [2,1,0], 1, [1,1], [1,2,1]], // CB 커맨더형
      ["하동민", 26, 184, 78, 3, 3, [1,1,1], [1,0,1], 0, [1,0], [0,0,0]], // CB 파이터형
      ["여준호", 30, 174, 71, 2, 4, [1,1,1], [1,1,1], 0, [1,1], [0,1,1]], // RB 공격형 풀백
      ["석민찬", 44, 178, 85, 3, 2, [0,0,1], [1,1,1], 1, [1,1], [1,1,1]], // GK 클래식 키퍼
    ],
  },
];

// 데모 팀 고르기 (랜딩 · 선수 입력 화면 양쪽에서 씁니다)
function DemoPicker({ onPick, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 220, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, maxHeight: "86vh", overflowY: "auto", background: "#0d1420", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 20, padding: "22px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0fdf4" }}>⚡ 데모 팀으로 둘러보기</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, lineHeight: 1.5 }}>11명이 미리 입력된 팀입니다. 팀마다 선수 성향이 달라서 AI가 추천하는 전술도 달라져요.</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#64748b", fontSize: 18, cursor: "pointer", width: 34, height: 34, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {DEMO_TEAMS.map(team => (
            <button key={team.id} onClick={() => onPick(team)} style={{ textAlign: "left", background: "rgba(255,255,255,0.03)", border: `1px solid ${team.accent}33`, borderLeft: `3px solid ${team.accent}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap", marginBottom: 5 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#f0fdf4" }}>{team.name}</span>
                <span style={{ fontSize: 10.5, color: team.accent, border: `1px solid ${team.accent}44`, borderRadius: 5, padding: "1px 7px" }}>{team.label}</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.55 }}>{team.tagline}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 공통 UI
// ═══════════════════════════════════════════════════════════════
const SectionLabel = ({ number, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
    <span style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 6, padding: "3px 9px", fontSize: 10, fontWeight: 700, color: "#052e16", letterSpacing: 1 }}>0{number}</span>
    <span style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4" }}>{children}</span>
    <div style={{ flex: 1, height: 1, background: "rgba(74,222,128,0.1)" }} />
  </div>
);

const FootRating = ({ label, value, onChange }) => (
  <div>
    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 9 }}>{label}</div>
    <div style={{ display: "flex", gap: 7 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n === value ? null : n)} style={{ flex: "1 1 0", minWidth: 0, maxWidth: 38, aspectRatio: "1 / 1", borderRadius: "50%", border: value && n <= value ? "2px solid #4ade80" : "1px solid rgba(255,255,255,0.1)", background: value && n <= value ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.03)", color: value && n <= value ? "#4ade80" : "#475569", fontWeight: value === n ? 700 : 500, fontSize: 14, cursor: "pointer", transition: "all 0.15s" }}>{n}</button>
      ))}
    </div>
  </div>
);

const PhysBtn = ({ value, desc, active, onClick }) => {
  const c = value === "하" ? "#ef4444" : value === "중" ? "#f59e0b" : "#4ade80";
  return <button onClick={onClick} title={desc} style={{ flex: 1, padding: "8px 5px", borderRadius: 9, border: active ? `1.5px solid ${c}` : "1px solid rgba(255,255,255,0.08)", background: active ? `${c}22` : "rgba(255,255,255,0.03)", color: active ? c : "#64748b", fontWeight: active ? 700 : 500, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
    <div style={{ fontWeight: 700 }}>{value}</div>
    <div style={{ fontSize: 10, marginTop: 2, color: active ? `${c}bb` : "#3d5068" }}>{desc}</div>
  </button>;
};

const TechBtn = ({ opt, index, active, onClick }) => {
  const colors = ["#ef4444", "#f59e0b", "#4ade80"];
  const c = colors[index] || "#4ade80";
  return <button onClick={onClick} style={{ flex: 1, padding: "9px 5px", borderRadius: 9, fontSize: 11, lineHeight: 1.35, textAlign: "center", border: active ? `1.5px solid ${c}` : "1px solid rgba(255,255,255,0.08)", background: active ? `${c}22` : "rgba(255,255,255,0.03)", color: active ? c : "#64748b", fontWeight: active ? 700 : 400, cursor: "pointer" }}>{opt}</button>;
};

const StyleBtn = ({ opt, active, onClick, color }) => (
  <button onClick={onClick} style={{ width: "100%", padding: "10px 14px", borderRadius: 9, fontSize: 12, textAlign: "left", border: active ? `1.5px solid ${color}` : "1px solid rgba(255,255,255,0.08)", background: active ? `${color}18` : "rgba(255,255,255,0.02)", color: active ? color : "#64748b", fontWeight: active ? 600 : 400, cursor: "pointer", marginBottom: 7, display: "flex", alignItems: "center", gap: 8 }}>
    {active && <span style={{ fontSize: 10, background: color, color: "#000", borderRadius: 4, padding: "1px 6px", fontWeight: 700, flexShrink: 0 }}>선택</span>}
    {opt}
  </button>
);

const StatBar = ({ label, value }) => {
  const g = gradeOf(value);
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: g.color }}>{g.label}</span>
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{ flex: 1, height: 5, borderRadius: 3, background: n <= g.level ? g.color : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
    </div>
  );
};

// AI가 실패했을 때 "왜 AI 코멘트가 없는지"를 화면이 스스로 설명하게 합니다.
// 폴백은 이 서비스의 기본 상태이지 고장이 아닙니다. 다만 아무 표시가 없으면
// 처음 보는 사람 눈에는 AI가 아예 없는 서비스로 읽힙니다. 그래서 한 줄을 남깁니다.
const FALLBACK_NOTICE = {
  quota:        { icon: "⏳", text: "오늘 무료 AI 분석 한도를 다 썼어요. 한국시간 오후 4시쯤 초기화돼요.", retry: false },
  "rate-limit": { icon: "⏱️", text: "요청이 너무 잦아요. 1분쯤 뒤에 다시 시도해 주세요.",               retry: true  },
  offline:      { icon: "📡", text: "인터넷 연결이 끊겼어요. 연결을 확인하고 다시 시도해 주세요.",        retry: true  },
  "no-key":     { icon: "🔑", text: "AI 키가 설정되지 않았어요.",                                      retry: false },
  timeout:      { icon: "🐢", text: "AI 응답이 너무 오래 걸려 기다리지 않았어요.",                      retry: true  },
};
const DEFAULT_NOTICE = { icon: "🤖", text: "AI 코치에 연결하지 못했어요.", retry: true };

function AiFallbackNotice({ error, onRetry, pending }) {
  if (!error) return null;
  const n = FALLBACK_NOTICE[error.code] || DEFAULT_NOTICE;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "11px 13px", marginBottom: 16 }}>
      <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.5 }}>{n.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600, lineHeight: 1.5 }}>{n.text}</div>
        <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.55, marginTop: 3 }}>
          레이팅·적합도 같은 숫자는 그대로예요. AI가 쓰는 문장만 빠진 상태입니다.
        </div>
      </div>
      {n.retry && onRetry && (
        <button onClick={onRetry} disabled={pending} style={{ flexShrink: 0, alignSelf: "center", padding: "6px 11px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.1)", color: "#fbbf24", fontSize: 11, fontWeight: 700, cursor: pending ? "default" : "pointer", opacity: pending ? 0.5 : 1 }}>
          {pending ? "부르는 중" : "다시 시도"}
        </button>
      )}
    </div>
  );
}

const Toast = ({ msg }) => msg ? (
  <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#0d1420", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: "12px 22px", fontSize: 13, fontWeight: 600, color: "#4ade80", zIndex: 300, whiteSpace: "nowrap", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
    {msg}
  </div>
) : null;

// ═══════════════════════════════════════════════════════════════
// 랜딩 페이지
// ═══════════════════════════════════════════════════════════════
const LANDING_FEATURES = [
  { icon: "⚽", title: "포메이션 기반 입력", desc: "4-2-3-1 포메이션에서 포지션을 직접 클릭해 선수 정보를 입력해요" },
  { icon: "🃏", title: "선수 개인 분석", desc: "선수별 능력치와 AI 코멘트를 카드 한 장으로 정리해 보여줘요" },
  { icon: "📡", title: "팀 역량 레이더 차트", desc: "11명 데이터를 종합해 팀 강점/약점을 한눈에 파악해요" },
  { icon: "🧠", title: "AI 전술 추천", desc: "역습/점유율/압박 중 우리 팀에 맞는 전술을 추천해드려요" },
  { icon: "📋", title: "포지션별 역할 가이드", desc: "선택한 전술에 맞게 각 선수의 역할과 임무를 알려줘요" },
  { icon: "🔗", title: "결과 공유", desc: "링크 하나로 팀원들에게 분석 결과를 바로 공유할 수 있어요" },
];

const LANDING_STEPS = [
  { num: "01", title: "팀 구성",       desc: "팀 이름을 적고 포지션별 맞춤 질문으로 11명을 채워요", icon: "📝" },
  { num: "02", title: "전력 브리핑",   desc: "팀 강점·약점과 선수별 AI 코멘트를 정리해요",          icon: "📡" },
  { num: "03", title: "코치 선임",     desc: "코치 3인 중 한 명을 고르면 같은 데이터에 다른 해석이 붙어요", icon: "🧑‍🏫" },
  { num: "04", title: "전술 가이드",   desc: "포지션별 역할과 개인 맞춤 지시를 안내해요",           icon: "🎯" },
  { num: "05", title: "라커룸",        desc: "킥오프 직전 감독의 팀 토크로 마무리해요",             icon: "🗣️" },
];

function LandingPage({ onStart, onDemo }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  return (
    <div style={{ minHeight: "100vh", background: "#060b14", fontFamily: "'Pretendard','Noto Sans KR',sans-serif", color: "#e2e8f0", overflowX: "hidden" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}} @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>

      {/* 배경 */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(22,163,74,0.06) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.04) 0%,transparent 70%)" }} />
      </div>

      {/* 네비게이션 */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(6,11,20,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(74,222,128,0.15)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>⚽</div>
            <div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, fontWeight: 700, color: "#4ade80", letterSpacing: 2, lineHeight: 1 }}>SquadLab</div>
              <div style={{ fontSize: 9, color: "#4ade80aa", letterSpacing: 3 }}>AI TACTICAL ADVISOR</div>
            </div>
          </div>
          <button onClick={onStart} style={{ padding: "9px 22px", borderRadius: 20, border: "1px solid rgba(74,222,128,0.4)", background: "rgba(74,222,128,0.1)", color: "#4ade80", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>분석 시작하기 →</button>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* 히어로 */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center", opacity: visible ? 1 : 0, transition: "all 0.8s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#4ade80", fontWeight: 600, marginBottom: 32, animation: "pulse 2s ease infinite" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            AI 전술 분석 서비스 · 무료 체험
          </div>
          <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: "clamp(40px,8vw,72px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 24, animation: "fadeUp 0.8s ease 0.1s both" }}>
            <span style={{ color: "#f0fdf4" }}>우리 팀의 </span>
            <span style={{ background: "linear-gradient(135deg,#4ade80,#60a5fa,#4ade80)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "gradientShift 3s ease infinite" }}>전술 참모</span>
            <br /><span style={{ color: "#f0fdf4" }}>SquadLab</span>
          </h1>
          <p style={{ fontSize: "clamp(15px,2.5vw,18px)", color: "#64748b", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px", animation: "fadeUp 0.8s ease 0.2s both" }}>
            선수 11명의 정보를 입력하면<br />AI가 팀을 분석하고 최적의 전술을 추천해드려요
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.8s ease 0.3s both" }}>
            <button onClick={onStart} style={{ padding: "16px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#16a34a,#4ade80)", color: "#052e16", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, boxShadow: "0 0 30px rgba(74,222,128,0.3)" }}>⚽ 무료로 시작하기</button>
            <button onClick={onDemo} style={{ padding: "16px 28px", borderRadius: 14, border: "1px solid rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.07)", color: "#4ade80", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>⚡ 데모 팀 바로 보기</button>
          </div>
          <div style={{ fontSize: 11.5, color: "#475569", marginTop: 14, animation: "fadeUp 0.8s ease 0.35s both" }}>입력이 번거로우시면 데모 팀으로 30초 만에 결과까지 볼 수 있어요</div>
          <div className="sq-landing-stats" style={{ display: "flex", justifyContent: "center", gap: 48, marginTop: 60, animation: "fadeUp 0.8s ease 0.4s both" }}>
            {[{ num: "11", unit: "명", label: "선수 분석" }, { num: "3", unit: "가지", label: "전술 추천" }, { num: "100", unit: "%", label: "무료 서비스" }].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 40, fontWeight: 700, color: "#4ade80", lineHeight: 1 }}>{s.num}{s.unit}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 전술 카드 */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[{ name: "역습 축구", icon: "⚡", color: "#ef4444", desc: "빠른 전환과 측면 돌파" }, { name: "점유율 축구", icon: "🔄", color: "#3b82f6", desc: "패스와 볼 점유 지배" }, { name: "압박 축구", icon: "🔥", color: "#f59e0b", desc: "전방 압박으로 볼 탈취" }].map((t, i) => (
              <div key={i} className="sq-landing-tactic-card" style={{ background: `${t.color}10`, border: `1px solid ${t.color}33`, borderRadius: 16, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 30, marginBottom: 10, animation: `float 3s ease infinite`, animationDelay: `${i * 0.5}s` }}>{t.icon}</div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, fontWeight: 700, color: t.color, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "#475569" }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 플로우 */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 3, marginBottom: 10 }}>HOW IT WORKS</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 32, fontWeight: 700, color: "#f0fdf4" }}>AI가 팀을 읽는 순서</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LANDING_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.1)", borderRadius: 14, padding: "18px 22px" }}>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 26, fontWeight: 700, color: "rgba(74,222,128,0.3)", minWidth: 40 }}>{step.num}</div>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4", marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: "#475569" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 기능 */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 3, marginBottom: 10 }}>FEATURES</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 32, fontWeight: 700, color: "#f0fdf4" }}>SquadLab이 제공하는 것들</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {LANDING_FEATURES.map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.1)", borderRadius: 14, padding: "20px" }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4", marginBottom: 5 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 100px" }}>
          <div style={{ background: "linear-gradient(135deg,rgba(22,163,74,0.12),rgba(59,130,246,0.08))", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 24, padding: "60px 40px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 20, animation: "float 3s ease infinite" }}>⚽</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 32, fontWeight: 700, color: "#f0fdf4", marginBottom: 12 }}>지금 바로 시작해보세요</div>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 32, lineHeight: 1.7 }}>선수 11명의 정보만 입력하면<br />AI가 최적의 전술을 찾아드려요</div>
            <button onClick={onStart} style={{ padding: "18px 52px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#16a34a,#4ade80)", color: "#052e16", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, boxShadow: "0 0 40px rgba(74,222,128,0.3)" }}>⚽ 무료로 시작하기</button>
          </div>
        </section>

        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 24, height: 24, background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⚽</div>
            <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 16, fontWeight: 700, color: "#4ade80", letterSpacing: 2 }}>SquadLab</span>
          </div>
          <div style={{ fontSize: 12, color: "#334155" }}>AI Tactical Advisor · 축구 동호인을 위한 전술 분석 서비스</div>
        </footer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 1: 포메이션 + 선수 입력 팝업
// ═══════════════════════════════════════════════════════════════
function PlayerInputPopup({ slot, player, onSave, onClose }) {
  const [form, setForm] = useState(player || defaultPlayer());
  const config = POS_CONFIG[slot.pos] || POS_CONFIG["CM"];
  const setTech = (k, v) => setForm(f => ({ ...f, tech: { ...f.tech, [k]: v } }));
  const setStyle = (k, v) => setForm(f => ({ ...f, style: { ...f.style, [k]: v } }));
  const setTI = (k, v) => setForm(f => ({ ...f, teamInfluence: { ...f.teamInfluence, [k]: v } }));
  const isComplete = form.name && Number(form.height) > 0 && Number(form.weight) > 0 && form.leftFoot && form.rightFoot && PHYSICAL_STATS.every(s => form.physical[s.key]) && config.tech.every(t => form.tech[t.key]) && config.styleSpecific.every(s => form.style[s.key]) && COMMON_STYLE.every(s => form.style[s.key]) && TEAM_INFLUENCE.every(t => form.teamInfluence[t.key]);

  return (
    <div className="sq-popup-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "20px 16px" }}>
      <div className="sq-popup" style={{ width: "100%", maxWidth: 560, background: "#0d1420", border: `1px solid ${config.color}55`, borderRadius: 20, padding: "28px 24px", marginTop: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ background: `linear-gradient(135deg,${config.color}cc,${config.color})`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>{slot.pos}</span>
              <span style={{ fontSize: 13, color: config.color }}>{config.label}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f0fdf4" }}>선수 정보 입력</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#64748b", fontSize: 18, cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <SectionLabel number={1}>기본 정보</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="이름" style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0fdf4", fontSize: 14 }} /></div>
          {[{ k: "height", ph: "키 (cm)", min: 100, max: 220 }, { k: "weight", ph: "몸무게 (kg)", min: 20, max: 200 }].map(f => (
            <input key={f.k} type="number" min={f.min} max={f.max} value={form[f.k]} onChange={e => setForm(fm => ({ ...fm, [f.k]: e.target.value }))} placeholder={f.ph} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0fdf4", fontSize: 13 }} />
          ))}
          <input type="number" min={10} max={100} value={form.age} onChange={e => setForm(fm => ({ ...fm, age: e.target.value }))} placeholder="나이 (선택)" style={{ gridColumn: "1 / -1", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0fdf4", fontSize: 13 }} />
        </div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: -6, marginBottom: 16, lineHeight: 1.5 }}>
          키·몸무게는 아래 <b style={{ color: "#94a3b8" }}>몸싸움 적극성</b>과 합쳐져 피지컬 점수가 됩니다.
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 14 }}>🦶 주발 능력 (5점 만점)</div>
          <div className="sq-foot-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <FootRating label="왼발" value={form.leftFoot} onChange={v => setForm(f => ({ ...f, leftFoot: v }))} />
            <FootRating label="오른발" value={form.rightFoot} onChange={v => setForm(f => ({ ...f, rightFoot: v }))} />
          </div>
        </div>

        <SectionLabel number={2}>신체 및 운동 능력</SectionLabel>
        <div style={{ marginBottom: 22 }}>
          {PHYSICAL_STATS.map(stat => (
            <div key={stat.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{stat.icon} {stat.label}</div>
              <div style={{ display: "flex", gap: 6 }}>{stat.levels.map(l => <PhysBtn key={l.value} value={l.value} desc={l.desc} active={form.physical[stat.key] === l.value} onClick={() => setForm(f => ({ ...f, physical: { ...f.physical, [stat.key]: l.value } }))} />)}</div>
            </div>
          ))}
        </div>

        <SectionLabel number={3}>기술적 강점 — {config.label}</SectionLabel>
        <div style={{ background: `${config.color}08`, border: `1px solid ${config.color}20`, borderRadius: 12, padding: "14px 16px", marginBottom: 22 }}>
          {config.tech.map(t => (
            <div key={t.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{t.label}</div>
              <div style={{ display: "flex", gap: 6 }}>{t.options.map((opt, i) => <TechBtn key={opt} opt={opt} index={i} active={form.tech[t.key] === opt} onClick={() => setTech(t.key, opt)} />)}</div>
            </div>
          ))}
        </div>

        <SectionLabel number={4}>플레이 성향</SectionLabel>
        <div style={{ background: `${config.color}08`, border: `1px solid ${config.color}20`, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: config.color, marginBottom: 10, fontWeight: 600 }}>{config.emoji} {config.label} 맞춤</div>
          {config.styleSpecific.map(s => (
            <div key={s.key} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{s.label}</div>
              {s.options.map(opt => <StyleBtn key={opt} opt={opt} active={form.style[s.key] === opt} onClick={() => setStyle(s.key, opt)} color={config.color} />)}
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>공통 성향</div>
          {COMMON_STYLE.map(s => (
            <div key={s.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{s.label}</div>
              <div style={{ display: "flex", gap: 6 }}>{s.options.map((opt, i) => <TechBtn key={opt} opt={opt} index={i} active={form.style[s.key] === opt} onClick={() => setStyle(s.key, opt)} />)}</div>
            </div>
          ))}
        </div>

        <SectionLabel number={5}>팀 영향력</SectionLabel>
        <div style={{ marginBottom: 24 }}>
          {TEAM_INFLUENCE.map(t => (
            <div key={t.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{t.icon} {t.label}</div>
              <div style={{ display: "flex", gap: 6 }}>{t.options.map((opt, i) => <TechBtn key={opt} opt={opt} index={i} active={form.teamInfluence[t.key] === opt} onClick={() => setTI(t.key, opt)} />)}</div>
            </div>
          ))}
        </div>

        <button onClick={() => isComplete && onSave(form)} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: isComplete ? `linear-gradient(135deg,${config.color}cc,${config.color})` : "rgba(255,255,255,0.06)", color: isComplete ? "#fff" : "#334155", fontSize: 15, fontWeight: 700, cursor: isComplete ? "pointer" : "not-allowed", letterSpacing: 1 }}>
          {isComplete ? `${config.emoji} ${slot.pos} 선수 저장` : "모든 항목을 입력해주세요"}
        </button>
      </div>
    </div>
  );
}

function FormationScreen({ teamName, onTeamNameChange, players, onPlayerSave, onNext, onBack, onDemo }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const completedCount = FORMATION_4231.filter(s => players[s.id]?.name).length;
  const ready = !!teamName.trim() && completedCount === 11;
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 16px 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 2, marginBottom: 6 }}>STEP 1</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>{teamName.trim() || "팀 구성"}</div>
        <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>팀 이름을 적고, 포지션을 눌러 선수 정보를 채우세요</div>
      </div>
      {/* 팀 이름 — 예전에는 이 입력 하나 때문에 화면이 따로 있었습니다 */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 8 }}>팀 이름</div>
        <input value={teamName} onChange={e => onTeamNameChange(e.target.value)} placeholder="예) FC 친구들" maxLength={20} style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0fdf4", fontSize: 16 }} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 8, padding: "6px 16px", fontSize: 13, fontWeight: 700, color: "#052e16", letterSpacing: 2, whiteSpace: "nowrap" }}>4-2-3-1</div>
          <span style={{ fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{completedCount} / 11명 완료</span>
          <button onClick={onDemo} style={{ marginLeft: "auto", padding: "6px 13px", borderRadius: 8, border: "1px solid rgba(74,222,128,0.28)", background: "rgba(74,222,128,0.07)", color: "#4ade80", fontSize: 11.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>⚡ 데모 팀으로 채우기</button>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(completedCount / 11) * 100}%`, background: "linear-gradient(90deg,#16a34a,#4ade80)", borderRadius: 2, transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ position: "relative", width: "100%", paddingBottom: "130%", background: "linear-gradient(180deg,#1a4a2a,#1e5c30,#1a4a2a)", borderRadius: 16, border: "2px solid rgba(74,222,128,0.2)", overflow: "hidden", marginBottom: 18 }}>
        {[...Array(8)].map((_, i) => <div key={i} style={{ position: "absolute", top: `${i * 12.5}%`, left: 0, right: 0, height: "6.25%", background: i % 2 === 0 ? "rgba(0,0,0,0.08)" : "transparent" }} />)}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 130" preserveAspectRatio="none">
          <rect x="4" y="3" width="92" height="124" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <line x1="4" y1="65" x2="96" y2="65" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <circle cx="50" cy="65" r="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <rect x="22" y="3" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="22" y="109" width="56" height="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <rect x="40" y="1.5" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
          <rect x="40" y="125.5" width="20" height="3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        </svg>
        {FORMATION_4231.map(slot => {
          const p = players[slot.id]; const filled = !!p?.name;
          const posColor = POS_CONFIG[slot.pos]?.color || "#4ade80";
          return (
            <button key={slot.id} onClick={() => setSelectedSlot(slot)} style={{ position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, transform: "translate(-50%,-50%)", width: 52, height: 52, borderRadius: "50%", border: filled ? `2.5px solid ${posColor}` : "2px dashed rgba(255,255,255,0.35)", background: filled ? `${posColor}33` : "rgba(0,0,0,0.45)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: filled ? `0 0 12px ${posColor}44` : "none", padding: 2 }}>
              {filled ? (<><div style={{ fontSize: 9, fontWeight: 700, color: posColor }}>{slot.pos}</div><div style={{ fontSize: 10, fontWeight: 700, color: "#f0fdf4", maxWidth: 44, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div></>) : (<><div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{slot.pos}</div><div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>+</div></>)}
            </button>
          );
        })}
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: "#4ade8099", letterSpacing: 1, marginBottom: 10 }}>선수 현황</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {FORMATION_4231.map(slot => {
            const p = players[slot.id];
            const posColor = POS_CONFIG[slot.pos]?.color || "#4ade80";
            return (
              <div key={slot.id} onClick={() => setSelectedSlot(slot)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: p?.name ? `${posColor}10` : "rgba(255,255,255,0.02)", border: `1px solid ${p?.name ? `${posColor}33` : "rgba(255,255,255,0.05)"}`, cursor: "pointer" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: posColor, minWidth: 30 }}>{slot.pos}</div>
                <div style={{ fontSize: 12, color: p?.name ? "#f0fdf4" : "#334155" }}>{p?.name || "미입력"}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 처음으로</button>
        <button onClick={() => ready && onNext()} disabled={!ready} style={{ flex: 2, padding: "14px", borderRadius: 14, border: "none", background: ready ? "linear-gradient(135deg,#16a34a,#4ade80)" : "rgba(255,255,255,0.06)", color: ready ? "#052e16" : "#334155", fontSize: 15, fontWeight: 700, cursor: ready ? "pointer" : "not-allowed", letterSpacing: 1 }}>
          {ready ? "⚽ 전력 브리핑 보기" : completedCount < 11 ? `${11 - completedCount}명 더 입력해주세요` : "팀 이름을 적어주세요"}
        </button>
      </div>
      {selectedSlot && <PlayerInputPopup slot={selectedSlot} player={players[selectedSlot.id]} onSave={data => { onPlayerSave(selectedSlot.id, data); setSelectedSlot(null); }} onClose={() => setSelectedSlot(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 2: 개인 선수 분석 슬라이더
// ═══════════════════════════════════════════════════════════════
function PlayerCard({ player, slot, ai, aiPending }) {
  const local = analyzePlayer(player, slot.pos);
  const { theme, overall, stats } = local;
  // AI 결과가 오면 문구만 교체 — 숫자(OVR·스탯)는 항상 코드 계산값을 씀
  const strengths  = ai?.strengths?.length  ? ai.strengths  : local.strengths;
  const weaknesses = ai?.weaknesses?.length ? ai.weaknesses : local.weaknesses;
  const comment = ai?.comment;
  const localSummary = `${local.strengths[0]} 유형입니다. 아래 능력치를 참고하세요.`;
  return (
    <div style={{ minWidth: "100%", padding: "0 2px" }}>
      <div style={{ background: `linear-gradient(145deg,${theme.color} 0%,#0a0e1a 65%)`, border: `2px solid ${theme.accent}44`, borderRadius: 20, padding: "22px 18px", position: "relative", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `${theme.accent}08` }} />
        <div style={{ position: "relative" }}>
          <span style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}55`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: theme.accent, letterSpacing: 1, display: "inline-block", marginBottom: 12 }}>{slot.pos}</span>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", minWidth: 72 }}>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 52, fontWeight: 700, color: theme.accent, lineHeight: 1 }}>{overall}</div>
              <div style={{ fontSize: 10, color: `${theme.accent}88`, marginTop: 3, letterSpacing: 1 }}>OVR</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 3 }}>
                {[["속도", stats.speed], ["체력", stats.stamina], ["피지컬", stats.physical]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 9, color: theme.accent, fontWeight: 700 }}>{k}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: gradeOf(v).color }}>{gradeOf(v).label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: `${theme.accent}88`, letterSpacing: 1, marginBottom: 6 }}>
                {comment ? "🎯 AI 코멘트" : aiPending ? "AI 분석 중…" : "능력치 요약"}
              </div>
              <div style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}30`, borderRadius: 8, padding: "10px 11px", marginBottom: 10, minHeight: 66 }}>
                <div style={{ fontSize: 11.5, lineHeight: 1.65, color: comment ? "#e2e8f0" : "#64748b" }}>
                  {comment || (aiPending ? "AI가 이 선수의 특징을 분석하고 있습니다…" : localSummary)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[["킥", stats.kick], ["드리블", stats.dribble], ["슈팅", stats.shooting], ["수비", stats.defense]].map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "#64748b" }}>{k}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: gradeOf(v).color }}>{gradeOf(v).label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>📊 능력치 상세</div>
        <StatBar label="속도 / 기동력"   value={stats.speed} />
        <StatBar label="지구력 / 활동량" value={stats.stamina} />
        <StatBar label="피지컬 / 제공권" value={stats.physical} />
        <StatBar label="기술 종합"       value={stats.kick} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: 12, padding: "12px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>💪 강점</div>
          {strengths.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}><div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} /><span style={{ fontSize: 10, color: "#94a3b8" }}>{s}</span></div>)}
        </div>
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 12, padding: "12px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>🔧 보완점</div>
          {weaknesses.map((w, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}><div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} /><span style={{ fontSize: 10, color: "#94a3b8" }}>{w}</span></div>)}
        </div>
      </div>
    </div>
  );
}

// 선수단 전체 11명 상세.
// 원래는 독립 단계였는데, 11장을 다 넘겨야 다음으로 갈 수 있어 이탈 지점이었습니다.
// 전력 브리핑 안에서 필요할 때만 펼치는 상세 보기로 접어 넣었습니다.
function SquadDetailModal({ players, teamName, onClose, ai, aiPending, startIndex = 0 }) {
  const [current, setCurrent] = useState(startIndex);
  const slots = FORMATION_4231;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 210, overflowY: "auto", padding: "20px 0" }}>
    <div onClick={e => e.stopPropagation()} style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18, position: "sticky", top: 0, background: "linear-gradient(180deg,#060b14 70%,transparent)", paddingTop: 6, paddingBottom: 10, zIndex: 2 }}>
        <div>
          <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>개인 선수 분석</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f0fdf4" }}>{teamName} 선수단 리포트</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>선수를 클릭하거나 좌우 버튼으로 넘겨보세요</div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#94a3b8", fontSize: 18, cursor: "pointer", width: 36, height: 36, flexShrink: 0 }}>✕</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: current === 0 ? "rgba(255,255,255,0.02)" : "rgba(74,222,128,0.1)", color: current === 0 ? "#334155" : "#4ade80", fontSize: 20, cursor: current === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
        <div style={{ flex: 1, overflowX: "auto", display: "flex", gap: 5 }}>
          {slots.map((slot, i) => (
            <button key={slot.id} onClick={() => setCurrent(i)} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 20, border: `1px solid ${current === i ? "#4ade80" : "rgba(255,255,255,0.08)"}`, background: current === i ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.02)", color: current === i ? "#4ade80" : "#64748b", fontSize: 10, fontWeight: current === i ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>
              <span style={{ opacity: 0.7 }}>{slot.pos} </span>{players[slot.id]?.name || "?"}
            </button>
          ))}
        </div>
        <button onClick={() => setCurrent(c => Math.min(slots.length - 1, c + 1))} disabled={current === slots.length - 1} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: current === slots.length - 1 ? "rgba(255,255,255,0.02)" : "rgba(74,222,128,0.1)", color: current === slots.length - 1 ? "#334155" : "#4ade80", fontSize: 20, cursor: current === slots.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 18 }}>
        {slots.map((_, i) => <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 18 : 5, height: 5, borderRadius: 3, background: i === current ? "#4ade80" : "rgba(255,255,255,0.12)", cursor: "pointer", transition: "all 0.3s" }} />)}
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", transform: `translateX(-${current * 100}%)`, transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
          {slots.map(slot => <div key={slot.id} style={{ minWidth: "100%" }}><PlayerCard player={players[slot.id] || {}} slot={slot} ai={ai?.players?.[slot.id]} aiPending={aiPending} /></div>)}
        </div>
      </div>
      <button onClick={onClose} style={{ width: "100%", marginTop: 20, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#16a34a,#4ade80)", color: "#052e16", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>✓ 브리핑으로 돌아가기</button>
    </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 3: 팀 분석
// ═══════════════════════════════════════════════════════════════
function RadarChart({ data, accentColor = "#4ade80" }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
  const keys = Object.keys(data), values = Object.values(data), n = keys.length;
  const cx = 110, cy = 110, r = 80;
  const angle = i => Math.PI * 2 * i / n - Math.PI / 2;
  const pt = (i, pct) => ({ x: cx + r * pct * Math.cos(angle(i)), y: cy + r * pct * Math.sin(angle(i)) });
  const poly = pct => keys.map((_, i) => { const p = pt(i, pct); return `${p.x},${p.y}`; }).join(" ");
  const dataPoly = keys.map((_, i) => { const p = pt(i, animated ? values[i] / 100 : 0); return `${p.x},${p.y}`; }).join(" ");
  return (
    <svg viewBox="0 0 220 220" style={{ width: "100%", maxWidth: 220 }}>
      {[0.25, 0.5, 0.75, 1].map((p, i) => <polygon key={i} points={poly(p)} fill="none" stroke="rgba(74,222,128,0.1)" strokeWidth="0.8" />)}
      {keys.map((_, i) => { const p = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(74,222,128,0.12)" strokeWidth="0.8" />; })}
      <polygon points={dataPoly} fill={`${accentColor}20`} stroke={accentColor} strokeWidth="2" style={{ transition: "all 0.9s ease" }} />
      {keys.map((_, i) => { const p = pt(i, animated ? values[i] / 100 : 0); return <circle key={i} cx={p.x} cy={p.y} r="4" fill={accentColor} stroke="#060b14" strokeWidth="2" style={{ transition: "all 0.9s ease" }} />; })}
      {keys.map((k, i) => { const lp = pt(i, 1.28); return <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#64748b">{k}</text>; })}
      {keys.map((_, i) => { const vp = pt(i, animated ? Math.max(0.1, values[i] / 100 - 0.18) : 0); return <text key={i} x={vp.x} y={vp.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill={accentColor} style={{ transition: "all 0.9s ease" }}>{animated ? values[i] : ""}</text>; })}
    </svg>
  );
}

// 계산 결과(local) 위에 AI 문구만 덮어씁니다. 숫자(radar/fit/rating)는 건드리지 않습니다.
function mergeTeamAI(local, ai) {
  if (!local || !ai) return local;
  const withIcon = (arr, fallback) =>
    arr && arr.length
      ? arr.map((x, i) => ({ icon: fallback[i]?.icon || "✅", text: x.text, desc: x.desc }))
      : fallback;
  return {
    ...local,
    strengths: withIcon(ai.team?.strengths, local.strengths),
    weaknesses: withIcon(ai.team?.weaknesses, local.weaknesses),
    aiSummary: ai.team?.summary || null,
    recommendation: ai.recommendation || null,
    // AI 보정(fitAdjust)을 반영한 뒤 다시 정렬합니다.
    // 이 재정렬 때문에 1위 전술 = 추천 전술이 실제로 바뀔 수 있습니다. (피드백 5a)
    tactics: local.tactics
      .map((t) => {
        const m = (ai.tactics || []).find((x) => x.name === t.name);
        if (!m) return t;
        return {
          ...t,
          fit: Number.isFinite(m.fitFinal) ? m.fitFinal : t.fit,
          fitBase: Number.isFinite(m.fitBase) ? m.fitBase : t.fit,
          fitAdjust: Number.isFinite(m.fitAdjust) ? m.fitAdjust : 0,
          adjustReason: m.adjustReason || null,
          desc: m.reason || t.desc,
          pros: m.pros?.length ? m.pros : t.pros,
          cons: m.cons?.length ? m.cons : t.cons,
        };
      })
      .sort((a, b) => b.fit - a.fit),
  };
}

// 11명을 OVR 순으로 세워 에이스와 보완 대상을 뽑습니다.
function squadHighlights(players, ai) {
  const ranked = FORMATION_4231
    .filter(slot => players[slot.id]?.name)
    .map(slot => {
      const local = analyzePlayer(players[slot.id], slot.pos);
      const a = ai?.players?.[slot.id];
      return {
        id: slot.id, pos: slot.pos, name: players[slot.id].name, overall: local.overall,
        tags: (a?.strengths?.length ? a.strengths : local.strengths).slice(0, 2),
        gaps: (a?.weaknesses?.length ? a.weaknesses : local.weaknesses).slice(0, 2),
      };
    })
    .sort((a, b) => b.overall - a.overall);
  if (ranked.length < 5) return { aces: ranked, needs: [] };
  return { aces: ranked.slice(0, 3), needs: ranked.slice(-2).reverse() };
}

function TeamAnalysis({ players, teamName, onNext, onBack, ai, aiPending, aiError, onRetryAi }) {
  const [loading, setLoading] = useState(true);
  const [showSquad, setShowSquad] = useState(false);
  const analysis = mergeTeamAI(analyzeTeam(players), ai);
  const highlights = squadHighlights(players, ai);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 2000); return () => clearTimeout(t); }, []);

  if (loading || aiPending) return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes pulse2{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ fontSize: 52, animation: "spin 1.2s linear infinite", marginBottom: 28 }}>⚽</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#4ade80", marginBottom: 20, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 2 }}>팀 분석 중...</div>
      {["11명 선수 데이터 수집", "팀 강점/약점 도출", "AI가 전술을 검토하는 중"].map((t, i) => (
        <div key={i} style={{ fontSize: 13, color: "#4ade8066", marginBottom: 8, animation: `pulse2 1.5s ease ${i * 0.4}s infinite` }}>✓ {t}</div>
      ))}
    </div>
  );
  if (!analysis) return null;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>전력 브리핑</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>{teamName} 분석 리포트</div>
      </div>
      <AiFallbackNotice error={aiError} onRetry={onRetryAi} pending={aiPending} />
      <div style={{ background: "linear-gradient(135deg,rgba(22,163,74,0.12),rgba(96,165,250,0.08))", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 18, padding: "22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 60, fontWeight: 700, color: "#4ade80", lineHeight: 1 }}>{analysis.overallRating}</div>
          <div style={{ fontSize: 11, color: "#4ade8088", letterSpacing: 1, marginTop: 3 }}>팀 종합 레이팅</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4", marginBottom: 4 }}>{teamName}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>4-2-3-1 · 11명</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[["공격", analysis.stats.avgTech], ["수비", analysis.stats.avgPhysical], ["스피드", analysis.stats.avgSpeed], ["체력", analysis.stats.avgStamina]].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "5px 10px" }}>
                <div style={{ fontSize: 9, color: "#64748b" }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: v >= 75 ? "#4ade80" : v >= 60 ? "#f59e0b" : "#ef4444" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 16, padding: "18px", marginBottom: 18, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 14, alignSelf: "flex-start" }}>📡 팀 역량 레이더</div>
        <RadarChart data={analysis.radar} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f0fdf4" }}>👥 선수단 하이라이트</div>
          <div style={{ fontSize: 11, color: "#475569" }}>11명 중 눈에 띄는 선수</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginBottom: 10 }}>
          {highlights.aces.map(p => (
            <div key={p.id} onClick={() => setShowSquad(p.id)} style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: 12, padding: "11px 13px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80" }}>{p.pos}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#f0fdf4" }}>{p.name}</span>
                <span style={{ marginLeft: "auto", fontFamily: "'Rajdhani',sans-serif", fontSize: 17, fontWeight: 700, color: "#4ade80" }}>{p.overall}</span>
              </div>
              <div style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5 }}>{p.tags.join(" · ")}</div>
            </div>
          ))}
        </div>
        {highlights.needs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginBottom: 10 }}>
            {highlights.needs.map(p => (
              <div key={p.id} onClick={() => setShowSquad(p.id)} style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.16)", borderRadius: 12, padding: "11px 13px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 5 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b" }}>{p.pos}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#e2e8f0" }}>{p.name}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "'Rajdhani',sans-serif", fontSize: 17, fontWeight: 700, color: "#f59e0b" }}>{p.overall}</span>
                </div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5 }}>{p.gaps.join(" · ")}</div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setShowSquad(true)} style={{ width: "100%", padding: "11px", borderRadius: 11, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)", color: "#94a3b8", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
          👥 선수단 11명 전체 리포트 보기
        </button>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", marginBottom: 10 }}>💪 팀 강점</div>
        {analysis.strengths.map((s, i) => (
          <div key={i} style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: "#f0fdf4", marginBottom: 2 }}>{s.text}</div><div style={{ fontSize: 11, color: "#64748b" }}>{s.desc}</div></div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 10 }}>🔧 보완 필요</div>
        {analysis.weaknesses.map((w, i) => (
          <div key={i} style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{w.icon}</span>
            <div><div style={{ fontSize: 13, fontWeight: 700, color: "#f0fdf4", marginBottom: 2 }}>{w.text}</div><div style={{ fontSize: 11, color: "#64748b" }}>{w.desc}</div></div>
          </div>
        ))}
      </div>
      {showSquad && (
        <SquadDetailModal
          players={players} teamName={teamName} ai={ai} aiPending={aiPending}
          startIndex={Math.max(0, FORMATION_4231.findIndex(s => s.id === showSquad))}
          onClose={() => setShowSquad(false)}
        />
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 선수 수정</button>
        <button onClick={() => onNext(analysis)} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#16a34a,#4ade80)", color: "#052e16", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>
          🧑‍🏫 코치 선임하러 가기 →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 3.5: 코치 선임 — 같은 데이터, 두 가지 해석
//
// 이 화면의 핵심은 "코치를 고르는 것"이 아니라
// **데이터가 고른 전술과 코치가 고른 전술을 나란히 보여주는 것**입니다.
// 같은 숫자에 두 해석이 붙는 장면이 이 서비스에서 가장 강한 장면입니다.
// ═══════════════════════════════════════════════════════════════
function CoachSelect({ analysis, teamName, coach, onPickCoach, suggested, suggestWhy, onNext, onBack }) {
  const ranked = applyCoach(analysis.tactics, coach);
  const [picked, setPicked] = useState(0);
  // 코치를 바꾸면 순위가 바뀌므로 선택을 1순위로 되돌립니다
  useEffect(() => { setPicked(0); }, [coach?.id]);

  const dataTop = [...analysis.tactics].sort((a, b) => b.fit - a.fit)[0];
  const coachTop = ranked[0];
  const flipped = dataTop && coachTop && dataTop.name !== coachTop.name;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>코치 선임</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>{teamName}{josa(teamName, "을", "를")} 누구에게 맡길까요</div>
        <div style={{ fontSize: 12.5, color: "#475569", marginTop: 5, lineHeight: 1.6 }}>
          코치는 분석을 덮어쓰지 않습니다. 같은 데이터를 다르게 읽을 뿐이라,
          계산이 고른 전술과 코치가 고른 전술을 늘 나란히 보여드립니다.
        </div>
      </div>

      {suggested && (
        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.22)", borderRadius: 12, padding: "11px 13px", marginBottom: 16 }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>🤖</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, marginBottom: 3 }}>
              이 팀이라면 {suggested.icon} {suggested.name}{josa(suggested.name, "을", "를")} 추천합니다
            </div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.6 }}>{suggestWhy}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {COACHES.map(c => {
          const on = coach?.id === c.id;
          return (
            <button key={c.id} onClick={() => onPickCoach(c)} style={{ textAlign: "left", background: on ? `${c.color}16` : "rgba(255,255,255,0.03)", border: `${on ? "2px" : "1px"} solid ${on ? c.color : "rgba(255,255,255,0.07)"}`, borderRadius: 14, padding: on ? "15px" : "16px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: on ? c.color : "#f0fdf4" }}>{c.name}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{c.title}</span>
                {suggested?.id === c.id && (
                  <span style={{ fontSize: 9.5, background: "rgba(74,222,128,0.14)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 5, padding: "1px 6px", color: "#4ade80", fontWeight: 700, whiteSpace: "nowrap" }}>AI 추천</span>
                )}
                {on && <span style={{ marginLeft: "auto", fontSize: 10, background: c.color, color: "#04120a", borderRadius: 5, padding: "2px 7px", fontWeight: 700, whiteSpace: "nowrap" }}>선임</span>}
              </div>
              <div style={{ fontSize: 12.5, color: on ? "#cbd5e1" : "#94a3b8", fontWeight: 600, marginBottom: 4 }}>"{c.tagline}"</div>
              <div style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.6 }}>{c.desc}</div>
            </button>
          );
        })}
      </div>

      {coach && (
        <>
          {/* 같은 데이터, 두 해석 — 이 화면의 존재 이유 */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${flipped ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 12 }}>같은 데이터, 두 가지 해석</div>
            <div className="sq-versus" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>📊 데이터 추천</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: dataTop?.color }}>{dataTop?.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>적합도 {dataTop?.fit}</div>
              </div>
              <div className="sq-versus-mid" style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>VS</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{coach.icon} {coach.name} 추천</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: coachTop?.color }}>{coachTop?.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  적합도 {coachTop?.coachFit}
                  {coachTop?.coachBias !== 0 && (
                    <span style={{ color: coachTop.coachBias > 0 ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                      {" "}({coachTop.coachBias > 0 ? "+" : ""}{coachTop.coachBias} 성향)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: flipped ? "#fbbf24" : "#64748b", lineHeight: 1.6, marginTop: 12, paddingTop: 11, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {flipped
                ? `계산은 ${dataTop.name}${josa(dataTop.name, "을", "를")} 1순위로 놨지만, ${coach.name}${josa(coach.name, "은", "는")} ${coachTop.name}${josa(coachTop.name, "을", "를")} 고릅니다 — ${coachTop.coachWhy}`
                : coach.id === "textbook"
                  ? `정석파는 성향 보정이 없어 언제나 데이터와 같은 답을 냅니다. 다른 코치를 골라 비교해보세요.`
                  : `${coach.name}도 ${coachTop?.name}${josa(coachTop?.name, "이", "가")} 맞다고 봅니다. ${coachTop?.coachWhy || ""}`}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f0fdf4", marginBottom: 4 }}>🧠 전술 선택</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 14 }}>{coach.name}{josa(coach.name, "이", "가")} 매긴 순서입니다. 최종 결정은 감독님 몫이에요.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ranked.map((tactic, i) => (
                <div key={tactic.name} onClick={() => setPicked(i)} style={{ position: "relative", background: picked === i ? `${tactic.color}18` : "rgba(255,255,255,0.03)", border: `${picked === i ? "2px" : "1px"} solid ${picked === i ? tactic.color : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: picked === i ? "15px" : "16px", cursor: "pointer" }}>
                  {i === 0 && <div style={{ position: "absolute", top: 12, right: 12, background: `linear-gradient(135deg,${coach.color}cc,${coach.color})`, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#04120a", whiteSpace: "nowrap" }}>{coach.name} 1순위</div>}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: `${tactic.color}22`, border: `1px solid ${tactic.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{tactic.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: tactic.accent, letterSpacing: 1, marginBottom: 2 }}>{tactic.eng}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#f0fdf4", marginBottom: 3 }}>{tactic.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{tactic.desc}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        코치 적합도
                        <span style={{ fontSize: 10, color: "#475569", marginLeft: 6 }}>
                          데이터 {tactic.dataFit}
                          <span style={{ fontWeight: 700, color: tactic.coachBias > 0 ? "#4ade80" : tactic.coachBias < 0 ? "#f87171" : "#475569" }}>
                            {" "}{tactic.coachBias >= 0 ? "+" : ""}{tactic.coachBias} 성향
                          </span>
                        </span>
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: tactic.color }}>{tactic.coachFit}%</span>
                    </div>
                    <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${tactic.coachFit}%`, background: `linear-gradient(90deg,${tactic.color}88,${tactic.color})`, borderRadius: 4, transition: "width 0.5s" }} />
                    </div>
                    {tactic.coachWhy && (
                      <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "7px 9px" }}>
                        <span style={{ fontSize: 10, flexShrink: 0 }}>{coach.icon}</span>
                        <span style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.55 }}>{tactic.coachWhy}</span>
                      </div>
                    )}
                    {tactic.adjustReason && (
                      <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "7px 9px" }}>
                        <span style={{ fontSize: 10, flexShrink: 0 }}>🤖</span>
                        <span style={{ fontSize: 10.5, color: "#94a3b8", lineHeight: 1.55 }}>{tactic.adjustReason}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <div>{tactic.pros.map((p, j) => <div key={j} style={{ display: "flex", gap: 5, marginBottom: 3 }}><span style={{ color: "#4ade80", fontSize: 10 }}>+</span><span style={{ fontSize: 11, color: "#94a3b8" }}>{p}</span></div>)}</div>
                    <div>{tactic.cons.map((c, j) => <div key={j} style={{ display: "flex", gap: 5, marginBottom: 3 }}><span style={{ color: "#ef4444", fontSize: 10 }}>−</span><span style={{ fontSize: 11, color: "#94a3b8" }}>{c}</span></div>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 전력 브리핑</button>
        <button onClick={() => coach && onNext(ranked[picked], analysis)} disabled={!coach} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: coach ? "linear-gradient(135deg,#16a34a,#4ade80)" : "rgba(255,255,255,0.06)", color: coach ? "#052e16" : "#334155", fontSize: 14, cursor: coach ? "pointer" : "not-allowed", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>
          {coach ? `${ranked[picked]?.name} 전술로 →` : "코치를 먼저 선임해주세요"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 4: 전술 역할 가이드
// ═══════════════════════════════════════════════════════════════
function TacticalGuide({ players, teamName, tactic, tacticAi, tacticAiPending, tacticAiError, onRetryTacticAi, onNext, onBack }) {
  const [selectedId, setSelectedId] = useState(1);
  const tacticData = { ...TACTICAL_ROLES[tactic.name], name: tactic.name };
  const currentSlot = FORMATION_4231.find(s => s.id === selectedId);
  const currentGuide = tacticData.positions?.[currentSlot?.pos];
  // 아래 기본 가이드는 AI가 실패해도 항상 그대로 보입니다.
  // AI 지시는 그 위에 얹히는 추가 레이어일 뿐입니다. (피드백 5b)
  const aiOrder = tacticAi?.orders?.[selectedId] || null;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>전술 역할 가이드</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>{teamName} · 포지션별 임무</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <div style={{ background: `${tactic.color}18`, border: `1px solid ${tactic.color}44`, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: tactic.color }}>{tactic.icon} {tactic.name} 적용 중</div>
        </div>
      </div>
      <AiFallbackNotice error={tacticAiError} onRetry={onRetryTacticAi} pending={tacticAiPending} />
      <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${tactic.color}22`, borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: tactic.color, marginBottom: 12 }}>📋 {tactic.name} 팀 전술 요약</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {(tacticData.teamSummary || []).map((item, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: tactic.color, marginBottom: 4 }}>{item.phase}</div>
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.desc}</div>
            </div>
          ))}
        </div>
        {tacticAi?.teamNote && (
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.18)", borderRadius: 10, padding: "10px 12px" }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>🤖</span>
            <div>
              <div style={{ fontSize: 9, color: "#4ade8099", letterSpacing: 1, marginBottom: 3 }}>AI 코치 · 11명 공통 약속</div>
              <div style={{ fontSize: 11.5, color: "#cbd5e1", lineHeight: 1.6 }}>{tacticAi.teamNote}</div>
            </div>
          </div>
        )}
      </div>
      <div className="sq-guide-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.7fr", gap: 14, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, textAlign: "center" }}>4-2-3-1 · 선수 클릭</div>
          <div className="sq-pitch" style={{ position: "relative", width: "100%", paddingBottom: "140%", background: "linear-gradient(180deg,#1a4a2a,#1e5c30,#1a4a2a)", borderRadius: 12, overflow: "hidden", border: `1px solid ${tactic.color}33`, marginBottom: 10 }}>
            {[...Array(7)].map((_, i) => <div key={i} style={{ position: "absolute", top: `${i * 14.3}%`, left: 0, right: 0, height: "7%", background: i % 2 === 0 ? "rgba(0,0,0,0.08)" : "transparent" }} />)}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 140" preserveAspectRatio="none">
              <rect x="4" y="3" width="92" height="134" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
              <line x1="4" y1="70" x2="96" y2="70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <rect x="24" y="3" width="52" height="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <rect x="24" y="119" width="52" height="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            </svg>
            {FORMATION_4231.map(slot => {
              const p = players[slot.id]; const isSel = selectedId === slot.id;
              return (
                <button key={slot.id} onClick={() => setSelectedId(slot.id)} style={{ position: "absolute", left: `${slot.x}%`, top: `${slot.y}%`, transform: "translate(-50%,-50%)", width: isSel ? 48 : 36, height: isSel ? 48 : 36, borderRadius: "50%", border: isSel ? `2.5px solid ${tactic.color}` : "1.5px solid rgba(255,255,255,0.3)", background: isSel ? `${tactic.color}33` : "rgba(0,0,0,0.55)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.2s", boxShadow: isSel ? `0 0 14px ${tactic.color}55` : "none", padding: 2, zIndex: isSel ? 2 : 1 }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: isSel ? tactic.color : "rgba(255,255,255,0.5)" }}>{slot.pos}</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: isSel ? "#f0fdf4" : "rgba(255,255,255,0.6)", maxWidth: 36, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p?.name || "?"}</div>
                </button>
              );
            })}
          </div>
          <div className="sq-pitch-list" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {FORMATION_4231.map(slot => (
              <button key={slot.id} onClick={() => setSelectedId(slot.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 7, border: `1px solid ${selectedId === slot.id ? `${tactic.color}44` : "rgba(255,255,255,0.04)"}`, background: selectedId === slot.id ? `${tactic.color}10` : "transparent", cursor: "pointer" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: tactic.color, minWidth: 24 }}>{slot.pos}</span>
                <span style={{ fontSize: 10, color: selectedId === slot.id ? "#f0fdf4" : "#64748b" }}>{players[slot.id]?.name}</span>
              </button>
            ))}
          </div>
        </div>
        {currentGuide && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${currentGuide.color}33`, borderRadius: 18, padding: "18px 16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${currentGuide.color}22`, border: `1.5px solid ${currentGuide.color}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: currentGuide.color }}>{currentSlot?.pos}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f0fdf4", marginBottom: 2 }}>{players[selectedId]?.name}</div>
                <div style={{ fontSize: 11, color: currentGuide.color, fontWeight: 600 }}>{currentGuide.role}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 1, marginBottom: 9 }}>핵심 임무</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
              {currentGuide.tasks.map((task, i) => (
                <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 9px" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${currentGuide.color}22`, border: `1px solid ${currentGuide.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: currentGuide.color, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{task}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 }}>
              <div style={{ background: `${currentGuide.color}10`, border: `1px solid ${currentGuide.color}25`, borderRadius: 9, padding: "9px 10px" }}>
                <div style={{ fontSize: 9, color: currentGuide.color, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>⚡ 핵심 액션</div>
                <div style={{ fontSize: 11, color: "#f0fdf4", fontWeight: 600, lineHeight: 1.4 }}>{currentGuide.keyAction}</div>
              </div>
              <div style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 9, padding: "9px 10px" }}>
                <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>🎯 집중 포인트</div>
                <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.4 }}>{currentGuide.focus}</div>
              </div>
            </div>
            {tacticAiPending && !aiOrder && (
              <div style={{ marginBottom: 12, background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(74,222,128,0.25)", borderRadius: 10, padding: "12px 13px", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, animation: "pulse 1.4s ease infinite" }}>🤖</span>
                <span style={{ fontSize: 11, color: "#4ade8099" }}>AI가 {players[selectedId]?.name} 선수의 {tactic.name} 맞춤 지시를 쓰는 중...</span>
              </div>
            )}
            {aiOrder && (
              <div style={{ marginBottom: 12, background: "linear-gradient(135deg,rgba(74,222,128,0.09),rgba(96,165,250,0.05))", border: "1px solid rgba(74,222,128,0.28)", borderRadius: 12, padding: "13px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9 }}>
                  <span style={{ fontSize: 12 }}>🤖</span>
                  <span style={{ fontSize: 9, letterSpacing: 1, color: "#4ade80", fontWeight: 700 }}>AI 맞춤 지시 · {tactic.name}</span>
                </div>
                {aiOrder.headline && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f0fdf4", marginBottom: 9, lineHeight: 1.4 }}>"{aiOrder.headline}"</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: aiOrder.watchout ? 9 : 0 }}>
                  {(aiOrder.instructions || []).map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                      <span style={{ color: "#4ade80", fontSize: 11, flexShrink: 0, lineHeight: 1.5 }}>▸</span>
                      <span style={{ fontSize: 11.5, color: "#cbd5e1", lineHeight: 1.55 }}>{line}</span>
                    </div>
                  ))}
                </div>
                {aiOrder.watchout && (
                  <div style={{ display: "flex", gap: 7, alignItems: "flex-start", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8, padding: "8px 9px" }}>
                    <span style={{ fontSize: 11, flexShrink: 0 }}>⚠️</span>
                    <span style={{ fontSize: 11, color: "#fca5a5", lineHeight: 1.5 }}>{aiOrder.watchout}</span>
                  </div>
                )}
              </div>
            )}
            <div style={{ background: "linear-gradient(135deg,rgba(22,163,74,0.08),rgba(96,165,250,0.06))", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 9, padding: "9px 11px", display: "flex", gap: 8 }}>
              <span style={{ fontSize: 13 }}>💬</span>
              <div><div style={{ fontSize: 9, color: "#4ade8088", marginBottom: 2 }}>랩장의 한마디</div><div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{currentGuide.tip}</div></div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 팀 분석</button>
        <button onClick={onNext} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${tactic.color}cc,${tactic.color})`, color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>🗣️ 라커룸으로 →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 5: 라커룸 — 킥오프 직전 감독의 팀 토크
//
// 채팅형(실시간 질의응답)이 아니라 "연출형"입니다.
// 전술을 고를 때 이미 받아둔 대본을 한 문장씩 순서대로 띄웁니다.
// 질문 한 번에 API 한 번이면 무료 할당량(500회/일)이 금방 말라버리기 때문입니다.
// ═══════════════════════════════════════════════════════════════
const TALK_TONE = {
  "인사": { color: "#4ade80", icon: "📣" },
  "현실": { color: "#f59e0b", icon: "🪞" },
  "전술": { color: "#60a5fa", icon: "📋" },
  "지목": { color: "#a78bfa", icon: "👉" },
  "각오": { color: "#ef4444", icon: "🔥" },
};

// AI가 실패해도 라커룸이 비어 보이지 않도록 하는 기본 대본
function localTeamTalk(teamName, tactic, players) {
  const names = FORMATION_4231.map(s => players[s.id]?.name).filter(Boolean);
  const key = names[2] || names[0] || "주장";
  return [
    { tone: "인사", target: "", text: `다들 모여주세요. ${teamName || "우리 팀"}, 곧 시작합니다.` },
    { tone: "전술", target: "", text: `오늘 들고 나갈 건 ${tactic.name}입니다.` },
    { tone: "현실", target: "", text: tactic.cons?.[0] ? `${tactic.cons[0]} — 약점은 인정하고 갑니다.` : "완벽한 팀은 없습니다. 우리 것만 정확히 합니다." },
    { tone: "지목", target: key, text: `${key} 선수, 중원에서 템포 잡아주세요. 거기서 경기가 갈립니다.` },
    { tone: "각오", target: "", text: "각자 맡은 임무 하나씩만 확실히. 그거면 됩니다. 나갑시다." },
  ];
}

function LockerRoom({ teamName, tactic, players, tacticAi, tacticAiPending, tacticAiError, onRetryTacticAi, onNext, onBack }) {
  const waiting = tacticAiPending && !tacticAi;
  const lines = tacticAi?.lockerRoom?.length
    ? tacticAi.lockerRoom
    : localTeamTalk(teamName, tactic, players);
  const total = lines.length;
  const [shown, setShown] = useState(0);

  // AI 대본이 뒤늦게 도착하면 처음부터 다시 재생합니다
  useEffect(() => { setShown(0); }, [tacticAi]);

  // 한 문장씩 순차 등장
  useEffect(() => {
    if (waiting || shown >= total) return;
    const t = setTimeout(() => setShown(n => n + 1), shown === 0 ? 500 : 2100);
    return () => clearTimeout(t);
  }, [waiting, shown, total]);

  const done = !waiting && shown >= total;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>킥오프 10분 전</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>🗣️ 라커룸</div>
        <div style={{ fontSize: 12, color: "#475569", marginTop: 5 }}>
          {teamName} · <span style={{ color: tactic.color }}>{tactic.icon} {tactic.name}</span>
          {!tacticAi && !waiting && <span style={{ marginLeft: 8, color: "#475569" }}>· 기본 대본</span>}
        </div>
      </div>
      <AiFallbackNotice error={tacticAiError} onRetry={onRetryTacticAi} pending={tacticAiPending} />

      <div style={{ background: "linear-gradient(180deg,#0b1220,#070c16)", border: `1px solid ${tactic.color}33`, borderRadius: 18, padding: "20px 18px", minHeight: 330, marginBottom: 14 }}>
        {waiting ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 34, marginBottom: 14, animation: "pulse 1.4s ease infinite" }}>🤖</div>
            <div style={{ fontSize: 13, color: "#4ade8099" }}>감독이 할 말을 고르는 중...</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {lines.slice(0, shown).map((line, i) => {
              const tone = TALK_TONE[line.tone] || TALK_TONE["전술"];
              return (
                <div key={i} style={{ animation: "fadeUp 0.45s ease both", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, background: `${tone.color}1f`, border: `1px solid ${tone.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{tone.icon}</div>
                  <div style={{ flex: 1, paddingTop: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 9, letterSpacing: 1, color: tone.color, fontWeight: 700 }}>{line.tone}</span>
                      {line.target && <span style={{ fontSize: 9, color: "#475569" }}>· {line.target}</span>}
                    </div>
                    <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.7 }}>{line.text}</div>
                  </div>
                </div>
              );
            })}
            {shown < total && (
              <div style={{ display: "flex", gap: 5, paddingLeft: 38, paddingTop: 4 }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade8066", animation: `pulse 1.1s ease ${i * 0.18}s infinite` }} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {!waiting && shown < total && (
        <button onClick={() => setShown(total)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#475569", fontSize: 12, cursor: "pointer", marginBottom: 14 }}>
          건너뛰기 ({shown}/{total})
        </button>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>← 전술 가이드</button>
        <button onClick={onNext} style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: done ? "linear-gradient(135deg,#16a34a,#4ade80)" : "rgba(74,222,128,0.18)", color: done ? "#052e16" : "#4ade8099", fontSize: 14, cursor: "pointer", fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>✓ 결과 보기</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Phase 5: 결과 & 공유
// ═══════════════════════════════════════════════════════════════
// 결과 화면에서 한 번에 되돌아갈 수 있는 단계들 (상단 단계 바와 같은 key)
const RESULT_SHORTCUTS = [
  { key: "formation",       label: "선수 입력",   icon: "📝" },
  { key: "team-analysis",   label: "전력 브리핑", icon: "📊" },
  { key: "tactical-guide",  label: "전술 가이드", icon: "🧭" },
  { key: "locker-room",     label: "라커룸",      icon: "🗣️" },
];

function ResultScreen({ result, players, onBack, onSave, onGoTo, canGoTo }) {
  const [isSaved, setIsSaved] = useState(false);
  const { teamName, formation, overallRating, tactic, radar, strengths, weaknesses } = result;
  // 저장된 팀을 불러온 경우 result.players 에 이름이 들어 있습니다.
  // 현재 players state 는 비어 있으므로 저장본을 우선 사용합니다.
  const playerList = (result.players && result.players.length)
    ? result.players
    : FORMATION_4231.map(s => ({ name: players[s.id]?.name || "?", pos: s.pos }));

  // 실제 저장은 App이 합니다 — 선수 입력 원본과 AI 결과가 그쪽 state에 있기 때문입니다
  const handleSave = () => {
    if (isSaved) return;
    if (onSave(playerList)) setIsSaved(true);
  };

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 2, marginBottom: 4 }}>분석 완료</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>{teamName} 최종 리포트</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 12, color: "#475569" }}>{formation}</span>
          <span style={{ fontSize: 12, color: "#334155" }}>·</span>
          <span style={{ background: `${tactic.color}20`, border: `1px solid ${tactic.color}44`, borderRadius: 7, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: tactic.color }}>{tactic.icon} {tactic.name} 전술 적용</span>
        </div>
      </div>
      <div style={{ background: `linear-gradient(135deg,${tactic.color}18,rgba(96,165,250,0.06))`, border: `1px solid ${tactic.color}33`, borderRadius: 20, padding: "22px", marginBottom: 16, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ textAlign: "center", minWidth: 75 }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 60, fontWeight: 700, color: tactic.color, lineHeight: 1 }}>{overallRating}</div>
          <div style={{ fontSize: 10, color: `${tactic.color}88`, letterSpacing: 1, marginTop: 3 }}>팀 레이팅</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4", marginBottom: 8 }}>{teamName}</div>
          <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden", marginBottom: 5 }}>
            <div style={{ height: "100%", width: `${tactic.fit}%`, background: `linear-gradient(90deg,${tactic.color}88,${tactic.color})`, borderRadius: 4, transition: "width 1s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#475569" }}>전술 적합도</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: tactic.color }}>{tactic.fit}%</span>
          </div>
        </div>
      </div>
      <div className="sq-result-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 14, padding: "14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10, alignSelf: "flex-start" }}>📡 팀 역량</div>
          <RadarChart data={radar} accentColor={tactic.color} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 12, padding: "12px", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>💪 강점</div>
            {(strengths || []).map((s, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 12 }}>{s.icon || "⚡"}</span><span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{s.text}</span></div>)}
          </div>
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "12px", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>🔧 보완점</div>
            {(weaknesses || []).map((w, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 12 }}>{w.icon || "🔧"}</span><span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{w.text}</span></div>)}
          </div>
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>👥 선수단 ({playerList.length}명)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {playerList.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: tactic.color, minWidth: 26 }}>{p.pos}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>🔙 다시 보기</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(92px,1fr))", gap: 7 }}>
          {RESULT_SHORTCUTS.map(sc => {
            const open = canGoTo(sc.key);
            return (
              <button key={sc.key} onClick={() => onGoTo(sc.key)} disabled={!open}
                style={{ padding: "10px 6px", borderRadius: 10, border: `1px solid ${open ? "rgba(74,222,128,0.22)" : "rgba(255,255,255,0.05)"}`, background: open ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.02)", color: open ? "#4ade80" : "#334155", fontSize: 11, fontWeight: 600, cursor: open ? "pointer" : "not-allowed", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 15 }}>{sc.icon}</span>
                <span style={{ whiteSpace: "nowrap" }}>{sc.label}</span>
              </button>
            );
          })}
        </div>
        {!canGoTo("team-analysis") && (
          <div style={{ marginTop: 10, display: "flex", gap: 7, alignItems: "flex-start", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 9, padding: "9px 10px" }}>
            <span style={{ fontSize: 11, flexShrink: 0 }}>💡</span>
            <span style={{ fontSize: 10.5, color: "#fcd34d", lineHeight: 1.55 }}>
              예전 형식으로 저장된 팀이라 선수 입력값이 남아 있지 않아요. 지금 저장하는 팀부터는 모든 단계를 다시 볼 수 있습니다.
            </span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" disabled style={{ width: "100%", padding: "14px", borderRadius: 13, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#475569", fontSize: 14, fontWeight: 700, cursor: "not-allowed", fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, opacity: 0.65 }}>
          🔗 링크 공유 (준비중)
        </button>
        <button onClick={handleSave} disabled={isSaved} style={{ width: "100%", padding: "14px", borderRadius: 13, border: isSaved ? "1px solid rgba(74,222,128,0.3)" : "none", background: isSaved ? "rgba(74,222,128,0.08)" : "linear-gradient(135deg,#16a34a,#4ade80)", color: isSaved ? "#4ade80" : "#052e16", fontSize: 14, fontWeight: 700, cursor: isSaved ? "default" : "pointer", fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>
          {isSaved ? "✓ 저장됨" : "💾 이 팀 저장하기"}
        </button>
        <button onClick={onBack} style={{ padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#475569", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>{canGoTo("locker-room") ? "← 라커룸으로 돌아가기" : "← 처음으로 돌아가기"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 저장된 팀 목록 모달
// ═══════════════════════════════════════════════════════════════
function TeamListModal({ onClose, onLoad }) {
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    try { setTeams(JSON.parse(localStorage.getItem("squadlab_teams") || "[]")); } catch { setTeams([]); }
  }, []);
  const deleteTeam = (id) => {
    const updated = teams.filter(t => t.id !== id);
    localStorage.setItem("squadlab_teams", JSON.stringify(updated));
    setTeams(updated);
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 620, background: "#0d1420", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "20px 20px 0 0", padding: "24px 22px 40px", maxHeight: "75vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f0fdf4" }}>💾 저장된 팀 목록</div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>팀을 선택하면 결과를 불러와요</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#64748b", fontSize: 18, cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {teams.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
            <div style={{ fontSize: 14, color: "#475569" }}>저장된 팀이 없어요</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {teams.map(team => (
              <div key={team.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdf4" }}>{team.teamName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 11, color: "#475569" }}>{team.formation}</span>
                      <span style={{ fontSize: 11, background: `${team.tactic?.color}22`, color: team.tactic?.color, border: `1px solid ${team.tactic?.color}44`, borderRadius: 6, padding: "2px 7px" }}>{team.tactic?.icon} {team.tactic?.name}</span>
                      <span style={{ fontSize: 11, color: "#475569" }}>레이팅 {team.overallRating}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#334155" }}>{team.savedAt}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                  {(team.players || []).map((p, i) => (
                    <span key={i} style={{ fontSize: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 5, padding: "2px 7px", color: "#64748b" }}>
                      <span style={{ color: "#4ade8077" }}>{p.pos}</span> {p.name}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { onLoad(team); onClose(); }} style={{ flex: 2, padding: "8px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#16a34a,#4ade80)", color: "#052e16", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>불러오기</button>
                  <button onClick={() => deleteTeam(team.id)} style={{ flex: 1, padding: "8px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>삭제</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 상단 단계 바. key는 phase 값과 1:1로 맞춰야 합니다.
const STEPS = [
  { key: "formation",       label: "팀 구성" },
  { key: "team-analysis",   label: "전력 브리핑" },
  { key: "coach",           label: "코치 선임" },
  { key: "tactical-guide",  label: "전술 가이드" },
  { key: "locker-room",     label: "라커룸" },
  { key: "result",          label: "결과" },
];

// ═══════════════════════════════════════════════════════════════
// 메인 앱
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [phase, setPhase] = useState("landing");
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState({});
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [coach, setCoach] = useState(null);          // 선임한 코치 (Phase 3)
  const [analysis, setAnalysis] = useState(null);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [showTeamList, setShowTeamList] = useState(false);
  const [ai, setAi] = useState(null);          // 1차 AI 결과 — 팀·선수·전술 (실패하면 계속 null)
  const [aiPending, setAiPending] = useState(false);
  const [demoPicker, setDemoPicker] = useState(null);    // "jump"=결과까지 바로, "fill"=입력 화면 채우기
  const [tacticAi, setTacticAi] = useState(null);        // 2차 AI 결과 — 고른 전술의 개인 지시
  const [tacticAiPending, setTacticAiPending] = useState(false);
  // 실패를 눈에 보이게 하려면 "실패했다"는 사실을 어딘가 들고 있어야 합니다.
  // 지금까지는 console.warn만 찍고 버려서 화면이 알 방법이 없었습니다.
  const [aiError, setAiError] = useState(null);              // 1차(팀 분석) 실패
  const [tacticAiError, setTacticAiError] = useState(null);  // 2차(전술 지시·라커룸) 실패

  // 선수 입력이 끝났을 때 딱 한 번 호출합니다.
  // 실패해도 절대 화면을 막지 않습니다 — 기존 계산식 결과가 그대로 보입니다.
  const requestAI = async (playerMap, nameOverride) => {
    try {
      setAiPending(true);
      setAi(null);
      setAiError(null);
      const roster = buildRoster(playerMap);
      const team = analyzeTeam(playerMap);
      if (!roster.length || !team) return;
      // 오프라인이면 25초를 기다릴 이유가 없습니다. 바로 알려주고 끝냅니다.
      if (navigator.onLine === false) { setAiError({ code: "offline" }); return; }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: nameOverride ?? teamName,
          players: roster,
          computed: { radar: team.radar, tactics: team.tactics.map(t => ({ name: t.name, fit: t.fit })) },
        }),
      });
      const data = await res.json();
      if (data.source === "ai") setAi(data);
      else { setAiError({ code: data.code || "error", reason: data.reason }); console.warn("[AI 폴백]", data.reason); }
    } catch (e) {
      // 서버가 HTML 오류 페이지를 돌려주면 res.json()이 여기서 터집니다 (502 등)
      setAiError({ code: navigator.onLine === false ? "offline" : "error", reason: e.message });
      console.warn("[AI 폴백]", e.message);
    } finally {
      setAiPending(false);
    }
  };

  // 감독이 전술을 고른 직후 딱 한 번 더 호출합니다. (피드백 5b)
  // 1차 호출 때 한꺼번에 받지 않는 이유: 전술 3개 × 11명 = 33벌을 미리 쓰게 되는데
  // 그중 32벌은 버려집니다. 고른 뒤에 물어야 그 전술에 맞는 지시가 나옵니다.
  const requestTacticAI = async (tactic, playerMap) => {
    try {
      setTacticAiPending(true);
      setTacticAi(null);
      setTacticAiError(null);
      if (navigator.onLine === false) { setTacticAiError({ code: "offline" }); return; }
      const guide = TACTICAL_ROLES[tactic.name]?.positions || {};
      const roster = buildRoster(playerMap).map(p => ({
        ...p,
        // 화면에 이미 떠 있는 하드코딩 가이드를 같이 넘겨서 "같은 말 반복"을 막습니다
        baseRole: guide[p.pos]?.role || "",
        baseTasks: guide[p.pos]?.tasks || [],
      }));
      if (!roster.length) return;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 코치의 말투를 같이 넘깁니다. 전술 지시와 라커룸 대본이 코치마다 달라집니다.
        body: JSON.stringify({ mode: "tactic", teamName, tacticName: tactic.name, players: roster, coach: coach ? { name: coach.name, title: coach.title, tagline: coach.tagline, voice: coach.voice } : null }),
      });
      const data = await res.json();
      if (data.source === "ai") setTacticAi({ ...data, coachId: coach?.id || null });
      else { setTacticAiError({ code: data.code || "error", reason: data.reason }); console.warn("[전술 AI 폴백]", data.reason); }
    } catch (e) {
      setTacticAiError({ code: navigator.onLine === false ? "offline" : "error", reason: e.message });
      console.warn("[전술 AI 폴백]", e.message);
    } finally {
      setTacticAiPending(false);
    }
  };

  // 데모 팀 불러오기. 이전 분석 결과는 전부 버리고 새로 시작합니다.
  const loadDemoTeam = (team) => {
    const squad = buildDemoSquad(team);
    const mode = demoPicker;
    setDemoPicker(null);
    setTeamName(team.name);
    setPlayers(squad);
    setAi(null); setTacticAi(null); setAnalysis(null); setSelectedTactic(null); setResult(null);
    setAiError(null); setTacticAiError(null); setCoach(null);
    if (mode === "jump") {
      requestAI(squad, team.name);   // state 반영 전이라 팀 이름을 직접 넘깁니다
      setPhase("team-analysis");
    } else {
      setPhase("formation");
    }
    showToastMsg(`⚡ "${team.name}" 선수 11명을 채웠어요!`);
  };

  const showToastMsg = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  // ── 단계 이동 ────────────────────────────────────────────────
  // 상단 단계 바를 클릭해서 앞뒤로 오갈 수 있게 합니다.
  // 단, 그 화면을 그릴 데이터가 없으면 눌리지 않습니다 (빈 화면 방지).
  const hasPlayers = FORMATION_4231.some(s => players[s.id]?.name);
  const canGoTo = (key) => {
    switch (key) {
      case "formation":        return true;   // 이제 첫 단계라 언제든 돌아갈 수 있습니다
      case "team-analysis":    return hasPlayers;
      case "coach":            return hasPlayers;
      case "tactical-guide":
      case "locker-room":      return hasPlayers && !!selectedTactic && !!coach;
      case "result":           return !!result || (hasPlayers && !!selectedTactic && !!analysis);
      default:                 return false;
    }
  };
  const goToStep = (key) => {
    if (!canGoTo(key) || key === phase) return;
    if (key === "result" && !result) { handleResult(); return; }  // 결과가 아직 없으면 지금 만들어서 이동
    setPhase(key);
  };
  const savePlayer = (slotId, data) => setPlayers(prev => ({ ...prev, [slotId]: data }));

  const handleTacticSelected = (tactic, analysisData) => {
    setSelectedTactic(tactic);
    setAnalysis(analysisData);
    // 전술이 바뀌면 이전 결과 화면은 더 이상 맞지 않으므로 버립니다
    setResult(null);
    // 이미 같은 전술로 받아둔 지시가 있으면 다시 부르지 않습니다 (무료 할당량 절약)
    // 같은 전술이라도 코치가 바뀌었으면 말투가 달라지므로 다시 부릅니다
    if (tacticAi?.tacticName !== tactic.name || tacticAi?.coachId !== coach?.id) requestTacticAI(tactic, players);
    setPhase("tactical-guide");
  };

  const handleResult = () => {
    const playerList = FORMATION_4231.map(s => ({ name: players[s.id]?.name || "?", pos: s.pos }));
    setResult({ teamName, formation: "4-2-3-1", overallRating: analysis?.overallRating || 70, tactic: { ...selectedTactic, fit: selectedTactic?.fit || 74 }, radar: analysis?.radar || {}, strengths: analysis?.strengths || [], weaknesses: analysis?.weaknesses || [], players: playerList });
    setPhase("result");
  };

  // 저장 (ResultScreen의 버튼이 부릅니다)
  // v1은 이름·포지션만 저장해서 불러와도 이전 단계로 못 돌아갔습니다.
  // v2부터 선수 입력 원본과 AI 결과까지 담아, 불러온 뒤에도 모든 단계를 다시 볼 수 있습니다.
  // (AI를 다시 부르지 않습니다 — 저장해둔 결과를 그대로 씁니다)
  const handleSaveTeam = (playerList) => {
    try {
      const saved = JSON.parse(localStorage.getItem("squadlab_teams") || "[]");
      const team = {
        id: Date.now(),
        savedAt: new Date().toLocaleString("ko-KR"),
        ...result,
        players: playerList,
        snapshot: { version: 3, players, ai, tacticAi, tactic: selectedTactic, coach: coach?.id || null },
      };
      localStorage.setItem("squadlab_teams", JSON.stringify([team, ...saved].slice(0, 10)));
      showToastMsg("💾 팀이 저장되었어요!");
      return true;
    } catch {
      showToastMsg("저장에 실패했어요");
      return false;
    }
  };

  const handleLoadTeam = (team) => {
    const snap = team.snapshot;
    setResult(team);
    setAiError(null); setTacticAiError(null);   // 저장본은 AI를 다시 부르지 않습니다
    setCoach(snap?.coach ? coachById(snap.coach) : null);
    setTeamName(team.teamName || "");
    if (snap?.version >= 2) {
      // 저장해둔 원본을 그대로 복원 — 어느 단계로든 돌아갈 수 있습니다
      setPlayers(snap.players || {});
      setAi(snap.ai || null);
      setTacticAi(snap.tacticAi || null);
      setSelectedTactic(snap.tactic || team.tactic || null);
      const local = analyzeTeam(snap.players || {});
      setAnalysis(local ? mergeTeamAI(local, snap.ai) : null);
    } else {
      // v1 저장본: 이름·포지션밖에 없어 이전 단계를 복원할 수 없습니다
      setPlayers({});
      setAi(null);
      setTacticAi(null);
      setSelectedTactic(null);
      setAnalysis(null);
    }
    setPhase("result");
    showToastMsg(`✓ "${team.teamName}" 불러왔어요!`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060b14", fontFamily: "'Pretendard','Noto Sans KR',sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        /* 한글은 단어 중간에서 끊지 않습니다 ("스포트라이/트" 방지).
           대신 한 단어가 칸보다 길면 그때만 강제로 끊어 넘침을 막습니다. */
        body { word-break: keep-all; overflow-wrap: break-word; }
        input::placeholder { color: #334155; }
        input:focus { outline: none; border-color: #4ade80 !important; }
        button:hover { opacity: 0.88; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e3a1e; border-radius: 4px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

        /* ── 모바일 대응 ─────────────────────────────────────────────
           이 코드베이스는 스타일을 전부 인라인(style={{...}})으로 씁니다.
           인라인은 클래스보다 우선순위가 높아서, 폭을 되돌리려면 !important가 필요합니다.
           그래서 "클래스를 붙이고 여기서 덮어쓰는" 방식으로 처리했습니다. */
        @media (max-width: 640px) {
          /* 전술 가이드: 피치 | 지시카드 2열을 세로로 쌓습니다 */
          .sq-guide-grid  { grid-template-columns: 1fr !important; }
          .sq-pitch       { max-width: 300px; margin-left: auto !important; margin-right: auto !important; }
          .sq-pitch-list  { display: grid !important; grid-template-columns: 1fr 1fr; gap: 4px !important; }
          /* 결과 화면: 레이더 | 강점·보완점 2열도 같이 */
          .sq-result-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          /* 선수 입력 팝업: 여백을 줄여 본문 폭을 확보합니다 */
          .sq-popup-overlay { padding: 12px 8px !important; }
          .sq-popup         { padding: 20px 14px !important; }
          .sq-foot-grid     { grid-template-columns: 1fr !important; gap: 14px !important; }
          .sq-landing-tactic-card { padding: 14px 8px !important; }
          /* 히어로 통계 3개 — 간격 48px 고정이라 360px에서 넘쳤습니다 */
          .sq-landing-stats { gap: 20px !important; }
        }
        @media (max-width: 380px) {
          .sq-step-label { font-size: 9px !important; letter-spacing: -0.2px; }
        }
      `}</style>

      {phase !== "landing" && (
        <div style={{ background: "linear-gradient(180deg,#071a0e,#060b14)", borderBottom: "1px solid rgba(74,222,128,0.2)", padding: "14px 20px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div onClick={() => setPhase("landing")} style={{ width: 32, height: 32, background: "linear-gradient(135deg,#16a34a,#4ade80)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }}>⚽</div>
              <div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, fontWeight: 700, color: "#4ade80", letterSpacing: 2, lineHeight: 1 }}>SquadLab</div>
                <div style={{ fontSize: 10, color: "#4ade80aa", letterSpacing: 3 }}>AI TACTICAL ADVISOR</div>
              </div>
            </div>
            <button onClick={() => setShowTeamList(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, border: "1px solid rgba(74,222,128,0.25)", background: "rgba(74,222,128,0.08)", color: "#4ade80", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              💾 저장된 팀
            </button>
          </div>
          <div style={{ maxWidth: 720, margin: "8px auto 0", display: "flex", gap: 4 }}>
            {STEPS.map((step, i) => {
              const idx = STEPS.findIndex(x => x.key === phase);
              const passed = idx >= 0 && i <= idx;
              const isNow = step.key === phase;
              const open = canGoTo(step.key);          // 그릴 데이터가 있는 단계인가
              const clickable = open && !isNow;
              return (
                <button
                  key={step.key}
                  onClick={() => goToStep(step.key)}
                  disabled={!clickable}
                  title={clickable ? `${step.label} 화면으로 이동` : (isNow ? "현재 화면" : "아직 볼 수 없는 단계예요")}
                  style={{
                    flex: 1, background: "transparent", border: "none", padding: "4px 0 7px",
                    cursor: clickable ? "pointer" : "default", opacity: open || isNow ? 1 : 0.4,
                  }}
                >
                  <div style={{ height: isNow ? 4 : 3, borderRadius: 2, background: passed ? "#4ade80" : "rgba(255,255,255,0.08)", boxShadow: isNow ? "0 0 8px rgba(74,222,128,0.6)" : "none" }} />
                  <div className="sq-step-label" style={{ fontSize: 9.5, marginTop: 5, textAlign: "center", whiteSpace: "nowrap", fontWeight: isNow ? 700 : 500, color: isNow ? "#4ade80" : passed ? "#4ade80aa" : clickable ? "#64748b" : "#334155" }}>
                    {step.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {phase === "landing"         && <LandingPage onStart={() => setPhase("formation")} onDemo={() => setDemoPicker("jump")} />}
      {phase === "formation"       && <FormationScreen teamName={teamName} onTeamNameChange={setTeamName} players={players} onPlayerSave={savePlayer} onNext={() => { requestAI(players); setPhase("team-analysis"); }} onBack={() => setPhase("landing")} onDemo={() => setDemoPicker("fill")} />}
      {phase === "team-analysis"   && <TeamAnalysis players={players} teamName={teamName} ai={ai} aiPending={aiPending} aiError={aiError} onRetryAi={() => requestAI(players)} onNext={(a) => { setAnalysis(a); setPhase("coach"); }} onBack={() => setPhase("formation")} />}
      {phase === "coach"           && (() => {
        const a = analysis || mergeTeamAI(analyzeTeam(players), ai);
        if (!a) return (
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🧑‍🏫</div>
            <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 20 }}>먼저 선수 11명을 채워야 코치를 붙일 수 있어요.</div>
            <button onClick={() => setPhase("formation")} style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)", border: "none", borderRadius: 12, padding: "13px 26px", fontSize: 14, fontWeight: 700, color: "#052e16", cursor: "pointer" }}>팀 구성으로</button>
          </div>
        );
        const sug = ai?.coach?.id ? coachById(ai.coach.id) : suggestCoach(a.stats);
        const why = ai?.coach?.why || `${sug.name}는 "${sug.tagline}" 지금 팀 수치를 보면 그 방향이 가장 무리가 없습니다.`;
        return <CoachSelect analysis={a} teamName={teamName} coach={coach} onPickCoach={setCoach} suggested={sug} suggestWhy={why} onNext={handleTacticSelected} onBack={() => setPhase("team-analysis")} />;
      })()}
      {phase === "tactical-guide"  && selectedTactic && <TacticalGuide players={players} teamName={teamName} tactic={selectedTactic} tacticAi={tacticAi?.tacticName === selectedTactic.name ? tacticAi : null} tacticAiPending={tacticAiPending} tacticAiError={tacticAiError} onRetryTacticAi={() => requestTacticAI(selectedTactic, players)} onNext={() => setPhase("locker-room")} onBack={() => setPhase("coach")} />}
      {phase === "tactical-guide"  && !selectedTactic && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🧭</div>
          <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 20 }}>이 화면으로 돌아올 분석 데이터가 없어요.</div>
          <button onClick={() => setPhase("landing")} style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)", border: "none", borderRadius: 12, padding: "13px 26px", fontSize: 14, fontWeight: 700, color: "#052e16", cursor: "pointer" }}>처음으로 돌아가기</button>
        </div>
      )}
      {phase === "locker-room"     && selectedTactic && <LockerRoom players={players} teamName={teamName} tactic={selectedTactic} tacticAi={tacticAi?.tacticName === selectedTactic.name ? tacticAi : null} tacticAiPending={tacticAiPending} tacticAiError={tacticAiError} onRetryTacticAi={() => requestTacticAI(selectedTactic, players)} onNext={handleResult} onBack={() => setPhase("tactical-guide")} />}
      {phase === "locker-room"     && !selectedTactic && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🗣️</div>
          <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 20 }}>먼저 전술을 골라야 감독이 할 말이 생겨요.</div>
          <button onClick={() => setPhase("landing")} style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)", border: "none", borderRadius: 12, padding: "13px 26px", fontSize: 14, fontWeight: 700, color: "#052e16", cursor: "pointer" }}>처음으로 돌아가기</button>
        </div>
      )}
      {phase === "result"          && result && <ResultScreen result={result} players={players} onSave={handleSaveTeam} onGoTo={goToStep} canGoTo={canGoTo} onBack={() => setPhase(canGoTo("locker-room") ? "locker-room" : "landing")} />}

      {showTeamList && <TeamListModal onClose={() => setShowTeamList(false)} onLoad={handleLoadTeam} />}
      {demoPicker && <DemoPicker onPick={loadDemoTeam} onClose={() => setDemoPicker(null)} />}
      <Toast msg={toast} />
    </div>
  );
}