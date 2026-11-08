import { forwardRef, type ComponentRef } from 'react';
import { Pressable, Text, View, type PressableProps, type TextProps, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

/*
 * Composants animés compatibles NativeWind.
 *
 * On anime des composants qui rendent eux-mêmes une vue React Native "classique" :
 * Reanimated traite d'abord les styles animés, puis NativeWind applique `className`
 * sur la vue native. (Envelopper Animated.View avec cssInterop faisait perdre les classes.)
 */

const TwView = forwardRef<ComponentRef<typeof View>, ViewProps>(function TwView(props, ref) {
  return <View ref={ref} {...props} />;
});

const TwText = forwardRef<ComponentRef<typeof Text>, TextProps>(function TwText(props, ref) {
  return <Text ref={ref} {...props} />;
});

const TwPressable = forwardRef<ComponentRef<typeof View>, PressableProps>(function TwPressable(props, ref) {
  return <Pressable ref={ref} {...props} />;
});

export const MView = Animated.createAnimatedComponent(TwView);
export const MText = Animated.createAnimatedComponent(TwText);
export const MPressable = Animated.createAnimatedComponent(TwPressable);
