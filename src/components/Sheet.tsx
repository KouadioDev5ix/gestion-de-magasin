import { useEffect, useState, type ReactNode } from 'react';
import { Dimensions, KeyboardAvoidingView, Modal, Pressable, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { springs } from '@/lib/theme';
import { Txt } from './Txt';
import { MView } from './motion';

const SCREEN_H = Dimensions.get('window').height;

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

/**
 * Feuille modale qui glisse depuis le bas.
 * Reste montée pendant l'animation de sortie, et se ferme aussi d'un glissement vers le bas.
 */
export function Sheet({ visible, onClose, title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const translateY = useSharedValue(SCREEN_H);

  // Montage immédiat à l'ouverture (ajustement pendant le rendu, sans effet en cascade)
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      translateY.set(SCREEN_H);
      translateY.set(withSpring(0, springs.gentle));
    } else {
      translateY.set(
        withTiming(SCREEN_H, { duration: 220, easing: Easing.in(Easing.cubic) }, (done) => {
          if (done) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [visible, translateY]);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      translateY.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        scheduleOnRN(onClose);
      } else {
        translateY.set(withSpring(0, springs.snappy));
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.get(), [0, SCREEN_H * 0.6], [1, 0], 'clamp'),
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MView style={backdropStyle} className="absolute inset-0 bg-[#0B1220]/50">
          <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Fermer" />
        </MView>

        <KeyboardAvoidingView behavior="padding" className="flex-1 justify-end">
          <MView
            style={[sheetStyle, { paddingBottom: Math.max(insets.bottom, 16) + 8, maxHeight: SCREEN_H * 0.9 }]}
            className="rounded-t-4xl bg-surface px-5"
          >
            <GestureDetector gesture={pan}>
              <View className="items-center pb-2 pt-3">
                <View className="h-1.5 w-11 rounded-full bg-surface-line" />
                {title ? (
                  <View className="mt-4 w-full">
                    <Txt weight="extrabold" className="text-xl">
                      {title}
                    </Txt>
                    {subtitle ? <Txt className="mt-1 text-sm text-ink-muted">{subtitle}</Txt> : null}
                  </View>
                ) : null}
              </View>
            </GestureDetector>
            <View className="pt-3">{children}</View>
          </MView>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
