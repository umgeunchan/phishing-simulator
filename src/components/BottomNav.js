import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../styles/colors";

export default function BottomNav({ navigation, currentScreen }) {
  const tabs = [
    { name: "Home", icon: "shield", label: "홈" },
    { name: "Stats", icon: "trending-up", label: "통계" },
    { name: "Settings", icon: "settings", label: "설정" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline`}
              size={20}
              color={isActive ? colors.red600 : colors.slate400}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.slate800,
    backgroundColor: colors.slate900,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: colors.slate400,
  },
  labelActive: {
    color: colors.red600,
  },
});
