import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style="dark" />
      <HomeScreen />
    </SafeAreaView>
  );
}
