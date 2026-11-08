import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import { FadeOutUp, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { haptic } from '@/lib/haptics';
import { colors } from '@/lib/theme';
import { Txt } from './Txt';
import { MView } from './motion';

type Kind = 'success' | 'error' | 'info';
type ToastData = { id: number; kind: Kind; message: string };

const useToastStore = create<{ current: ToastData | null; show: (kind: Kind, message: string) => void; hide: () => void }>(
  (set) => ({
    current: null,
    show: (kind, message) => set({ current: { id: Date.now(), kind, message } }),
    hide: () => set({ current: null }),
  }),
);

export const toast = {
  success: (m: string) => {
    haptic.success();
    useToastStore.getState().show('success', m);
  },
  error: (m: string) => {
    haptic.error();
    useToastStore.getState().show('error', m);
  },
  info: (m: string) => useToastStore.getState().show('info', m),
};

const STYLE: Record<Kind, { icon: typeof Info; color: string }> = {
  success: { icon: CircleCheck, color: colors.success },
  error: { icon: CircleAlert, color: colors.danger },
  info: { icon: Info, color: colors.brand },
};

/** À placer une fois, en haut de l'arbre. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const current = useToastStore((s) => s.current);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(hide, 2600);
    return () => clearTimeout(t);
  }, [current, hide]);

  if (!current) return null;
  const { icon: Icon, color } = STYLE[current.kind];

  return (
    <View pointerEvents="none" className="absolute left-0 right-0 items-center px-5" style={{ top: insets.top + 8 }}>
      <MView
        key={current.id}
        entering={SlideInUp.springify().damping(18).stiffness(220)}
        exiting={FadeOutUp.duration(200)}
        className="w-full flex-row items-center gap-3 rounded-2xl bg-ink px-4 py-3.5"
        style={{ shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 }}
      >
        <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${color}33` }}>
          <Icon size={18} color={color} strokeWidth={2.4} />
        </View>
        <Txt weight="semibold" className="flex-1 text-sm text-white">
          {current.message}
        </Txt>
      </MView>
    </View>
  );
}
