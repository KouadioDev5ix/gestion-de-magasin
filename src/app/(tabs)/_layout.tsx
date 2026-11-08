import { Tabs } from 'expo-router';

import { TabBar } from '@/components/TabBar';
import { colors } from '@/lib/theme';
import { useIsAdmin } from '@/store/useApp';

const ADMIN_TABS = ['index', 'magasin', 'ventes', 'reglages'];
const SELLER_TABS = ['magasin', 'ventes', 'reglages'];

export default function TabsLayout() {
  const isAdmin = useIsAdmin();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        sceneStyle: { backgroundColor: colors.app },
      }}
      tabBar={(props) => <TabBar {...props} visibleRoutes={isAdmin ? ADMIN_TABS : SELLER_TABS} showAdd={isAdmin} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="magasin" />
      <Tabs.Screen name="ventes" />
      <Tabs.Screen name="reglages" />
    </Tabs>
  );
}
