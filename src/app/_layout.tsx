import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="stamp/[id]" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
