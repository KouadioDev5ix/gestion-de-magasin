import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { forwardRef, useState, type ReactNode } from 'react';
import { Pressable, TextInput, View, type TextInputProps, type TextInputInstance } from 'react-native';
import {
  FadeInDown,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts } from '@/lib/theme';
import { Txt } from './Txt';
import { MView } from './motion';

type Props = Omit<TextInputProps, 'style'> & {
  label?: string;
  icon?: LucideIcon;
  error?: string | null;
  hint?: string;
  /** Élément affiché à droite (ex. "FCFA") */
  suffix?: ReactNode;
  password?: boolean;
  large?: boolean;
  className?: string;
};

export const Input = forwardRef<TextInputInstance, Props>(function Input(
  { label, icon: Icon, error, hint, suffix, password, large, className = '', onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const progress = useDerivedValue(() => withTiming(focused ? 1 : 0, { duration: 180 }), [focused]);
  const frame = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.danger
      : interpolateColor(progress.value, [0, 1], [colors.line, colors.brand]),
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#FAFBFC', colors.white]),
  }));

  const iconColor = error ? colors.danger : focused ? colors.brand : colors.faint;

  return (
    <View className={className}>
      {label ? (
        <Txt weight="semibold" className="mb-2 text-[13px] text-ink-soft">
          {label}
        </Txt>
      ) : null}

      <MView
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            height: large ? 64 : 56,
            borderRadius: 16,
            borderWidth: 1.5,
            paddingHorizontal: 16,
          },
          frame,
        ]}
      >
        {Icon ? (
          <View style={{ width: 20, height: 20, marginRight: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={19} color={iconColor} strokeWidth={2} />
          </View>
        ) : null}
        <TextInput
          ref={ref}
          {...rest}
          allowFontScaling={false}
          secureTextEntry={password ? hidden : rest.secureTextEntry}
          placeholderTextColor={colors.faint}
          selectionColor={colors.brand}
          cursorColor={colors.brand}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            height: '100%',
            color: colors.ink,
            fontFamily: large ? fonts.bold : fonts.medium,
            fontSize: large ? 20 : 15,
            paddingVertical: 0,
            paddingHorizontal: 0,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
        />
        {password ? (
          <Pressable
            hitSlop={12}
            onPress={() => setHidden((h) => !h)}
            accessibilityLabel={hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'}
          >
            {hidden ? <Eye size={19} color={colors.faint} /> : <EyeOff size={19} color={colors.faint} />}
          </Pressable>
        ) : null}
        {suffix}
      </MView>

      {error ? (
        <MView entering={FadeInDown.duration(180)} exiting={FadeOut.duration(120)}>
          <Txt weight="medium" className="ml-1 mt-1.5 text-xs text-danger">
            {error}
          </Txt>
        </MView>
      ) : hint ? (
        <Txt className="ml-1 mt-1.5 text-xs text-ink-muted">{hint}</Txt>
      ) : null}
    </View>
  );
});
