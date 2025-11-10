const API_BASE_URL = "http://192.168.219.104:8080";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  console.log("✅ 토큰 설정됨:", token ? "있음" : "없음");
};

export const getAuthToken = () => {
  return authToken;
};

const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // JWT 토큰이 있으면 헤더에 추가
  if (authToken) {
    defaultHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    console.log("🔵 API 요청:", {
      url,
      method: options.method || "GET",
      hasToken: !!authToken,
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    console.log("📊 응답 상태:", response.status);

    const text = await response.text();
    console.log("📄 응답 내용:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON 파싱 에러:", e);
      throw new Error("서버 응답을 파싱할 수 없습니다");
    }

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `HTTP error! status: ${response.status}`
      );
    }

    console.log("✅ API 성공:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ API 에러:", error.message);
    return { success: false, error: error.message };
  }
};

export const api = {
  // 회원가입
  signup: (username, password) =>
    fetchAPI("/signup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  // 로그인
  login: (username, password) =>
    fetchAPI("/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  // 프로필 조회 (인증 필요)
  getProfile: () => fetchAPI("/api/profile"),
};

export default api;
