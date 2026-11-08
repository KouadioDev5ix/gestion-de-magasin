import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { LayoutDashboard, Plus, Receipt, Settings, Store, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { colors, springs } from '@/lib/theme';
import { PressableScale } from './PressableScale';
import { MView } from './motion';

export const TAB_BAR_HEIGHT = 66;
/** Espace à réserver en bas des écrans d'onglets */
export const tabBarSpace = (bottomInset: number) => TAB_BAR_HEIGHT + Math.max(bottomInset, 12) + 24;

const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'Accueil', icon: LayoutDashboard },
  magasin: { label: 'Magasin', icon: Store },
  ventes: { label: 'Ventes', icon: Receipt },
  reglages: { label: 'Réglages', icon: Settings },
};

type Props = BottomTabBarProps & { visibleRoutes: string[]; showAdd: boolean };

export function TabBar({ state, emitter, navigateToTab, insets, visibleRoutes, showAdd }: Props) {
  const routes = state.routes.filter((r) => visibleRoutes.includes(r.name));
  const focusedKey = state.routes[state.index]?.key;

  const items = routes.map((route) => {
    const focused = route.key === focusedKey;
    const meta = TABS[route.name];
    return (
      <TabItem
        key={route.key}
        label={meta?.label ?? route.name}
        icon={meta?.icon ?? Store}
        focused={focused}
        onPress={() => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            haptic.tap();
            navigateToTab(route.key);
          }
        }}
      />
    );
  });

  // Bouton "+" au centre pour le gérant
  if (showAdd) {
    items.splice(Math.ceil(items.length / 2), 0, <AddButton key="add" />);
  }

  return (
    <View pointerEvents="box-none" className="absolute bottom-0 left-0 right-0 px-4" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      <View
        className="flex-row items-center rounded-[26px] border border-surface-line bg-surface px-2"
        style={{
          height: TAB_BAR_HEIGHT,
          shadowColor: '#1C1A4B',
          shadowOpacity: 0.1,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
          elevation: 14,
        }}
      >
        {items}
      </View>
    </View>
  );
}

function TabItem({ label, icon: Icon, focused, onPress }: { label: string; icon: LucideIcon; focused: boolean; onPress: () => void }) {
  const p = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    p.value = withSpring(focused ? 1 : 0, springs.gentle);
  }, [focused, p]);

  const pill = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ scaleX: interpolate(p.value, [0, 1], [0.4, 1]) }, { scaleY: interpolate(p.value, [0, 1], [0.7, 1]) }],
  }));
  const iconWrap = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(p.value, [0, 1], [0, -1]) }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(p.value, [0, 1], [colors.faint, colors.brandDark]),
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      className="h-full flex-1 items-center justify-center"
    >
      <View className="items-center justify-center">
        <MView style={pill} className="absolute h-8 w-14 rounded-full bg-brand-50" />
        <MView style={iconWrap} className="h-8 w-14 items-center justify-center">
          <Icon size={21} color={focused ? colors.brand : colors.faint} strokeWidth={focused ? 2.4 : 2} />
        </MView>
      </View>
      <Animated.Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[labelStyle, { fontFamily: focused ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_600SemiBold', fontSize: 10.5, marginTop: 2 }]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

function AddButton() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withTiming(1, { duration: 600 });
  }, [pulse]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: interpolate(pulse.value, [0, 1], [0.6, 1]) }], opacity: pulse.value }));

  return (
    <View className="flex-1 items-center justify-center">
      <MView style={style}>
        <PressableScale
          haptics
          scaleTo={0.9}
          onPress={() => router.push('/article/form')}
          accessibilityLabel="Ajouter un article"
          style={{
            marginTop: -26,
            shadowColor: colors.brand,
            shadowOpacity: 0.4,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
            borderRadius: 22,
          }}
        >
          <LinearGradient
            colors={['#6461F0', '#4237C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 58, height: 58, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.white }}
          >
            <Plus size={26} color={colors.white} strokeWidth={2.6} />
          </LinearGradient>
        </PressableScale>
      </MView>
    </View>
  );
}
