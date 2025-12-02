// 백엔드 시나리오 ID 매핑 (백엔드에서 지원하는 시나리오만)
export const scenarios = [
  {
    id: 1,
    backendId: "loan-gov-01",
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
    backendId: "org-chain-01",
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
    backendId: "org-chain-02",
    name: "기관 사칭 2",
    danger: "높음",
    dangerLevel: 3,
    description: "공공기관을 사칭한 보이스피싱",
    callerName: "국세청",
    callerNumber: "02-****-****",
    warningPoints: [
      {
        title: "세금 환급 미끼",
        description: "세금 환급을 미끼로 개인정보를 요구합니다",
        severity: "high",
      },
      {
        title: "계좌 이체 요구",
        description: "즉시 계좌 이체를 요구하며 압박합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 4,
    backendId: "org-chain-03",
    name: "기관 사칭 3",
    danger: "높음",
    dangerLevel: 3,
    description: "검찰·경찰을 사칭한 범죄",
    callerName: "서울중앙지검",
    callerNumber: "02-****-****",
    warningPoints: [
      {
        title: "범죄 연루 협박",
        description: "범죄에 연루되었다며 협박합니다",
        severity: "high",
      },
      {
        title: "안전계좌 요구",
        description: "안전계좌로 돈을 이체하라고 요구합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 5,
    backendId: "smishing-01",
    name: "스미싱",
    danger: "높음",
    dangerLevel: 3,
    description: "문자 메시지를 통한 피싱",
    callerName: "알 수 없음",
    callerNumber: "010-****-****",
    warningPoints: [
      {
        title: "의심스러운 링크",
        description: "클릭을 유도하는 링크가 포함되어 있습니다",
        severity: "high",
      },
      {
        title: "긴급 상황 연출",
        description: "긴급한 상황을 가장하여 클릭을 유도합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 6,
    backendId: "team-bec-invoice-01",
    name: "비즈니스 이메일 사기",
    danger: "높음",
    dangerLevel: 3,
    description: "회사 임원을 사칭한 송금 요구",
    callerName: "대표이사",
    callerNumber: "02-****-****",
    warningPoints: [
      {
        title: "임원 사칭",
        description: "회사 고위직을 사칭하여 송금을 요구합니다",
        severity: "high",
      },
      {
        title: "긴급 송금 압박",
        description: "긴급하게 송금을 요구하며 검증을 회피합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 7,
    backendId: "team-crypto-pump-01",
    name: "가상화폐 투자 사기",
    danger: "중간",
    dangerLevel: 2,
    description: "가상화폐 투자를 미끼로 한 사기",
    callerName: "투자 전문가",
    callerNumber: "02-****-****",
    warningPoints: [
      {
        title: "고수익 보장",
        description: "확실한 고수익을 보장한다며 투자를 유도합니다",
        severity: "high",
      },
      {
        title: "조급함 유발",
        description: "기회가 곧 사라진다며 빠른 결정을 압박합니다",
        severity: "medium",
      },
    ],
  },
  {
    id: 8,
    backendId: "team-edu-foreign-01",
    name: "유학 사기",
    danger: "중간",
    dangerLevel: 2,
    description: "해외 유학을 미끼로 한 사기",
    callerName: "유학원",
    callerNumber: "02-****-****",
    warningPoints: [
      {
        title: "과도한 선납 요구",
        description: "계약 전 과도한 금액을 선납하라고 요구합니다",
        severity: "high",
      },
      {
        title: "검증 불가능한 정보",
        description: "제공하는 정보를 검증할 수 없습니다",
        severity: "medium",
      },
    ],
  },
  {
    id: 9,
    backendId: "team-family-emergency-01",
    name: "가족 긴급 사기",
    danger: "높음",
    dangerLevel: 3,
    description: "가족의 긴급 상황을 가장한 사기",
    callerName: "자녀",
    callerNumber: "010-****-****",
    warningPoints: [
      {
        title: "가족 사칭",
        description: "자녀나 가족을 사칭하여 긴급 상황을 연출합니다",
        severity: "high",
      },
      {
        title: "즉각 송금 요구",
        description: "확인할 시간 없이 즉시 송금을 요구합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 10,
    backendId: "team-impersonation-01",
    name: "지인 사칭",
    danger: "중간",
    dangerLevel: 2,
    description: "친구나 지인을 사칭하여 금전 요구",
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
  {
    id: 11,
    backendId: "team-market-escrow-01",
    name: "중고거래 사기",
    danger: "중간",
    dangerLevel: 2,
    description: "중고거래 플랫폼을 이용한 사기",
    callerName: "판매자",
    callerNumber: "010-****-****",
    warningPoints: [
      {
        title: "안전거래 회피",
        description: "플랫폼의 안전거래 기능 사용을 회피합니다",
        severity: "high",
      },
      {
        title: "선입금 요구",
        description: "물건 확인 전 선입금을 요구합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 12,
    backendId: "team-refund-01",
    name: "환불 사기",
    danger: "중간",
    dangerLevel: 2,
    description: "환불을 미끼로 한 개인정보 탈취",
    callerName: "고객센터",
    callerNumber: "1588-****",
    warningPoints: [
      {
        title: "계좌정보 요구",
        description: "환불을 위해 계좌정보를 요구합니다",
        severity: "high",
      },
      {
        title: "앱 설치 유도",
        description: "의심스러운 앱 설치를 유도합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 13,
    backendId: "team-spoof-sim-01",
    name: "SIM 스와핑",
    danger: "높음",
    dangerLevel: 3,
    description: "유심 복제를 통한 본인인증 우회",
    callerName: "통신사",
    callerNumber: "114",
    warningPoints: [
      {
        title: "유심 교체 요구",
        description: "불필요한 유심 교체를 권유합니다",
        severity: "high",
      },
      {
        title: "인증번호 요구",
        description: "문자로 받은 인증번호를 알려달라고 합니다",
        severity: "high",
      },
    ],
  },
  {
    id: 14,
    backendId: "team-taxi-bill-01",
    name: "택시비 사기",
    danger: "낮음",
    dangerLevel: 1,
    description: "택시비 미납을 빌미로 한 사기",
    callerName: "택시 기사",
    callerNumber: "010-****-****",
    warningPoints: [
      {
        title: "신분 확인 불가",
        description: "택시 기사 신분을 확인할 수 없습니다",
        severity: "medium",
      },
      {
        title: "개인정보 요구",
        description: "불필요한 개인정보를 요구합니다",
        severity: "medium",
      },
    ],
  },
  {
    id: 15,
    backendId: "team-tech-01",
    name: "기술지원 사기",
    danger: "중간",
    dangerLevel: 2,
    description: "컴퓨터 기술지원을 가장한 사기",
    callerName: "Microsoft",
    callerNumber: "02-****-****",
    warningPoints: [
      {
        title: "원격제어 요구",
        description: "컴퓨터 원격제어 프로그램 설치를 요구합니다",
        severity: "high",
      },
      {
        title: "유료 서비스 판매",
        description: "불필요한 유료 서비스를 강매합니다",
        severity: "medium",
      },
    ],
  },
  {
    id: 16,
    backendId: "team-telecom-arrears-01",
    name: "통신요금 사기",
    danger: "중간",
    dangerLevel: 2,
    description: "통신요금 미납을 빌미로 한 사기",
    callerName: "통신사",
    callerNumber: "1588-****",
    warningPoints: [
      {
        title: "회선 정지 협박",
        description: "즉시 납부하지 않으면 회선을 정지한다고 협박합니다",
        severity: "medium",
      },
      {
        title: "계좌이체 유도",
        description: "정상적이지 않은 방법으로 납부를 유도합니다",
        severity: "high",
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
