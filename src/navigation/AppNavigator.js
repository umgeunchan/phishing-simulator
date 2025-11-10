import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CallScreen from "../screens/CallScreen";
import CallSetupScreen from "../screens/CallSetupScreen";
import HomeScreen from "../screens/HomeScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ResultScreen from "../screens/ResultScreen";
import ScenarioScreen from "../screens/ScenarioScreen";
import SettingScreen from "../screens/SettingScreen";
import StatsScreen from "../screens/StatsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Scenario" component={ScenarioScreen} />
        <Stack.Screen name="CallSetup" component={CallSetupScreen} />
        <Stack.Screen name="Call" component={CallScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Setting" component={SettingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
