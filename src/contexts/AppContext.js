import { createContext, useContext, useState } from "react";
import api, { setAuthToken } from "../utils/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [securityScore, setSecurityScore] = useState(72);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [loading, setLoading] = useState(false);

  // 로그인
  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await api.login(username, password);

      if (response.success) {
        const { token } = response.data;

        // 토큰 저장
        setAuthToken(token);

        // 프로필 가져오기
        const profileResponse = await api.getProfile();
        if (profileResponse.success) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
          return { success: true };
        }

        return { success: false, error: "프로필을 가져올 수 없습니다" };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 회원가입
  const signup = async (username, password, name, age, gender) => {
    setLoading(true);
    try {
      const response = await api.signup(username, password, name, age, gender);

      if (response.success) {
        // 회원가입 성공
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setTrainingHistory([]);
    setSecurityScore(72);
  };

  const saveTrainingResult = (result) => {
    const newHistory = [result, ...trainingHistory].slice(0, 20);
    setTrainingHistory(newHistory);

    // 새로운 점수 체계 적용
    // Win (방어 성공): accuracy <= 0.2 → 100점
    // Fail (방어 실패): accuracy >= 0.7 → 0점
    // Confusion (교착): 최상위 티어 초과 또는 AI 항복 → 50점

    // 평균 점수 계산 방식으로 보안 점수 업데이트
    const totalTrainings = newHistory.length;
    const totalScore = newHistory.reduce((sum, h) => {
      if (h.outcome === "win") return sum + 100;
      if (h.outcome === "confusion") return sum + 50;
      if (h.outcome === "fail") return sum + 0;
      return sum + (h.success ? 100 : 0); // 레거시
    }, 0);

    const averageScore = totalTrainings > 0 ? Math.round(totalScore / totalTrainings) : 72;
    setSecurityScore(averageScore);
  };

  const getStats = () => {
    const totalTrainings = trainingHistory.length;
    const successCount = trainingHistory.filter((h) => h.success).length;
    const successRate =
      totalTrainings > 0
        ? Math.round((successCount / totalTrainings) * 100)
        : 0;

    return { totalTrainings, successRate };
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        trainingHistory,
        securityScore,
        currentScenario,
        loading,
        setCurrentScenario,
        login,
        signup,
        logout,
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
