import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../contexts/AppContext";
import { colors } from "../styles/colors";

export default function CallScreen({ navigation, route }) {
  const { currentScenario, saveTrainingResult } = useApp();
  const { callType } = route.params || { callType: "voice" }; // 'voice' 또는 'message'

  const [callTime, setCallTime] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showMemo, setShowMemo] = useState(false);

  // 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 시간 포맷팅 (00:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 통화 종료
  const handleEndCall = () => {
    // 임시로 결과 저장
    const result = {
      scenarioName: currentScenario.name,
      success: Math.random() > 0.5, // 임시로 랜덤
      date: new Date().toLocaleString("ko-KR"),
      duration: callTime,
      callType: callType,
    };

    saveTrainingResult(result);

    // 결과 화면으로 이동 (나중에 구현)
    navigation.navigate("Home");
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

        {/* 경고 메시지 */}
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={16} color={colors.yellow500} />
          <Text style={styles.warningText}>
            의심스러운 요청에는 응답하지 마세요. 개인정보나 계좌번호를 절대
            알려주지 마세요.
          </Text>
        </View>

        {/* 버튼 그룹 */}
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
});
