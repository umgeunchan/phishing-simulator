import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../styles/colors";

const { width } = Dimensions.get("window");

export default function OnboardingScreen({ navigation }) {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      icon: "shield",
      title: "보이스피싱\n시뮬레이터",
      description: "실전과 같은 시뮬레이션으로\n보이스피싱에 대비하세요",
      iconColor: colors.red600,
    },
    {
      icon: "call",
      title: "실시간\n시뮬레이션",
      description: "실제 보이스피싱 상황을\n안전하게 체험해보세요",
      iconColor: colors.blue300,
    },
    {
      icon: "trending-up",
      title: "맞춤형\n학습",
      description: "다양한 유형의 피싱을 학습하고\n대응 능력을 향상시키세요",
      iconColor: colors.green500,
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleStart();
    }
  };

  const handleSkip = () => {
    handleStart();
  };

  const handleStart = () => {
    navigation.replace("Home");
  };

  const currentPageData = pages[currentPage];

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip 버튼 */}
      {currentPage < pages.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      )}

      {/* 콘텐츠 */}
      <View style={styles.content}>
        {/* 아이콘 */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: currentPageData.iconColor },
          ]}
        >
          <Ionicons
            name={currentPageData.icon}
            size={80}
            color={colors.white}
          />
        </View>

        {/* 제목 */}
        <Text style={styles.title}>{currentPageData.title}</Text>

        {/* 설명 */}
        <Text style={styles.description}>{currentPageData.description}</Text>
      </View>

      {/* 하단 영역 */}
      <View style={styles.bottomSection}>
        {/* 페이지 인디케이터 */}
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentPage && styles.dotActive]}
            />
          ))}
        </View>

        {/* 다음/시작 버튼 */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentPage === pages.length - 1 ? "시작하기" : "다음"}
          </Text>
          {currentPage < pages.length - 1 && (
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          )}
        </TouchableOpacity>

        {/* 약관 */}
        <Text style={styles.termsText}>
          계속 진행하면 서비스 이용약관에 동의하게 됩니다
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate900,
  },
  skipButton: {
    alignSelf: "flex-end",
    padding: 16,
    paddingRight: 24,
  },
  skipText: {
    fontSize: 16,
    color: colors.slate400,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: colors.slate400,
    textAlign: "center",
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate700,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.red600,
  },
  nextButton: {
    backgroundColor: colors.red600,
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  termsText: {
    fontSize: 12,
    color: colors.slate500,
    textAlign: "center",
  },
});
