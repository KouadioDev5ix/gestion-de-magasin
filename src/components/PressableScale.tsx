import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { springs } from '@/lib/theme';
import { MPressable as AnimatedPressable } from './motion';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Échelle au moment de l'appui (1 = aucun effet) */
  scaleTo?: number;
  haptics?: boolean;
};

/** Zone pressable qui se contracte légèrement au toucher, animée sur le thread UI. */
export function PressableScale({
  children,
  className,
  style,
  scaleTo = 0.97,
  haptics = false,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      className={className}
      style={[style, animated]}
      onPressIn={(e) => {
        scale.set(withSpring(scaleTo, springs.snappy));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, springs.snappy));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptics) haptic.tap();
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
