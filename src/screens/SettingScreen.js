import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../components/BottomNav";
import { useApp } from "../contexts/AppContext";
import { colors } from "../styles/colors";

export default function SettingScreen({ navigation }) {
  const { trainingHistory } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const handleResetData = () => {
    Alert.alert(
      "데이터 초기화",
      "모든 훈련 기록과 통계가 삭제됩니다. 계속하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "초기화",
          style: "destructive",
          onPress: () => {
            // 실제로는 AsyncStorage 초기화
            Alert.alert("완료", "데이터가 초기화되었습니다.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 알림 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications" size={20} color={colors.white} />
                <Text style={styles.settingLabel}>기습 통화 알림</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.slate700, true: colors.red600 }}
                thumbColor={colors.white}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="time" size={20} color={colors.white} />
                <Text style={styles.settingLabel}>학습 리마인더</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.slate700, true: colors.red600 }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* 계정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="person" size={20} color={colors.white} />
                <Text style={styles.settingLabel}>프로필 수정</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.slate600}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleResetData}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="refresh" size={20} color={colors.red600} />
                <Text style={[styles.settingLabel, styles.dangerText]}>
                  데이터 초기화
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.slate600}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={colors.white}
                />
                <Text style={styles.settingLabel}>버전 정보</Text>
              </View>
              <Text style={styles.versionText}>v1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="document-text" size={20} color={colors.white} />
                <Text style={styles.settingLabel}>이용약관</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.slate600}
              />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={colors.white}
                />
                <Text style={styles.settingLabel}>개인정보처리방침</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.slate600}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 통계 요약 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 통계</Text>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>총 훈련 횟수</Text>
              <Text style={styles.statsValue}>{trainingHistory.length}회</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>데이터 사용</Text>
              <Text style={styles.statsValue}>
                {(trainingHistory.length * 0.5).toFixed(1)} MB
              </Text>
            </View>
          </View>
        </View>

        {/* 개발 정보 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            보이스피싱으로부터 안전한 사회를 만듭니다
          </Text>
          <Text style={styles.footerSubtext}>© 2025 Phishing Simulator</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav navigation={navigation} currentScreen="Setting" />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.slate400,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.white,
  },
  dangerText: {
    color: colors.red600,
  },
  divider: {
    height: 1,
    backgroundColor: colors.slate700,
    marginLeft: 48,
  },
  versionText: {
    fontSize: 14,
    color: colors.slate400,
  },
  statsCard: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsLabel: {
    fontSize: 14,
    color: colors.slate400,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.slate400,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.slate600,
  },
});
