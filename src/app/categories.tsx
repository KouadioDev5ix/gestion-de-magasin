import { Redirect, router } from 'expo-router';
import { ChevronRight, Pencil, Plus, Tags } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CategoryEditor } from '@/components/CategoryEditor';
import { CategoryIcon } from '@/components/CategoryBadge';
import { EmptyState, IconButton, StackHeader } from '@/components/Common';
import { PressableScale } from '@/components/PressableScale';
import { Txt } from '@/components/Txt';
import { formatNumber } from '@/lib/format';
import { colors } from '@/lib/theme';
import type { Category } from '@/store/types';
import { useApp, useIsAdmin } from '@/store/useApp';
import { MView } from '@/components/motion';

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const isAdmin = useIsAdmin();
  const categories = useApp((s) => s.categories);
  const articles = useApp((s) => s.articles);

  const [editing, setEditing] = useState<Category | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const stats = useMemo(() => {
    const map: Record<string, { count: number; min: number; max: number }> = {};
    for (const a of articles) {
      if (!a.categoryId) continue;
      const s = (map[a.categoryId] ??= { count: 0, min: Infinity, max: 0 });
      s.count += 1;
      s.min = Math.min(s.min, a.price);
      s.max = Math.max(s.max, a.price);
    }
    return map;
  }, [articles]);

  if (!isAdmin) return <Redirect href="/magasin" />;

  const openEditor = (category: Category | null) => {
    setEditing(category);
    setEditorOpen(true);
  };

  return (
    <View className="flex-1 bg-surface-app">
      <StackHeader title="Catégories" right={<IconButton icon={Plus} tone="brand" label="Nouvelle catégorie" onPress={() => openEditor(null)} />} />

      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32, gap: 10, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const s = stats[item.id];
          const range = s
            ? s.min === s.max
              ? `${formatNumber(s.min)} F`
              : `${formatNumber(s.min)} – ${formatNumber(s.max)} F`
            : 'Aucun article';
          return (
            <MView entering={FadeInDown.delay(Math.min(index, 10) * 40).duration(320)} layout={LinearTransition.springify().damping(20)}>
              <PressableScale
                scaleTo={0.98}
                onPress={() => router.dismissTo({ pathname: '/magasin', params: { categorie: item.id } })}
                className="flex-row items-center rounded-3xl border border-surface-line bg-surface p-3.5"
              >
                <CategoryIcon category={item} size={50} />
                <View className="ml-3.5 flex-1">
                  <Txt weight="bold" numberOfLines={1} className="text-[15px]">
                    {item.name}
                  </Txt>
                  <Txt className="mt-0.5 text-[12.5px] text-ink-muted">
                    {s ? `${s.count} article${s.count > 1 ? 's' : ''} · ${range}` : range}
                  </Txt>
                </View>
                <PressableScale
                  haptics
                  scaleTo={0.85}
                  hitSlop={8}
                  onPress={() => openEditor(item)}
                  accessibilityLabel={`Modifier ${item.name}`}
                  className="mr-1 h-9 w-9 items-center justify-center rounded-xl bg-surface-sunken"
                >
                  <Pencil size={16} color={colors.inkSoft} strokeWidth={2.2} />
                </PressableScale>
                <ChevronRight size={18} color={colors.faint} />
              </PressableScale>
            </MView>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon={Tags}
            title="Aucune catégorie"
            message="Créez vos rayons : téléphones, coques, chargeurs…"
            action={<Button label="Créer une catégorie" icon={Plus} onPress={() => openEditor(null)} />}
          />
        }
      />

      <CategoryEditor visible={editorOpen} category={editing} onClose={() => setEditorOpen(false)} />
    </View>
  );
}
