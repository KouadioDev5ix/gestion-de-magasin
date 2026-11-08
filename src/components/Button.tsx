import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, View, type ViewStyle } from 'react-native';

import { colors, fonts } from '@/lib/theme';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerSoft';
type Size = 'md' | 'lg';

/** Couleurs explicites : le bouton s'affiche correctement sans dépendre des classes. */
const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.brand, fg: colors.white },
  secondary: { bg: colors.white, fg: colors.ink, border: colors.line },
  ghost: { bg: colors.brandSoft, fg: colors.brandDark },
  danger: { bg: colors.danger, fg: colors.white },
  dangerSoft: { bg: '#FEF2F2', fg: colors.danger },
};

const PRIMARY_SHADOW: ViewStyle = {
  shadowColor: colors.brand,
  shadowOpacity: 0.28,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  /** Marges / positionnement uniquement (ex. "mt-5") */
  className?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  loading,
  disabled,
  className = '',
}: Props) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;
  const lg = size === 'lg';

  return (
    <View className={className}>
      <PressableScale
        haptics
        onPress={onPress}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!inactive, busy: !!loading }}
        style={[
          {
            height: lg ? 56 : 44,
            borderRadius: 16,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: v.bg,
            borderWidth: v.border ? 1 : 0,
            borderColor: v.border,
            opacity: disabled ? 0.45 : 1,
          },
          variant === 'primary' && !disabled ? PRIMARY_SHADOW : null,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.fg} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {Icon ? <Icon size={lg ? 20 : 18} color={v.fg} strokeWidth={2.2} /> : null}
            <Txt style={{ color: v.fg, fontFamily: fonts.bold, fontSize: lg ? 16 : 14 }}>{label}</Txt>
          </View>
        )}
      </PressableScale>
    </View>
  );
}
