import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Component, ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { AppProvider } from '@/context/AppContext';

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.danger, marginBottom: 12 }}>
            Terjadi Kesalahan
          </Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 13 }}>
            {err.message || 'Kesalahan tidak diketahui. Coba muat ulang halaman.'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
