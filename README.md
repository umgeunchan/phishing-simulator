# 피싱 시뮬레이터 (Phishing Simulator)

보이스피싱 예방을 위한 모바일 시뮬레이션 앱

## 📱 주요 기능

- 다양한 보이스피싱 시나리오 체험
- 실시간 통화 시뮬레이션
- 문자 메시지 시뮬레이션
- 학습 기록 및 통계
- 보안 점수 관리

## 🛠️ 기술 스택

- **Frontend**: React Native (Expo)
- **Navigation**: React Navigation
- **Icons**: Expo Vector Icons
- **State Management**: React Context API
- **Storage**: AsyncStorage

## 📂 프로젝트 구조

```
phishing-simulator/
├── src/
│   ├── components/      # 재사용 가능한 컴포넌트
│   ├── contexts/        # Context API (상태 관리)
│   ├── navigation/      # 네비게이션 설정
│   ├── screens/         # 화면 컴포넌트
│   ├── styles/          # 공통 스타일
│   └── utils/           # 유틸리티 함수 및 데이터
├── assets/              # 이미지, 폰트 등
├── App.js               # 앱 진입점
└── package.json
```

## 🚀 시작하기

### 설치

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/phishing-simulator.git
cd phishing-simulator

# 의존성 설치
npm install
```

### 실행

```bash
# 개발 서버 시작
npm start

# 또는
npx expo start
```

Expo Go 앱으로 QR 코드를 스캔하여 실행하세요.

## 👥 팀원

- Frontend: [박근찬]
- Backend: [김한결]
- LLM: [이준희, 노다영]
