import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../contexts/AppContext";
import { colors } from "../styles/colors";

export default function ResultScreen({ navigation, route }) {
  const { currentScenario } = useApp();
  const { result } = route.params || {};

  if (!currentScenario || !result) {
    return null;
  }

  // 결과에서 outcome 기반 점수 계산
  const outcome = result.outcome || (result.success ? "win" : "fail");

  // 백엔드 점수가 있으면 사용, 없으면 outcome 기반 기본값
  let score = result.backendScore !== undefined ? result.backendScore :
    (outcome === "win" ? 100 : outcome === "fail" ? 0 : 50);

  let outcomeText = "주의 필요";
  let outcomeDescription = "보이스피싱 의심 상황이었습니다";

  if (outcome === "win") {
    outcomeText = "방어 성공!";
    outcomeDescription = result.feedback || "보이스피싱을 성공적으로 차단했습니다";
  } else if (outcome === "fail") {
    outcomeText = "위험 감지";
    outcomeDescription = result.feedback || "개인정보 유출 위험이 있었습니다";
  } else if (outcome === "confusion") {
    outcomeText = "교착 상태";
    outcomeDescription = result.feedback || "대화가 지속되었으나 정보를 제공하지 않았습니다";
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 결과 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>시뮬레이션 결과</Text>
        </View>

        {/* 점수 카드 */}
        <View
          style={[
            styles.scoreCard,
            outcome === "win" ? styles.scoreCardSuccess :
            outcome === "fail" ? styles.scoreCardDanger :
            styles.scoreCardWarning,
          ]}
        >
          <View style={styles.scoreIconContainer}>
            <Ionicons
              name={
                outcome === "win" ? "checkmark-circle" :
                outcome === "fail" ? "close-circle" :
                "alert-circle"
              }
              size={64}
              color={
                outcome === "win" ? colors.green500 :
                outcome === "fail" ? colors.red600 :
                colors.yellow500
              }
            />
          </View>
          <Text style={styles.scoreTitle}>
            {outcomeText}
          </Text>
          <Text style={styles.scoreSubtitle}>
            {outcomeDescription}
          </Text>
          <Text style={styles.scoreValue}>{score}점</Text>
        </View>

        {/* 위험 포인트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>위험 포인트</Text>
          {currentScenario.warningPoints.map((point, index) => (
            <View key={index} style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Ionicons
                  name="warning"
                  size={20}
                  color={
                    point.severity === "high"
                      ? colors.red600
                      : point.severity === "medium"
                      ? colors.yellow500
                      : colors.blue300
                  }
                />
                <Text style={styles.warningTitle}>{point.title}</Text>
              </View>
              <Text style={styles.warningDescription}>{point.description}</Text>
            </View>
          ))}
        </View>

        {/* 올바른 대응 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>올바른 대응</Text>
          <View style={styles.guideCard}>
            <View style={styles.guideItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.green500}
              />
              <Text style={styles.guideText}>
                통화를 즉시 끊고 공식 번호로 직접 연락
              </Text>
            </View>
            <View style={styles.guideItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.green500}
              />
              <Text style={styles.guideText}>
                개인정보나 금융정보는 절대 제공하지 않기
              </Text>
            </View>
            <View style={styles.guideItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.green500}
              />
              <Text style={styles.guideText}>
                112 또는 금융감독원(1332)에 신고
              </Text>
            </View>
            <View style={styles.guideItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.green500}
              />
              <Text style={styles.guideText}>
                가족이나 지인에게도 알려 주의시키기
              </Text>
            </View>
          </View>
        </View>

        {/* 통화 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>통화 정보</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>시나리오</Text>
              <Text style={styles.infoValue}>{currentScenario.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>통화 시간</Text>
              <Text style={styles.infoValue}>
                {Math.floor(result.duration / 60)}분 {result.duration % 60}초
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>방식</Text>
              <Text style={styles.infoValue}>
                {result.callType === "voice" ? "전화" : "문자"}
              </Text>
            </View>
            {result.endReason && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>종료 사유</Text>
                <Text style={styles.infoValue}>{result.endReason}</Text>
              </View>
            )}
            {result.backendScore !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>상세 점수</Text>
                <Text style={styles.infoValue}>{result.backendScore.toFixed(1)}점</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate("Scenario")}
        >
          <Text style={styles.retryButtonText}>다시 훈련하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate900,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate800,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  scoreCard: {
    margin: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  scoreCardSuccess: {
    backgroundColor: colors.green950,
  },
  scoreCardDanger: {
    backgroundColor: colors.red900,
  },
  scoreCardWarning: {
    backgroundColor: colors.amber900,
  },
  scoreIconContainer: {
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 8,
  },
  scoreSubtitle: {
    fontSize: 16,
    color: colors.slate300,
    marginBottom: 16,
    textAlign: "center",
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.white,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 12,
  },
  warningCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    color: colors.white,
  },
  warningDescription: {
    fontSize: 14,
    color: colors.slate400,
    lineHeight: 20,
  },
  guideCard: {
    backgroundColor: colors.green950,
    borderWidth: 1,
    borderColor: colors.green800,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  guideItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  guideText: {
    flex: 1,
    fontSize: 14,
    color: colors.green300,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: colors.slate400,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  bottomButtons: {
    padding: 24,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.slate800,
    backgroundColor: colors.slate900,
  },
  retryButton: {
    backgroundColor: colors.red600,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  homeButton: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
