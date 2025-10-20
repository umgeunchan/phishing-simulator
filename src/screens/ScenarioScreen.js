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
import { getDangerColor, scenarios } from "../utils/scenarios";

export default function ScenarioScreen({ navigation }) {
  const { setCurrentScenario } = useApp();

  const handleSelectScenario = (scenario) => {
    setCurrentScenario(scenario);
    navigation.navigate("CallSetup"); // ← 이렇게 변경
  };

  const getDangerBadgeStyle = (dangerLevel) => {
    const dangerColor = getDangerColor(dangerLevel);
    return {
      backgroundColor: dangerColor.bg,
      color: dangerColor.text,
    };
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>시나리오 선택</Text>
          <Text style={styles.subtitle}>훈련할 유형을 선택하세요</Text>
        </View>
      </View>

      {/* Scenarios List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {scenarios.map((scenario) => {
          const badgeStyle = getDangerBadgeStyle(scenario.dangerLevel);

          return (
            <TouchableOpacity
              key={scenario.id}
              style={styles.scenarioCard}
              activeOpacity={0.7}
              onPress={() => handleSelectScenario(scenario)}
            >
              <View style={styles.scenarioHeader}>
                <Text style={styles.scenarioName}>{scenario.name}</Text>
                <View
                  style={[
                    styles.dangerBadge,
                    { backgroundColor: badgeStyle.backgroundColor },
                  ]}
                >
                  <Text
                    style={[styles.dangerText, { color: badgeStyle.color }]}
                  >
                    위험도: {scenario.danger}
                  </Text>
                </View>
              </View>
              <Text style={styles.scenarioDescription}>
                {scenario.description}
              </Text>

              {/* 화살표 아이콘 */}
              <View style={styles.arrowContainer}>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.slate600}
                />
              </View>
            </TouchableOpacity>
          );
        })}

        {/* 하단 여백 */}
        <View style={{ height: 24 }} />
      </ScrollView>
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
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: colors.slate400,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  scenarioCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: "relative",
  },
  scenarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  scenarioDescription: {
    fontSize: 14,
    color: colors.slate400,
    lineHeight: 20,
  },
  arrowContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
  },
});
