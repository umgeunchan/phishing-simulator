import { getAuthToken } from "./api";

const WS_BASE_URL = "ws://34.22.110.190:8080";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectDelay = 2000; // 2초
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

        const url = `${WS_BASE_URL}/ws/simulation`;

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

        // 연결 타임아웃 설정 (10초)
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.ws.close();
            reject(new Error("WebSocket 연결 시간 초과. 서버가 응답하지 않습니다."));
          }
        }, 10000);

        this.ws.onopen = () => {
          console.log("✅ WebSocket 연결됨");
          clearTimeout(connectionTimeout); // 타임아웃 해제
          this.isConnected = true;
          this.reconnectAttempts = 0; // 연결 성공 시 재시도 카운터 리셋

          // InitMessage 전송 (백엔드 요구사항)
          const initData = {
            type: "init",
            token: token,
            scenario: scenario,
            mode: mode
          };

          // 백엔드가 초기 메시지를 보낼 때까지 잠깐 대기
          // LLM 초기화에 시간이 걸릴 수 있으므로 충분한 시간 대기
          setTimeout(() => {
            try {
              this.send(initData);
              console.log("📤 초기화 메시지 전송:", initData);
            } catch (e) {
              console.error("❌ 초기화 메시지 전송 실패:", e);
            }

            if (!hasReceivedMessage) {
              console.log("⚠️ 초기 메시지 수신 대기 중...");
            }
            resolve();
          }, 500);
        };

        this.ws.onmessage = (event) => {
          hasReceivedMessage = true;

          // 바이너리 데이터인 경우 (음성 모드)
          if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
            console.log("📨 WebSocket 바이너리 수신:", event.data.byteLength || event.data.size, "bytes");

            // Blob인 경우 ArrayBuffer로 변환
            if (event.data instanceof Blob) {
              const reader = new FileReader();
              reader.onload = () => {
                this.messageHandlers.forEach((handler) =>
                  handler({ type: "audio_response", audio: reader.result })
                );
              };
              reader.readAsArrayBuffer(event.data);
            } else {
              this.messageHandlers.forEach((handler) =>
                handler({ type: "audio_response", audio: event.data })
              );
            }
          } else {
            // 텍스트 메시지 (초기 메시지 또는 텍스트 모드)
            console.log("📨 WebSocket 메시지 수신:", event.data);
            this.messageHandlers.forEach((handler) =>
              handler({ text: event.data })
            );
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket 에러:", error);
          const errorMessage = new Error(
            "WebSocket 연결 중 오류가 발생했습니다. 서버 상태를 확인해주세요."
          );
          if (!this.isConnected) {
            reject(errorMessage);
          }
        };

        this.ws.onclose = (event) => {
          console.log("🔌 WebSocket 연결 종료:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });
          this.isConnected = false;

          // 비정상 종료이고 재연결 시도 가능한 경우
          if (event.code !== 1000 && !event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
            setTimeout(() => {
              if (!this.isConnected) {
                this.connect(scenario, mode).catch((err) => {
                  console.error("재연결 실패:", err);
                });
              }
            }, this.reconnectDelay);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // 메시지 전송 (텍스트)
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

  // 바이너리 데이터 전송 (음성 모드)
  sendBinary(arrayBuffer) {
    if (!this.ws) {
      console.error("❌ WebSocket 인스턴스가 없음");
      return false;
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket이 열려있지 않음");
      return false;
    }

    try {
      this.ws.send(arrayBuffer);
      console.log("📤 WebSocket 바이너리 전송:", arrayBuffer.byteLength, "bytes");
      return true;
    } catch (error) {
      console.error("❌ 바이너리 전송 실패:", error);
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
    this.reconnectAttempts = 0; // 재연결 카운터 리셋
  }
}

export default new WebSocketService();
