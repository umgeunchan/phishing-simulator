// 백엔드 시나리오 ID 매핑 (백엔드에서 지원하는 시나리오만)
export const scenarios = [
  {
    id: 1,
    backendId: "loan_scam",
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
      {
        title: "개인정보 요구",
        description: "계좌번호, 비밀번호 등 민감한 정보를 요구합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 2,
    backendId: "institution_impersonation",
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
    backendId: "delivery_notification",
    name: "택배 알림 사기",
    danger: "중간",
    dangerLevel: 2,
    description: "택배 배송 문제를 빌미로 한 사기",
    callerName: "○○택배",
    callerNumber: "1577-****",
    warningPoints: [
      {
        title: "개인정보 확인 요구",
        description: "택배사는 전화로 상세 개인정보를 요구하지 않습니다",
        severity: "medium",
      },
      {
        title: "추가 요금 요구",
        description: "배송료나 관세를 전화로 결제하라고 요구합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 4,
    backendId: "friends_impersonation",
    name: "지인 사칭",
    danger: "중간",
    dangerLevel: 2,
    description: "친구나 가족을 사칭하여 금전 요구",
    callerName: "친구",
    callerNumber: "010-****-****",
    warningPoints: [
      {
        title: "긴급 송금 요구",
        description: "급하게 돈이 필요하다며 송금을 요구합니다",
        severity: "high",
      },
      {
        title: "신원 확인 회피",
        description: "본인 확인 질문에 모호하게 답변합니다",
        severity: "medium",
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
