import { LinearGradient } from 'expo-linear-gradient';
import { Store } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/lib/theme';
import { Txt } from './Txt';
import { MView } from './motion';

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Gabarit des écrans d'authentification : bandeau de marque + carte de formulaire. */
export function AuthShell({ eyebrow, title, subtitle, children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-surface-app">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
      >
        <LinearGradient
          colors={[colors.brandDeep, '#2E2B80', colors.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top + 28, paddingBottom: 84, paddingHorizontal: 24 }}
        >
          {/* Formes décoratives discrètes */}
          <View className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-white/5" />
          <View className="absolute -left-10 bottom-4 h-32 w-32 rounded-full bg-white/5" />

          <MView entering={FadeInUp.duration(500)} className="flex-row items-center gap-2.5">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
              <Store size={22} color={colors.brand} strokeWidth={2.3} />
            </View>
            <Txt weight="extrabold" className="text-xl text-white">
              GestCom
            </Txt>
          </MView>

          <MView entering={FadeInUp.delay(80).duration(500)} className="mt-10">
            <Txt weight="semibold" className="text-[13px] uppercase tracking-[1.5px] text-brand-200">
              {eyebrow}
            </Txt>
            <Txt weight="extrabold" className="mt-2 text-[30px] leading-[36px] text-white">
              {title}
            </Txt>
            <Txt className="mt-2 text-[15px] leading-[22px] text-white/70">{subtitle}</Txt>
          </MView>
        </LinearGradient>

        <MView
          entering={FadeInDown.delay(120).duration(520).springify().damping(20)}
          className="mx-4 -mt-14 rounded-4xl border border-surface-line bg-surface p-5"
          style={{ shadowColor: '#1C1A4B', shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 6 }}
        >
          {children}
        </MView>

        {footer ? <View className="mt-6 px-6">{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
