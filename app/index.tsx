import { StatusBar } from "expo-status-bar";
import { AppProvider } from "../src/contexts/AppContext";
import AppNavigator from "../src/navigation/AppNavigator";

export default function Page() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AppProvider>
  );
}
