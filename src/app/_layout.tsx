import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from '@/constants/theme';
import { AppProvider } from '@/context/AppContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="success" />
          <Stack.Screen name="form/[service]" />
          <Stack.Screen name="request/[id]" />
          <Stack.Screen name="admin-request/[id]" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="profile/password" />
          <Stack.Screen name="(warga)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
