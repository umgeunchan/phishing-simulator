import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [securityScore, setSecurityScore] = useState(72);
  const [currentScenario, setCurrentScenario] = useState(null);

  // 앱 시작 시 저장된 데이터 불러오기
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const history = await AsyncStorage.getItem("trainingHistory");
      const score = await AsyncStorage.getItem("securityScore");

      if (history) setTrainingHistory(JSON.parse(history));
      if (score) setSecurityScore(parseInt(score));
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  const saveTrainingResult = async (result) => {
    try {
      const newHistory = [result, ...trainingHistory].slice(0, 20); // 최근 20개만 저장
      await AsyncStorage.setItem("trainingHistory", JSON.stringify(newHistory));
      setTrainingHistory(newHistory);

      // 점수 업데이트 로직
      const newScore = calculateNewScore(result);
      await AsyncStorage.setItem("securityScore", newScore.toString());
      setSecurityScore(newScore);
    } catch (error) {
      console.error("결과 저장 실패:", error);
    }
  };

  const calculateNewScore = (result) => {
    // 간단한 점수 계산 로직
    const scoreChange = result.success ? 5 : -3;
    const newScore = Math.max(0, Math.min(100, securityScore + scoreChange));
    return newScore;
  };

  const getStats = () => {
    const totalTrainings = trainingHistory.length;
    const successCount = trainingHistory.filter((h) => h.success).length;
    const successRate =
      totalTrainings > 0
        ? Math.round((successCount / totalTrainings) * 100)
        : 0;

    // 유형별 성공률
    const typeStats = {};
    trainingHistory.forEach((h) => {
      if (!typeStats[h.scenarioName]) {
        typeStats[h.scenarioName] = { total: 0, success: 0 };
      }
      typeStats[h.scenarioName].total++;
      if (h.success) typeStats[h.scenarioName].success++;
    });

    const typeSuccessRates = Object.keys(typeStats).map((type) => ({
      type,
      rate: Math.round((typeStats[type].success / typeStats[type].total) * 100),
    }));

    return {
      totalTrainings,
      successRate,
      typeSuccessRates,
      learnedTypes: Object.keys(typeStats).length,
    };
  };

  return (
    <AppContext.Provider
      value={{
        trainingHistory,
        securityScore,
        currentScenario,
        setCurrentScenario,
        saveTrainingResult,
        getStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
