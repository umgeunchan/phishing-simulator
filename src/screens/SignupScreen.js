import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../styles/colors";
import api from "../utils/api";

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 유효성 검사
  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert("오류", "아이디를 입력해주세요.");
      return false;
    }

    if (username.length < 4) {
      Alert.alert("오류", "아이디는 4자 이상이어야 합니다.");
      return false;
    }

    if (!password) {
      Alert.alert("오류", "비밀번호를 입력해주세요.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("오류", "비밀번호는 6자 이상이어야 합니다.");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return false;
    }

    if (!name.trim()) {
      Alert.alert("오류", "이름을 입력해주세요.");
      return false;
    }

    if (!age.trim()) {
      Alert.alert("오류", "나이를 입력해주세요.");
      return false;
    }

    const ageNumber = parseInt(age);
    if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 120) {
      Alert.alert("오류", "올바른 나이를 입력해주세요.");
      return false;
    }

    if (!gender) {
      Alert.alert("오류", "성별을 선택해주세요.");
      return false;
    }

    return true;
  };

  // 회원가입 처리
  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    console.log("===== 회원가입 시도 =====");
    console.log("아이디:", username.trim());
    console.log("이름:", name.trim());
    console.log("나이:", age);
    console.log("성별:", gender);

    try {
      const result = await api.signup(
        username.trim(),
        password,
        name.trim(),
        parseInt(age),
        gender
      );
      console.log("회원가입 결과:", result);

      if (result.success) {
        Alert.alert(
          "가입 완료",
          "회원가입이 완료되었습니다!\n로그인 화면으로 이동합니다.",
          [
            {
              text: "확인",
              onPress: () => navigation.replace("Login"),
            },
          ]
        );
      } else {
        Alert.alert("가입 실패", result.error || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 에러:", error);
      Alert.alert("오류", "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Logo & Title */}
          <View style={styles.logoContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield" size={48} color={colors.white} />
            </View>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>
              피싱 시뮬레이터에 오신 것을 환영합니다
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* 아이디 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>아이디</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.slate400}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="아이디 (4자 이상)"
                  placeholderTextColor={colors.slate500}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* 비밀번호 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.slate400}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 (6자 이상)"
                  placeholderTextColor={colors.slate500}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={colors.slate400}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.slate400}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호 확인"
                  placeholderTextColor={colors.slate500}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color={colors.slate400}
                  />
                </TouchableOpacity>
              </View>
              {/* 비밀번호 일치 여부 표시 */}
              {confirmPassword.length > 0 && (
                <View style={styles.passwordMatch}>
                  <Ionicons
                    name={
                      password === confirmPassword
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      password === confirmPassword
                        ? colors.green500
                        : colors.red600
                    }
                  />
                  <Text
                    style={[
                      styles.passwordMatchText,
                      {
                        color:
                          password === confirmPassword
                            ? colors.green500
                            : colors.red600,
                      },
                    ]}
                  >
                    {password === confirmPassword
                      ? "비밀번호가 일치합니다"
                      : "비밀번호가 일치하지 않습니다"}
                  </Text>
                </View>
              )}
            </View>

            {/* 이름 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person"
                  size={20}
                  color={colors.slate400}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="이름"
                  placeholderTextColor={colors.slate500}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* 나이 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>나이</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.slate400}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="나이"
                  placeholderTextColor={colors.slate500}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* 성별 선택 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>성별</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "male" && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender("male")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="male"
                    size={20}
                    color={gender === "male" ? colors.white : colors.slate400}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === "male" && styles.genderButtonTextActive,
                    ]}
                  >
                    남성
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    gender === "female" && styles.genderButtonActive,
                  ]}
                  onPress={() => setGender("female")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="female"
                    size={20}
                    color={gender === "female" ? colors.white : colors.slate400}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === "female" && styles.genderButtonTextActive,
                    ]}
                  >
                    여성
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 가입 버튼 */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                loading && styles.signupButtonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.signupButtonText}>
                {loading ? "가입 중..." : "가입하기"}
              </Text>
            </TouchableOpacity>

            {/* 로그인 링크 */}
            <View style={styles.loginLink}>
              <Text style={styles.loginLinkText}>이미 계정이 있으신가요?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLinkButton}>로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate900,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.red600,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.slate400,
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate800,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate700,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: colors.white,
  },
  eyeIcon: {
    padding: 8,
  },
  passwordMatch: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  passwordMatchText: {
    fontSize: 12,
    fontWeight: "500",
  },
  signupButton: {
    backgroundColor: colors.red600,
    borderRadius: 12,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  signupButtonDisabled: {
    backgroundColor: colors.slate700,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.slate400,
  },
  loginLinkButton: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.red600,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.slate800,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate700,
    paddingVertical: 16,
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: colors.red600,
    borderColor: colors.red600,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.slate400,
  },
  genderButtonTextActive: {
    color: colors.white,
  },
});
