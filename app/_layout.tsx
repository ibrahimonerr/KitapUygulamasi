import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Lora_400Regular, Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../store/ThemeContext';
import { LibraryProvider } from '../store/LibraryContext';
import { ClubsProvider } from '../store/ClubsContext';
import { UserProvider } from '../store/UserContext';
import { AuthProvider } from '../store/AuthContext';
import { SocialProvider } from '../store/SocialContext';

import { GamificationProvider } from '../store/GamificationContext';

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

function RootLayoutContent() {
  const { colors, isDark } = useTheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <LibraryProvider>
        <AuthProvider>
          <SocialProvider>
            <UserProvider>
              <ClubsProvider>
                <GamificationProvider>
                  <StatusBar style={isDark ? "light" : "dark"} />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: colors.background },
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="search" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="club/[id]" options={{ presentation: 'card' }} />
                  </Stack>
                </GamificationProvider>
              </ClubsProvider>
            </UserProvider>
          </SocialProvider>
        </AuthProvider>
      </LibraryProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
