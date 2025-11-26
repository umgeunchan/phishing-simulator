import { getAuthToken } from "./api";

const WS_BASE_URL = "ws://34.22.110.190:8080";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
    this.isConnected = false;
  }

  // WebSocket 연결
  connect(scenario, mode = "text") {
    return new Promise((resolve, reject) => {
      try {
        const token = getAuthToken();
        if (!token) {
          reject(new Error("토큰이 없습니다. 먼저 로그인하세요."));
          return;
        }

        const url = `${WS_BASE_URL}/ws/simulation?token=${token}&scenario=${scenario}&mode=${mode}`;

        console.log("🔌 WebSocket 연결 시도:", url);

        // 기존 연결이 있으면 정리
        if (this.ws) {
          this.ws.onclose = null;
          this.ws.onerror = null;
          this.ws.onmessage = null;
          this.ws.close();
          this.ws = null;
        }

        this.ws = new WebSocket(url);

        let hasReceivedMessage = false;

        this.ws.onopen = () => {
          console.log("✅ WebSocket 연결됨");
          this.isConnected = true;

          // 백엔드가 초기 메시지를 보낼 때까지 잠깐 대기
          // LLM 초기화에 시간이 걸릴 수 있으므로 충분한 시간 대기
          setTimeout(() => {
            if (!hasReceivedMessage) {
              console.log("⚠️ 초기 메시지 수신 대기 중...");
            }
            resolve();
          }, 500);
        };

        this.ws.onmessage = (event) => {
          hasReceivedMessage = true;
          console.log("📨 WebSocket 메시지 수신:", event.data);

          // 백엔드가 단순 텍스트를 보내므로 텍스트로 처리
          this.messageHandlers.forEach((handler) =>
            handler({ text: event.data })
          );
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket 에러:", error);
          if (!this.isConnected) {
            reject(error);
          }
        };

        this.ws.onclose = (event) => {
          console.log("🔌 WebSocket 연결 종료:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          this.isConnected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // 메시지 전송
  send(message) {
    if (!this.ws) {
      console.error("❌ WebSocket 인스턴스가 없음");
      return false;
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket이 열려있지 않음");
      return false;
    }

    try {
      // 백엔드가 단순 텍스트를 기대하므로 문자열 그대로 전송
      const data =
        typeof message === "string" ? message : JSON.stringify(message);
      this.ws.send(data);
      console.log("📤 WebSocket 메시지 전송:", data);
      return true;
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
      return false;
    }
  }

  // 메시지 핸들러 등록
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  // 메시지 핸들러 제거
  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
  }

  // 연결 종료
  disconnect() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close(1000, "사용자 종료");
      this.ws = null;
      this.isConnected = false;
    }
    this.messageHandlers = [];
  }
}

export default new WebSocketService();
