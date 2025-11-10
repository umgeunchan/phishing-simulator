import { getAuthToken } from "./api";

const WS_BASE_URL = "ws://192.168.219.104:8080";

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

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket 연결됨");
          this.isConnected = true;
          resolve();
        };

        this.ws.onmessage = (event) => {
          console.log("📨 WebSocket 메시지 수신:", event.data);

          try {
            const message = JSON.parse(event.data);
            this.messageHandlers.forEach((handler) => handler(message));
          } catch (error) {
            console.error("메시지 파싱 에러:", error);
            // 텍스트 메시지일 수도 있음
            this.messageHandlers.forEach((handler) =>
              handler({ text: event.data })
            );
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket 에러:", error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log("🔌 WebSocket 연결 종료");
          this.isConnected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // 메시지 전송
  send(message) {
    if (this.ws && this.isConnected) {
      const data =
        typeof message === "string" ? message : JSON.stringify(message);
      this.ws.send(data);
      console.log("📤 WebSocket 메시지 전송:", data);
    } else {
      console.error("WebSocket이 연결되지 않음");
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
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.messageHandlers = [];
    }
  }
}

export default new WebSocketService();
