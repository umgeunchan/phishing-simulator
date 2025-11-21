import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useApp } from "../contexts/AppContext";
import { colors } from "../styles/colors";

export default function LoginScreen({ navigation }) {
  const { login, loading } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("오류", "아이디와 비밀번호를 입력하세요");
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      navigation.replace("Home");
    } else {
      Alert.alert(
        "로그인 실패",
        result.error || "아이디 또는 비밀번호를 확인하세요"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 로고 */}
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield" size={60} color={colors.white} />
          </View>
          <Text style={styles.title}>피싱 시뮬레이터</Text>
          <Text style={styles.subtitle}>안전한 훈련으로 보이스피싱 대비</Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={colors.slate400} />
            <TextInput
              style={styles.input}
              placeholder="아이디"
              placeholderTextColor={colors.slate400}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.slate400}
            />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor={colors.slate400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.slate400}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.loginButtonText}>로그인</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate("Signup")}
          >
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
        </View>

        {/* 체험하기 */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => navigation.replace("Onboarding")}
        >
          <Text style={styles.demoButtonText}>로그인 없이 체험하기</Text>
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
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.red600,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
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
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.white,
  },
  loginButton: {
    backgroundColor: colors.red600,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  signupButton: {
    backgroundColor: colors.slate800,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  demoButton: {
    marginTop: 24,
    alignItems: "center",
  },
  demoButtonText: {
    fontSize: 14,
    color: colors.slate400,
    textDecorationLine: "underline",
  },
});
