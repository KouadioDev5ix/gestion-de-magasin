import '../../global.css';

// Imports ciblés : seules les 5 graisses utilisées sont embarquées dans l'application.
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useSyncExternalStore } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ToastHost } from '@/components/Toast';
import { colors } from '@/lib/theme';
import { useApp } from '@/store/useApp';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(colors.app).catch(() => {});

const subscribeHydration = (cb: () => void) => useApp.persist.onFinishHydration(cb);
const getHydrated = () => useApp.persist.hasHydrated();

function useHydrated() {
  return useSyncExternalStore(subscribeHydration, getHydrated, getHydrated);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const hydrated = useHydrated();
  const signedIn = useApp((s) => s.sessionUserId !== null && s.users.some((u) => u.id === s.sessionUserId));
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Redirection explicite à la connexion / déconnexion, en complément des gardes Stack.Protected.
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';
  useEffect(() => {
    if (!ready) return;
    if (!signedIn && !inAuthGroup) {
      if (router.canDismiss()) router.dismissAll();
      router.replace('/login');
    } else if (signedIn && inAuthGroup) {
      router.replace('/');
    }
  }, [ready, signedIn, inAuthGroup]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.app }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.app },
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      >
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="article/[id]" />
          <Stack.Screen name="article/form" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
          <Stack.Screen name="vente/form" options={{ animation: 'slide_from_bottom', gestureEnabled: true }} />
          <Stack.Screen name="categories" />
          <Stack.Screen name="equipe" />
          <Stack.Screen name="mot-de-passe" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
      <ToastHost />
    </GestureHandlerRootView>
  );
}
