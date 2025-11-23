import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useEffect, useState, useRef } from "react";
import {
  Modal,
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
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
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
        // 오디오 파일을 base64로 인코딩하여 전송
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // WebSocket으로 오디오 데이터 전송
        websocket.send({
          type: "audio",
          audio: base64Audio,
          format: "wav",
        });
        console.log("📤 오디오 전송 완료");
      }

      recordingRef.current = null;
    } catch (error) {
      console.error("녹음 중지 실패:", error);
    }
  };

  // AI 오디오 응답 재생
  const playAudioResponse = async (audioData) => {
    try {
      setIsPlaying(true);

      // base64 오디오 데이터를 파일로 저장
      const fileUri = FileSystem.cacheDirectory + "ai_response.mp3";
      await FileSystem.writeAsStringAsync(fileUri, audioData, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 오디오 재생
      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      await sound.playAsync();
      console.log("🔊 AI 응답 재생 중");
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

  // WebSocket 메시지 수신
  useEffect(() => {
    const handleMessage = (message) => {
      console.log("📩 수신된 메시지:", message);

      if (message.type === "audio_response" && message.audio) {
        // AI 음성 응답
        playAudioResponse(message.audio);
      } else if (message.type === "ai_message" || message.text) {
        // AI 텍스트 응답 메시지
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            text: message.text || message.content,
            timestamp: new Date(),
          },
        ]);
      } else if (message.type === "simulation_end" || message.result) {
        // 시뮬레이션 종료
        setSimulationResult(message.result || message);
      }
    };

    websocket.onMessage(handleMessage);

    return () => {
      websocket.removeMessageHandler(handleMessage);
    };
  }, []);

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

    // 내 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: inputText.trim(),
        timestamp: new Date(),
      },
    ]);

    // WebSocket으로 전송
    websocket.send({ type: "user_message", text: inputText.trim() });
    setInputText("");
  };

  // 통화 종료
  const handleEndCall = () => {
    // WebSocket 연결 종료
    websocket.disconnect();

    // 결과 저장
    const result = {
      scenarioName: currentScenario.name,
      success: simulationResult?.success ?? (callTime > 30), // 30초 이상이면 성공으로 간주
      date: new Date().toLocaleString("ko-KR"),
      duration: callTime,
      callType: callType,
      messages: messages,
    };

    saveTrainingResult(result);

    // 결과 화면으로 이동
    navigation.navigate("Result", { result });
  };

  if (!currentScenario) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 프로필 영역 */}
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color={colors.slate400} />
          </View>

          <Text style={styles.callerName}>{currentScenario.callerName}</Text>
          <Text style={styles.callerNumber}>
            {currentScenario.callerNumber}
          </Text>

          {/* 타이머 */}
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatTime(callTime)}</Text>
          </View>
        </View>

        {/* 채팅 영역 (문자 시뮬레이션) */}
        {callType === "message" && (
          <View style={styles.chatContainer}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatScroll}
              contentContainerStyle={styles.chatContent}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.type === "user"
                      ? styles.userMessage
                      : styles.aiMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.type === "user"
                        ? styles.userMessageText
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
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Ionicons name="send" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 경고 메시지 */}
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={16} color={colors.yellow500} />
          <Text style={styles.warningText}>
            의심스러운 요청에는 응답하지 마세요. 개인정보나 계좌번호를 절대
            알려주지 마세요.
          </Text>
        </View>

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
                  <Ionicons name="volume-high" size={16} color={colors.green500} />
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

        {/* 버튼 그룹 (텍스트 모드) */}
        {callType === "message" && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowMemo(true)}
            >
              <Ionicons name="create-outline" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>메모하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowHint(true)}
            >
              <Ionicons name="bulb-outline" size={24} color={colors.white} />
              <Text style={styles.actionButtonText}>힌트 보기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 통화 종료 버튼 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Ionicons name="call" size={28} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.endCallText}>통화 종료</Text>
      </View>

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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
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
  chatScroll: {
    flex: 1,
    backgroundColor: colors.slate900,
    borderRadius: 12,
  },
  chatContent: {
    padding: 12,
    gap: 8,
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
