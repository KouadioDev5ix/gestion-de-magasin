import { Redirect, Stack, useSegments } from 'expo-router';

import { colors } from '@/lib/theme';
import { useHasAccount } from '@/store/useApp';

export const unstable_settings = { initialRouteName: 'login' };

export default function AuthLayout() {
  const hasAccount = useHasAccount();
  const segments = useSegments();
  const screen = segments[segments.length - 1];

  // Premier lancement : on crée d'abord la boutique. Ensuite, l'inscription n'est plus accessible.
  if (!hasAccount && screen !== 'register') return <Redirect href="/register" />;
  if (hasAccount && screen === 'register') return <Redirect href="/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.app },
        animation: 'fade',
      }}
    />
  );
}
