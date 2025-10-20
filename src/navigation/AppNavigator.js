import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CallScreen from "../screens/CallScreen";
import CallSetupScreen from "../screens/CallSetupScreen";
import HomeScreen from "../screens/HomeScreen";
import ScenarioScreen from "../screens/ScenarioScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Scenario" component={ScenarioScreen} />
        <Stack.Screen name="CallSetup" component={CallSetupScreen} />
        <Stack.Screen name="Call" component={CallScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
