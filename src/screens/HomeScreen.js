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

export default function HomeScreen({ navigation }) {
  const { securityScore, trainingHistory } = useApp();

  // 최근 3개 기록만 표시
  const recentHistory = trainingHistory.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield" size={24} color={colors.white} />
            </View>
            <Text style={styles.title}>피싱 시뮬레이터</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.slate400}
            />
          </TouchableOpacity>
        </View>

        {/* 보안 점수 카드 */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>보안 점수</Text>
            <Ionicons name="trophy" size={16} color={colors.yellow500} />
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{securityScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${securityScore}%` }]}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 시뮬레이션 시작 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시뮬레이션 시작</Text>
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Scenario")}
          >
            <View style={styles.startButtonContent}>
              <Ionicons name="play" size={20} color={colors.white} />
              <Text style={styles.startButtonText}>새 시뮬레이션</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* 최근 기록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 기록</Text>
          {recentHistory.length > 0 ? (
            <View style={styles.historyList}>
              {recentHistory.map((record, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyLeft}>
                    <Ionicons
                      name={
                        record.success ? "checkmark-circle" : "close-circle"
                      }
                      size={20}
                      color={record.success ? colors.green500 : colors.red600}
                    />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyType}>
                        {record.scenarioName}
                      </Text>
                      <Text style={styles.historyDate}>{record.date}</Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.slate600}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="clipboard-outline"
                size={48}
                color={colors.slate600}
              />
              <Text style={styles.emptyText}>아직 훈련 기록이 없습니다</Text>
              <Text style={styles.emptySubtext}>
                새 시뮬레이션을 시작해보세요
              </Text>
            </View>
          )}
        </View>

        {/* 통계 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{trainingHistory.length}</Text>
              <Text style={styles.statLabel}>완료한 훈련</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {trainingHistory.length > 0
                  ? Math.round(
                      (trainingHistory.filter((h) => h.success).length /
                        trainingHistory.length) *
                        100
                    )
                  : 0}
                %
              </Text>
              <Text style={styles.statLabel}>차단 성공률</Text>
            </View>
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="shield" size={20} color={colors.red600} />
          <Text style={[styles.navText, styles.navTextActive]}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Stats")}
        >
          <Ionicons
            name="trending-up-outline"
            size={20}
            color={colors.slate400}
          />
          <Text style={styles.navText}>통계</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Setting")}
        >
          <Ionicons name="settings-outline" size={20} color={colors.slate400} />
          <Text style={styles.navText}>설정</Text>
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
  header: {
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate800,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.red600,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  scoreCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.slate400,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
  },
  scoreMax: {
    fontSize: 16,
    color: colors.slate400,
    marginBottom: 4,
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.slate700,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.yellow500,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: colors.red600,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  startButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyInfo: {
    gap: 4,
  },
  historyType: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.white,
  },
  historyDate: {
    fontSize: 12,
    color: colors.slate400,
  },
  emptyState: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.slate300,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.slate400,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.slate400,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.slate800,
    backgroundColor: colors.slate900,
  },
  navItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  navText: {
    fontSize: 12,
    color: colors.slate400,
  },
  navTextActive: {
    color: colors.red600,
  },
});
