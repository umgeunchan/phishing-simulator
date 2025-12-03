import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../contexts/AppContext";
import { colors } from "../styles/colors";
import websocket from "../utils/websocket";

export default function CallScreen({ navigation, route }) {
  const { currentScenario, saveTrainingResult } = useApp();
  const { callType } = route.params || { callType: "voice" };

  const [callTime, setCallTime] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [simulationResult, setSimulationResult] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [waitingForInitialMessage, setWaitingForInitialMessage] =
    useState(true);
  const scrollViewRef = useRef(null);

  // 음성 통화 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const recordingRef = useRef(null);
  const soundRef = useRef(null);

  // 오디오 권한 요청 및 설정
  useEffect(() => {
    const setupAudio = async () => {
      if (callType === "voice") {
        try {
          const { status } = await Audio.requestPermissionsAsync();
          if (status !== "granted") {
            console.error("마이크 권한이 필요합니다");
            return;
          }

          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
          });

          console.log("✅ 오디오 설정 완료");
        } catch (error) {
          console.error("오디오 설정 실패:", error);
        }
      }
    };

    setupAudio();

    // 컴포넌트 언마운트 시 정리
    return () => {
      stopRecording();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [callType]);

  // 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 녹음 시작
  const startRecording = async () => {
    if (isMuted) return;

    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: "audio/webm;codecs=opus",
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      console.log("🎙️ 녹음 시작");
    } catch (error) {
      console.error("녹음 시작 실패:", error);
    }
  };

  // 녹음 중지 및 전송
  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      console.log("🎙️ 녹음 완료:", uri);

      if (uri) {
        if (Platform.OS === "web") {
          // 웹에서는 fetch로 Blob 가져오기
          const response = await fetch(uri);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();

          websocket.sendBinary(arrayBuffer);
          console.log(
            "📤 오디오 전송 완료 (Web):",
            arrayBuffer.byteLength,
            "bytes"
          );
        } else {
          // 모바일에서는 FileSystem 사용
          const audioData = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Base64를 ArrayBuffer로 변환
          const binaryString = atob(audioData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          websocket.sendBinary(bytes.buffer);
          console.log("📤 오디오 전송 완료 (Mobile):", bytes.length, "bytes");
        }
      }

      recordingRef.current = null;
    } catch (error) {
      console.error("녹음 중지 실패:", error);
    }
  };

  // LINEAR16 PCM을 WAV 파일로 변환하는 헬퍼 함수
  const createWavBlob = (pcmData, sampleRate = 16000) => {
    const numChannels = 1; // 모노
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmData.byteLength;

    // WAV 헤더 생성
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, "WAVE");

    // fmt sub-chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // PCM 데이터 복사
    const pcmView = new Uint8Array(pcmData);
    const wavView = new Uint8Array(buffer);
    wavView.set(pcmView, 44);

    return new Blob([buffer], { type: "audio/wav" });
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // AI 오디오 응답 재생
  const playAudioResponse = async (audioData) => {
    try {
      console.log(
        "🔊 오디오 재생 시작, 데이터 타입:",
        typeof audioData,
        "길이:",
        audioData?.byteLength || audioData?.length
      );

      // 빈 데이터 체크
      if (
        !audioData ||
        (audioData.byteLength === 0 && audioData.length === 0)
      ) {
        console.warn("⚠️ 빈 오디오 데이터 수신");
        return;
      }

      setIsPlaying(true);

      if (Platform.OS === "web") {
        // 웹에서는 LINEAR16 PCM을 WAV로 변환 후 재생
        const wavBlob = createWavBlob(audioData, 16000);
        const blobUrl = URL.createObjectURL(wavBlob);

        const audio = new Audio(blobUrl);
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(blobUrl);
        };
        audio.onerror = (e) => {
          console.error("웹 오디오 재생 에러:", e);
          setIsPlaying(false);
          URL.revokeObjectURL(blobUrl);
        };

        await audio.play();
        console.log("🔊 AI 응답 재생 중 (Web)");
      } else {
        // 모바일에서는 Expo Audio 사용
        const bytes = new Uint8Array(audioData);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);

        const fileUri = FileSystem.cacheDirectory + "ai_response.mp3";
        await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });

        await sound.playAsync();
        console.log("🔊 AI 응답 재생 중 (Mobile)");
      }
    } catch (error) {
      console.error("오디오 재생 실패:", error);
      setIsPlaying(false);
    }
  };

  // 마이크 토글
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && isRecording) {
      stopRecording();
    }
  };

  // WebSocket 메시지 핸들러 (useCallback으로 안정적인 참조 유지)
  const handleMessage = useCallback((message) => {
    console.log("📩 수신된 메시지:", message);

    // 백엔드는 단순 텍스트 문자열을 보냄
    // websocket.js에서 { text: event.data } 형식으로 래핑함
    const textContent = message.text || message;

    if (typeof textContent === "string") {
      // 백엔드 초기 연결 메시지 필터링 (예: "Start Scenario...")
      if (
        textContent.startsWith("Start Secnario") ||
        textContent.startsWith("Start Scenario")
      ) {
        console.log("📌 백엔드 초기 연결 메시지 수신:", textContent);
        // 첫 메시지를 받으면 로딩 상태 해제
        setWaitingForInitialMessage(false);
        return; // UI에 표시하지 않음
      }
    }

    // 실제 메시지를 받으면 로딩 상태 해제
    setWaitingForInitialMessage(false);

    if (typeof textContent === "string") {
      // 에러 메시지 확인 (JSON 형식일 수 있음)
      try {
        const parsed = JSON.parse(textContent);
        if (parsed.error) {
          // 서버 에러를 시스템 메시지로 표시
          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              text: `⚠️ 서버 오류: ${parsed.error}\n잠시 후 다시 시도해주세요.`,
              timestamp: new Date(),
            },
          ]);
          return;
        }
      } catch (e) {
        // JSON 파싱 실패 = 일반 텍스트
      }

      // 텍스트 메시지를 AI 메시지로 표시
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: textContent,
          timestamp: new Date(),
        },
      ]);
    } else if (message.type === "audio_response" && message.audio) {
      // AI 음성 응답 (음성 모드)
      playAudioResponse(message.audio);
    } else if (message.type === "simulation_end" || message.result) {
      // 시뮬레이션 종료
      setSimulationResult(message.result || message);
    }
  }, []); // 빈 의존성 배열: setMessages는 함수형 업데이트를 사용하므로 의존성 불필요

  // WebSocket 연결 및 메시지 수신
  useEffect(() => {
    // 핸들러를 먼저 등록
    websocket.onMessage(handleMessage);

    // 새로운 시나리오로 연결 (기존 연결이 있으면 먼저 종료)
    const connectWebSocket = async () => {
      if (!currentScenario) {
        setIsConnecting(false);
        return;
      }

      try {
        // 기존 연결이 있으면 먼저 종료
        if (websocket.isConnected) {
          console.log("🔄 기존 WebSocket 연결 종료 후 재연결");
          websocket.disconnect();
        }

        const scenarioId = currentScenario.backendId || "loan_scam";
        const mode = callType === "voice" ? "voice" : "text";
        console.log("🔌 CallScreen에서 WebSocket 연결 시작:", scenarioId, mode);
        await websocket.connect(scenarioId, mode);
        setIsConnecting(false);
      } catch (error) {
        console.error("WebSocket 연결 실패:", error);
        setConnectionError(
          error.message ||
            "서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요."
        );
        setIsConnecting(false);
      }
    };

    connectWebSocket();

    return () => {
      // 컴포넌트 언마운트 시 WebSocket 연결 정리
      websocket.removeMessageHandler(handleMessage);
      websocket.disconnect(true); // 핸들러 배열도 초기화
      console.log("🧹 CallScreen 언마운트: WebSocket 연결 정리 완료");
    };
  }, [currentScenario, callType, handleMessage]);

  // 시간 포맷팅 (00:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 메시지 전송
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();

    // 내 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: messageText,
        timestamp: new Date(),
      },
    ]);

    // WebSocket으로 전송 (백엔드는 단순 텍스트를 기대함)
    websocket.send(messageText);
    setInputText("");
  };

  // 통화 종료
  const handleEndCall = () => {
    // WebSocket 연결 종료
    websocket.disconnect();

    // 결과 저장 - timestamp를 문자열로 변환
    const serializedMessages = messages.map((msg) => ({
      ...msg,
      timestamp: msg.timestamp?.toISOString() || new Date().toISOString(),
    }));

    // 시뮬레이션 결과 판정
    // Win (방어 성공): 사용자가 조기 종료하거나 단시간에 종료
    // Fail (방어 실패): 장시간 대화가 이어짐
    // Confusion (교착): 중간 정도의 대화

    let outcome = "confusion"; // 기본값
    let success = false;

    // 시뮬레이션 결과가 백엔드에서 제공된 경우
    if (simulationResult) {
      outcome = simulationResult.outcome || "confusion";
      success = simulationResult.success || false;
    } else {
      // 대화 분석 기반 판정
      const userMessages = serializedMessages.filter(
        (msg) => msg.type === "user"
      ).length;

      // 사용자가 짧게 끊은 경우 (방어 성공)
      if (callTime < 30 || userMessages < 3) {
        outcome = "win";
        success = true;
      }
      // 긴 대화가 이어진 경우 (방어 실패 - 피싱에 속고 있음)
      else if (callTime > 100 || userMessages > 6) {
        outcome = "fail";
        success = false;
      }
      // 중간 정도 대화 (교착)
      else {
        outcome = "confusion";
        success = false;
      }
    }

    const result = {
      scenarioName: currentScenario.name,
      success: success,
      outcome: outcome,
      date: new Date().toLocaleString("ko-KR"),
      duration: callTime,
      callType: callType,
      messages: serializedMessages,
    };

    saveTrainingResult(result);

    // 결과 화면으로 이동
    navigation.navigate("Result", { result });
  };

  if (!currentScenario) {
    return null;
  }

  // 연결 중 화면
  if (isConnecting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.connectingContainer}>
          <Text style={styles.connectingText}>서버에 연결 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 연결 에러 화면
  if (connectionError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.connectingContainer}>
          <Text style={styles.errorText}>연결 실패</Text>
          <Text style={styles.errorSubText}>{connectionError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 프로필 영역 - 문자 시뮬레이션일 때는 작게 표시 */}
        <View
          style={[
            styles.profileSection,
            callType === "message" && styles.profileSectionCompact,
          ]}
        >
          {callType === "voice" && (
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={48} color={colors.slate400} />
            </View>
          )}

          <View style={callType === "message" ? styles.profileRow : null}>
            {callType === "message" && (
              <View style={styles.avatarCircleSmall}>
                <Ionicons name="person" size={24} color={colors.slate400} />
              </View>
            )}
            <View style={callType === "message" ? styles.profileInfo : null}>
              <Text
                style={[
                  styles.callerName,
                  callType === "message" && styles.callerNameSmall,
                ]}
              >
                {currentScenario.callerName}
              </Text>
              <Text style={styles.callerNumber}>
                {currentScenario.callerNumber}
              </Text>
            </View>
            {/* 타이머 */}
            <View style={styles.timerContainer}>
              <Text
                style={[
                  styles.timer,
                  callType === "message" && styles.timerSmall,
                ]}
              >
                {formatTime(callTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* 채팅 영역 (문자 시뮬레이션) */}
        {callType === "message" && (
          <KeyboardAvoidingView
            style={styles.chatContainerFull}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContent}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
              keyboardShouldPersistTaps="handled"
            >
              {waitingForInitialMessage && messages.length === 0 && (
                <View style={styles.waitingContainer}>
                  <Text style={styles.waitingText}>
                    상대방이 입력 중입니다...
                  </Text>
                </View>
              )}
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.type === "user"
                      ? styles.userMessage
                      : msg.type === "system"
                      ? styles.systemMessage
                      : styles.aiMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.type === "user"
                        ? styles.userMessageText
                        : msg.type === "system"
                        ? styles.systemMessageText
                        : styles.aiMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* 입력 영역 */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="메시지를 입력하세요..."
                placeholderTextColor={colors.slate400}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* 경고 메시지 - 음성 모드에서만 표시 */}
        {callType === "voice" && (
          <View style={styles.warningBox}>
            <Ionicons name="alert-circle" size={16} color={colors.yellow500} />
            <Text style={styles.warningText}>
              의심스러운 요청에는 응답하지 마세요. 개인정보나 계좌번호를 절대
              알려주지 마세요.
            </Text>
          </View>
        )}

        {/* 음성 통화 컨트롤 */}
        {callType === "voice" && (
          <View style={styles.voiceControls}>
            {/* 녹음 상태 표시 */}
            <View style={styles.recordingStatus}>
              {isRecording && (
                <>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>녹음 중...</Text>
                </>
              )}
              {isPlaying && (
                <>
                  <Ionicons
                    name="volume-high"
                    size={16}
                    color={colors.green500}
                  />
                  <Text style={styles.playingText}>AI 응답 재생 중...</Text>
                </>
              )}
            </View>

            {/* 음성 컨트롤 버튼 */}
            <View style={styles.voiceButtonGroup}>
              {/* 음소거 버튼 */}
              <TouchableOpacity
                style={[styles.voiceButton, isMuted && styles.voiceButtonMuted]}
                onPress={toggleMute}
              >
                <Ionicons
                  name={isMuted ? "mic-off" : "mic"}
                  size={28}
                  color={colors.white}
                />
                <Text style={styles.voiceButtonText}>
                  {isMuted ? "음소거 해제" : "음소거"}
                </Text>
              </TouchableOpacity>

              {/* 말하기 버튼 (길게 누르기) */}
              <TouchableOpacity
                style={[
                  styles.talkButton,
                  isRecording && styles.talkButtonActive,
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
                disabled={isMuted || isPlaying}
              >
                <Ionicons
                  name={isRecording ? "radio-button-on" : "mic-circle"}
                  size={48}
                  color={colors.white}
                />
                <Text style={styles.talkButtonText}>
                  {isRecording ? "말하는 중..." : "길게 눌러 말하기"}
                </Text>
              </TouchableOpacity>

              {/* 힌트 버튼 */}
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={() => setShowHint(true)}
              >
                <Ionicons name="bulb-outline" size={28} color={colors.white} />
                <Text style={styles.voiceButtonText}>힌트</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 버튼 그룹 (텍스트 모드) - 통화 종료 버튼 포함 */}
        {callType === "message" && (
          <View style={styles.messageBottomSection}>
            <TouchableOpacity
              style={styles.actionButtonSmall}
              onPress={() => setShowHint(true)}
            >
              <Ionicons name="bulb-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonTextSmall}>힌트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endCallButtonSmall}
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={24} color={colors.white} />
              <Text style={styles.endCallTextSmall}>종료</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonSmall}
              onPress={() => setShowMemo(true)}
            >
              <Ionicons name="create-outline" size={20} color={colors.white} />
              <Text style={styles.actionButtonTextSmall}>메모</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 통화 종료 버튼 - 음성 모드에서만 */}
      {callType === "voice" && (
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
          >
            <Ionicons name="call" size={28} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.endCallText}>통화 종료</Text>
        </View>
      )}

      {/* 힌트 모달 */}
      <Modal
        visible={showHint}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHint(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="bulb" size={24} color={colors.yellow500} />
              <Text style={styles.modalTitle}>힌트</Text>
              <TouchableOpacity onPress={() => setShowHint(false)}>
                <Ionicons name="close" size={24} color={colors.slate400} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.hintText}>
                • 금융기관은 전화로 개인정보를 요구하지 않습니다{"\n"}•
                긴급하다며 압박하는 것은 의심해야 합니다{"\n"}• 확실하지 않으면
                통화를 끊고 공식 번호로 재확인하세요
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowHint(false)}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 메모 모달 */}
      <Modal
        visible={showMemo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMemo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="create" size={24} color={colors.blue300} />
              <Text style={styles.modalTitle}>메모</Text>
              <TouchableOpacity onPress={() => setShowMemo(false)}>
                <Ionicons name="close" size={24} color={colors.slate400} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.memoText}>
                의심스러운 점을 기록해보세요:{"\n\n"}• 요구한 정보가 무엇인가요?
                {"\n"}• 어떤 압박이 있었나요?{"\n"}• 이상한 점은 무엇인가요?
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowMemo(false)}
            >
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate950,
  },
  connectingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  connectingText: {
    fontSize: 18,
    color: colors.white,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.red600,
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: colors.slate400,
    textAlign: "center",
    marginBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileSectionCompact: {
    marginBottom: 12,
    width: "100%",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  profileInfo: {
    flex: 1,
  },
  avatarCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.slate800,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.slate800,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  callerName: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 8,
  },
  callerNameSmall: {
    fontSize: 16,
    marginBottom: 2,
  },
  callerNumber: {
    fontSize: 16,
    color: colors.slate400,
    marginBottom: 24,
  },
  timerContainer: {
    paddingVertical: 12,
  },
  timer: {
    fontSize: 40,
    fontWeight: "300",
    color: colors.green500,
    letterSpacing: 2,
  },
  timerSmall: {
    fontSize: 16,
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: colors.slate900,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 12,
    maxWidth: "100%",
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.slate300,
    lineHeight: 18,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.white,
  },
  bottomSection: {
    alignItems: "center",
    paddingBottom: 48,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.red600,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  endCallText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  // 문자 모드 하단 버튼
  messageBottomSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    paddingVertical: 12,
    width: "100%",
  },
  actionButtonSmall: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.slate800,
  },
  actionButtonTextSmall: {
    fontSize: 10,
    color: colors.slate300,
    marginTop: 2,
  },
  endCallButtonSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.red600,
    justifyContent: "center",
    alignItems: "center",
  },
  endCallTextSmall: {
    fontSize: 10,
    color: colors.white,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.slate800,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate700,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    flex: 1,
    marginLeft: 12,
  },
  modalBody: {
    padding: 20,
  },
  hintText: {
    fontSize: 15,
    color: colors.slate300,
    lineHeight: 24,
  },
  memoText: {
    fontSize: 15,
    color: colors.slate300,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: colors.red600,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  // 채팅 스타일
  chatContainer: {
    flex: 1,
    width: "100%",
    marginBottom: 16,
  },
  chatContainerFull: {
    flex: 1,
    width: "100%",
    marginBottom: 8,
  },
  chatScroll: {
    flex: 1,
    backgroundColor: colors.slate900,
    borderRadius: 12,
  },
  chatContent: {
    padding: 12,
    gap: 8,
  },
  waitingContainer: {
    padding: 20,
    alignItems: "center",
  },
  waitingText: {
    fontSize: 14,
    color: colors.slate400,
    fontStyle: "italic",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: colors.red600,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: colors.slate700,
  },
  systemMessage: {
    alignSelf: "center",
    backgroundColor: colors.yellow900,
    maxWidth: "90%",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.white,
  },
  aiMessageText: {
    color: colors.slate300,
  },
  systemMessageText: {
    color: colors.yellow500,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate800,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.white,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.red600,
    justifyContent: "center",
    alignItems: "center",
  },
  // 음성 통화 스타일
  voiceControls: {
    width: "100%",
    alignItems: "center",
    gap: 24,
  },
  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 24,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.red600,
  },
  recordingText: {
    fontSize: 14,
    color: colors.red600,
    fontWeight: "500",
  },
  playingText: {
    fontSize: 14,
    color: colors.green500,
    fontWeight: "500",
  },
  voiceButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    width: "100%",
  },
  voiceButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.slate800,
    gap: 4,
  },
  voiceButtonMuted: {
    backgroundColor: colors.red900,
  },
  voiceButtonText: {
    fontSize: 10,
    color: colors.slate300,
    marginTop: 4,
  },
  talkButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.green800,
    gap: 4,
  },
  talkButtonActive: {
    backgroundColor: colors.red600,
  },
  talkButtonText: {
    fontSize: 11,
    color: colors.white,
    textAlign: "center",
    marginTop: 4,
  },
});
