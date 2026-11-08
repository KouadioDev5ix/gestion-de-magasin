import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initials } from '@/lib/format';
import { colors } from '@/lib/theme';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';
import { MView } from './motion';

export function Avatar({ name, size = 44, dark }: { name: string; size?: number; dark?: boolean }) {
  return (
    <View
      className={`items-center justify-center rounded-full ${dark ? 'bg-white/15' : 'bg-brand-100'}`}
      style={{ width: size, height: size }}
    >
      <Txt weight="bold" className={dark ? 'text-white' : 'text-brand-700'} style={{ fontSize: size * 0.36 }}>
        {initials(name)}
      </Txt>
    </View>
  );
}

/** En-tête des écrans d'onglets : grand titre + action à droite */
export function TabHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <MView entering={FadeIn.duration(300)} className="flex-row items-end justify-between px-5 pb-4" style={{ paddingTop: insets.top + 14 }}>
      <View className="flex-1">
        {subtitle ? <Txt weight="medium" className="text-[13px] text-ink-muted">{subtitle}</Txt> : null}
        <Txt weight="extrabold" className="text-[28px] leading-[34px] tracking-tight">
          {title}
        </Txt>
      </View>
      {right}
    </MView>
  );
}

/** En-tête des écrans empilés : bouton retour + titre centré */
export function StackHeader({ title, right, onBack }: { title: string; right?: ReactNode; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-row items-center justify-between px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
      <IconButton icon={ArrowLeft} label="Retour" onPress={onBack ?? (() => router.back())} />
      <Txt weight="bold" numberOfLines={1} className="mx-3 flex-1 text-center text-[17px]">
        {title}
      </Txt>
      <View className="min-w-[44px] items-end">{right}</View>
    </View>
  );
}

export function IconButton({
  icon: Icon,
  onPress,
  label,
  tone = 'default',
}: {
  icon: LucideIcon;
  onPress: () => void;
  label: string;
  tone?: 'default' | 'brand' | 'danger' | 'glass';
}) {
  const box = {
    default: 'bg-surface border border-surface-line',
    brand: 'bg-brand-600',
    danger: 'bg-red-50',
    glass: 'bg-black/30',
  }[tone];
  const color = { default: colors.ink, brand: colors.white, danger: colors.danger, glass: colors.white }[tone];
  return (
    <PressableScale haptics onPress={onPress} scaleTo={0.9} accessibilityLabel={label} className={`h-11 w-11 items-center justify-center rounded-2xl ${box}`}>
      <Icon size={20} color={color} strokeWidth={2.1} />
    </PressableScale>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <MView entering={FadeInDown.duration(350)} className="items-center px-8 py-14">
      <View className="mb-5 h-20 w-20 items-center justify-center rounded-[28px] bg-brand-50">
        <Icon size={34} color={colors.brand} strokeWidth={1.7} />
      </View>
      <Txt weight="bold" className="text-center text-lg">
        {title}
      </Txt>
      <Txt className="mt-2 text-center text-sm leading-5 text-ink-muted">{message}</Txt>
      {action ? <View className="mt-6 w-full">{action}</View> : null}
    </MView>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-3xl border border-surface-line bg-surface p-4 ${className}`}>{children}</View>;
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View className="mb-3 mt-7 flex-row items-center justify-between px-1">
      <Txt weight="bold" className="text-[16px]">
        {title}
      </Txt>
      {action}
    </View>
  );
}

export function ListRow({
  icon: Icon,
  label,
  value,
  onPress,
  tone = 'default',
  last,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  tone?: 'default' | 'danger';
  last?: boolean;
}) {
  const color = tone === 'danger' ? colors.danger : colors.inkSoft;
  return (
    <PressableScale onPress={onPress} scaleTo={0.985} disabled={!onPress} className="flex-row items-center px-4">
      <View className={`h-9 w-9 items-center justify-center rounded-xl ${tone === 'danger' ? 'bg-red-50' : 'bg-surface-sunken'}`}>
        <Icon size={18} color={color} strokeWidth={2} />
      </View>
      <View className={`ml-3 flex-1 flex-row items-center py-4 ${last ? '' : 'border-b border-surface-line'}`}>
        <Txt weight="semibold" className={`flex-1 text-[15px] ${tone === 'danger' ? 'text-danger' : ''}`}>
          {label}
        </Txt>
        {value ? (
          <Txt numberOfLines={1} className="mr-1 max-w-[50%] text-sm text-ink-muted">
            {value}
          </Txt>
        ) : null}
        {onPress && tone !== 'danger' ? <ChevronRight size={18} color={colors.faint} /> : null}
      </View>
    </PressableScale>
  );
}
