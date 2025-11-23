import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../contexts/AppContext";
import { colors } from "../styles/colors";
import { getDangerColor } from "../utils/scenarios";
import websocket from "../utils/websocket";

export default function CallSetupScreen({ navigation }) {
  const { currentScenario } = useApp();
  const [connecting, setConnecting] = useState(false);

  if (!currentScenario) {
    return null;
  }

  const badgeStyle = getDangerColor(currentScenario.dangerLevel);

  const handleStartCall = async () => {
    setConnecting(true);
    try {
      // 백엔드 시나리오 ID 사용 (없으면 loan_scam 기본값)
      const scenarioId = currentScenario.backendId || "loan_scam";
      await websocket.connect(scenarioId, "voice");
      navigation.navigate("Call", { callType: "voice" });
    } catch (error) {
      console.error("WebSocket 연결 실패:", error);
      Alert.alert(
        "연결 실패",
        "시뮬레이션 서버에 연결할 수 없습니다.\n로그인 상태를 확인해주세요."
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleStartMessage = async () => {
    setConnecting(true);
    try {
      const scenarioId = currentScenario.backendId || "loan_scam";
      await websocket.connect(scenarioId, "text");
      navigation.navigate("Call", { callType: "message" });
    } catch (error) {
      console.error("WebSocket 연결 실패:", error);
      Alert.alert(
        "연결 실패",
        "시뮬레이션 서버에 연결할 수 없습니다.\n로그인 상태를 확인해주세요."
      );
    } finally {
      setConnecting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.slate400} />
        </TouchableOpacity>
        <Text style={styles.title}>시뮬레이션 설정</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* 선택된 시나리오 카드 */}
        <View style={styles.selectedCard}>
          <Text style={styles.cardTitle}>선택된 시나리오</Text>
          <View style={styles.scenarioInfo}>
            <Text style={styles.scenarioName}>{currentScenario.name}</Text>
            <View
              style={[styles.dangerBadge, { backgroundColor: badgeStyle.bg }]}
            >
              <Text style={[styles.dangerText, { color: badgeStyle.text }]}>
                위험도: {currentScenario.danger}
              </Text>
            </View>
          </View>
        </View>

        {/* 시작 방법 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시뮬레이션 방식</Text>

          {/* 전화 시뮬레이션 */}
          <TouchableOpacity
            style={[styles.methodButton, connecting && styles.methodButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleStartCall}
            disabled={connecting}
          >
            <View style={styles.methodContent}>
              <View style={styles.methodLeft}>
                <View style={styles.iconCircle}>
                  {connecting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Ionicons name="call" size={24} color={colors.white} />
                  )}
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>
                    {connecting ? "연결 중..." : "전화 시뮬레이션"}
                  </Text>
                  <Text style={styles.methodDescription}>
                    실제 통화처럼 음성으로 진행됩니다
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.white} />
            </View>
          </TouchableOpacity>

          {/* 문자 시뮬레이션 */}
          <TouchableOpacity
            style={[styles.methodButton, styles.methodButtonSecondary]}
            activeOpacity={0.8}
            onPress={handleStartMessage}
          >
            <View style={styles.methodContent}>
              <View style={styles.methodLeft}>
                <View style={[styles.iconCircle, styles.iconCircleSecondary]}>
                  <Ionicons
                    name="chatbubble"
                    size={24}
                    color={colors.slate300}
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>문자 시뮬레이션</Text>
                  <Text style={styles.methodDescription}>
                    텍스트 메시지로 진행됩니다
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.slate400}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* 주의사항 */}
        <View style={styles.warningBox}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color={colors.amber400} />
            <Text style={styles.warningTitle}>주의사항</Text>
          </View>
          <Text style={styles.warningText}>
            시뮬레이션 중에는 실제 상황처럼 진행됩니다. 개인정보나 금융정보를
            절대 입력하지 마세요.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate900,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate800,
    gap: 16,
  },
  backButton: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  selectedCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate400,
    marginBottom: 12,
  },
  scenarioInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scenarioName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  dangerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dangerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 16,
  },
  methodButton: {
    backgroundColor: colors.red600,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodButtonDisabled: {
    opacity: 0.7,
  },
  methodButtonSecondary: {
    backgroundColor: colors.slate800,
  },
  methodContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircleSecondary: {
    backgroundColor: colors.slate700,
  },
  methodInfo: {
    flex: 1,
    gap: 4,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  methodDescription: {
    fontSize: 14,
    color: colors.slate300,
  },
  warningBox: {
    backgroundColor: colors.amber900,
    borderWidth: 1,
    borderColor: colors.amber700,
    borderRadius: 12,
    padding: 16,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.amber200,
  },
  warningText: {
    fontSize: 14,
    color: colors.amber300,
    lineHeight: 20,
  },
});
