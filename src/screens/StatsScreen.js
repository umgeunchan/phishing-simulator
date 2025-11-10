import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import BottomNav from "../components/BottomNav";
import { useApp } from "../contexts/AppContext";
import { colors } from "../styles/colors";

export default function StatsScreen({ navigation }) {
  const { trainingHistory, securityScore, getStats } = useApp();
  const stats = getStats();

  // 유형별 통계 계산
  const getTypeStats = () => {
    const typeData = {};
    trainingHistory.forEach((record) => {
      if (!typeData[record.scenarioName]) {
        typeData[record.scenarioName] = { total: 0, success: 0 };
      }
      typeData[record.scenarioName].total++;
      if (record.success) {
        typeData[record.scenarioName].success++;
      }
    });

    return Object.keys(typeData).map((type) => ({
      type,
      rate: Math.round((typeData[type].success / typeData[type].total) * 100),
    }));
  };

  const typeStats = getTypeStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>학습 통계</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 전체 통계 카드 */}
        <View style={styles.overviewGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{trainingHistory.length}</Text>
            <Text style={styles.statLabel}>총 훈련 횟수</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.successRate}%</Text>
            <Text style={styles.statLabel}>차단 성공률</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{typeStats.length}</Text>
            <Text style={styles.statLabel}>학습한 유형</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{securityScore}</Text>
            <Text style={styles.statLabel}>보안 점수</Text>
          </View>
        </View>

        {/* 유형별 성공률 */}
        {typeStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>유형별 성공률</Text>
            {typeStats.map((item, index) => (
              <View key={index} style={styles.typeCard}>
                <View style={styles.typeHeader}>
                  <Text style={styles.typeName}>{item.type}</Text>
                  <Text style={styles.typeRate}>{item.rate}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${item.rate}%`,
                        backgroundColor:
                          item.rate >= 80
                            ? colors.green500
                            : item.rate >= 60
                            ? colors.yellow500
                            : colors.red600,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 최근 활동 */}
        {trainingHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>최근 활동</Text>
            {trainingHistory.slice(0, 5).map((record, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityLeft}>
                  <Ionicons
                    name={record.success ? "checkmark-circle" : "close-circle"}
                    size={24}
                    color={record.success ? colors.green500 : colors.red600}
                  />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityType}>
                      {record.scenarioName}
                    </Text>
                    <Text style={styles.activityDate}>{record.date}</Text>
                  </View>
                </View>
                <Text style={styles.activityScore}>
                  {record.score || (record.success ? 85 : 45)}점
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 빈 상태 */}
        {trainingHistory.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="bar-chart-outline"
              size={64}
              color={colors.slate600}
            />
            <Text style={styles.emptyText}>아직 훈련 기록이 없습니다</Text>
            <Text style={styles.emptySubtext}>
              첫 시뮬레이션을 시작해보세요
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav navigation={navigation} currentScreen="Stats" />
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.slate400,
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
  typeCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  typeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeName: {
    fontSize: 16,
    color: colors.white,
  },
  typeRate: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.slate700,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  activityCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.white,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: colors.slate400,
  },
  activityScore: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.slate300,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.slate400,
  },
});
