// 백엔드 시나리오 ID 매핑
export const scenarios = [
  {
    id: 1,
    backendId: "loan_scam", // 백엔드 API에서 사용하는 시나리오 ID
    name: "대출 사기",
    danger: "높음",
    dangerLevel: 3,
    description: "저금리 대출을 미끼로 한 사기",
    callerName: "○○금융",
    callerNumber: "1588-****",
    warningPoints: [
      {
        title: "선입금 요구",
        description: "대출 전 선입금이나 수수료를 요구하는 것은 사기입니다",
        severity: "high",
      },
    ],
  },
  {
    id: 2,
    backendId: "government_impersonation",
    name: "기관 사칭",
    danger: "높음",
    dangerLevel: 3,
    description: "경찰, 검찰, 금융감독원 등을 사칭",
    callerName: "금융감독원",
    callerNumber: "02-1234-5678",
    warningPoints: [
      {
        title: "주민등록번호 요구",
        description: "금융기관은 전화로 주민등록번호를 요구하지 않습니다",
        severity: "high",
      },
      {
        title: "긴급 상황 연출",
        description: "시급하게 처리해야 한다며 압박했습니다",
        severity: "medium",
      },
    ],
  },
  {
    id: 3,
    backendId: "delivery_scam",
    name: "택배 사칭",
    danger: "중간",
    dangerLevel: 2,
    description: "택배 문제를 빌미로 한 사기",
    callerName: "○○택배",
    callerNumber: "1577-****",
    warningPoints: [
      {
        title: "링크 클릭 유도",
        description: "의심스러운 링크는 클릭하지 마세요",
        severity: "medium",
      },
    ],
  },
  {
    id: 4,
    backendId: "family_impersonation",
    name: "지인 사칭",
    danger: "중간",
    dangerLevel: 2,
    description: "가족, 친구를 사칭한 금전 요구",
    callerName: "지인",
    callerNumber: "010-****-****",
    warningPoints: [
      {
        title: "금전 요구",
        description: "지인이라도 직접 통화로 확인하세요",
        severity: "medium",
      },
    ],
  },
  {
    id: 5,
    backendId: "messenger_phishing",
    name: "메신저 피싱",
    danger: "낮음",
    dangerLevel: 1,
    description: "메신저로 링크를 전송하는 사기",
    callerName: "지인",
    callerNumber: "010-****-****",
    warningPoints: [
      {
        title: "의심스러운 링크",
        description: "출처가 불분명한 링크는 클릭하지 마세요",
        severity: "low",
      },
    ],
  },
];

export const getScenarioById = (id) => {
  return scenarios.find((s) => s.id === id);
};

export const getDangerColor = (dangerLevel) => {
  if (dangerLevel >= 3) return { bg: "#7f1d1d", text: "#fecaca" }; // red
  if (dangerLevel >= 2) return { bg: "#713f12", text: "#fcd34d" }; // yellow
  return { bg: "#1e3a8a", text: "#93c5fd" }; // blue
};
