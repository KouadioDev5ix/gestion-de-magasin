import { router, useLocalSearchParams } from 'expo-router';
import { ArrowUpDown, Check, PackageSearch, Plus, Search, X } from 'lucide-react-native';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, TextInput, useWindowDimensions, View } from 'react-native';
import { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState, IconButton, TabHeader } from '@/components/Common';
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';
import { PressableScale } from '@/components/PressableScale';
import { Sheet } from '@/components/Sheet';
import { tabBarSpace } from '@/components/TabBar';
import { Txt } from '@/components/Txt';
import { normalize } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors, fonts } from '@/lib/theme';
import { usePagination } from '@/lib/usePagination';
import type { Article, SortKey } from '@/store/types';
import { useApp, useCategoryMap, useIsAdmin } from '@/store/useApp';
import { MView } from '@/components/motion';

const ALL = '__all__';
const NONE = '__none__';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Plus récents' },
  { key: 'name', label: 'Nom (A → Z)' },
  { key: 'price-asc', label: 'Prix croissant' },
  { key: 'price-desc', label: 'Prix décroissant' },
];

export default function MagasinScreen() {
  const insets = useSafeAreaInsets();
  const isAdmin = useIsAdmin();
  const articles = useApp((s) => s.articles);
  const categories = useApp((s) => s.categories);
  const catMap = useCategoryMap();
  const params = useLocalSearchParams<{ categorie?: string }>();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>(params.categorie ?? ALL);
  const [sort, setSort] = useState<SortKey>('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  // Ouverture depuis le tableau de bord ou l'écran Catégories avec un filtre
  const [lastParam, setLastParam] = useState(params.categorie);
  if (params.categorie !== lastParam) {
    setLastParam(params.categorie);
    if (params.categorie) setFilter(params.categorie);
  }

  const counts = useMemo(() => {
    const map: Record<string, number> = { [ALL]: articles.length, [NONE]: 0 };
    for (const a of articles) {
      const key = a.categoryId && catMap[a.categoryId] ? a.categoryId : NONE;
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [articles, catMap]);

  const results = useMemo(() => {
    const q = normalize(deferredQuery);
    const tokens = q.split(/\s+/).filter(Boolean);
    let list = articles.filter((a) => {
      if (filter === NONE && a.categoryId && catMap[a.categoryId]) return false;
      if (filter !== ALL && filter !== NONE && a.categoryId !== filter) return false;
      if (!tokens.length) return true;
      const hay = normalize(`${a.name} ${a.categoryId ? (catMap[a.categoryId]?.name ?? '') : ''} ${a.price}`);
      return tokens.every((t) => hay.includes(t));
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name, 'fr');
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return b.createdAt - a.createdAt;
      }
    });
    return list;
  }, [articles, catMap, deferredQuery, filter, sort]);

  // Le dernier identifiant ramène à la page 1 après un ajout, pour que l'article soit visible
  const { page, pageCount, pageItems, setPage } = usePagination(results, `${deferredQuery}|${filter}|${sort}|${articles[0]?.id ?? ''}`);

  const { width: screenW } = useWindowDimensions();
  const cardW = (screenW - 20 * 2 - 12) / 2;

  const renderItem = useCallback(
    ({ item, index }: { item: Article; index: number }) => (
      <ArticleCard article={item} category={item.categoryId ? catMap[item.categoryId] : undefined} index={index} width={cardW} />
    ),
    [catMap, cardW],
  );

  const chips = [
    { id: ALL, name: 'Tous', color: colors.ink },
    ...categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
    ...(counts[NONE] ? [{ id: NONE, name: 'Sans catégorie', color: colors.muted }] : []),
  ];

  const filtering = filter !== ALL || deferredQuery.trim().length > 0;

  return (
    <View className="flex-1 bg-surface-app">
      <TabHeader
        title="Magasin"
        subtitle={`${articles.length} article${articles.length > 1 ? 's' : ''} au catalogue`}
        right={isAdmin ? <IconButton icon={Plus} tone="brand" label="Ajouter un article" onPress={() => router.push('/article/form')} /> : undefined}
      />

      {/* Recherche + tri */}
      <View className="flex-row items-center gap-2.5 px-5">
        <View className="h-12 flex-1 flex-row items-center rounded-2xl border border-surface-line bg-surface px-3.5">
          <Search size={18} color={colors.faint} strokeWidth={2.2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un article, un prix…"
            placeholderTextColor={colors.faint}
            selectionColor={colors.brand}
            cursorColor={colors.brand}
            returnKeyType="search"
            autoCorrect={false}
            allowFontScaling={false}
            className="ml-2.5 h-full flex-1 text-ink"
            style={{ fontFamily: fonts.medium, fontSize: 14.5, paddingVertical: 0 }}
          />
          {query ? (
            <MView entering={FadeIn.duration(150)}>
              <Pressable hitSlop={10} onPress={() => setQuery('')} accessibilityLabel="Effacer la recherche">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-surface-sunken">
                  <X size={13} color={colors.muted} strokeWidth={2.6} />
                </View>
              </Pressable>
            </MView>
          ) : null}
        </View>
        <IconButton icon={ArrowUpDown} label="Trier" onPress={() => setSortOpen(true)} />
      </View>

      {/* Filtres par catégorie */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 8 }}
        >
          {chips.map((chip, i) => {
            const active = chip.id === filter;
            const count = counts[chip.id] ?? 0;
            return (
              <MView key={chip.id} entering={FadeInRight.delay(i * 30).duration(300)}>
                <PressableScale
                  scaleTo={0.94}
                  onPress={() => {
                    haptic.tap();
                    setFilter(chip.id);
                  }}
                  className={`h-9 flex-row items-center rounded-full border px-3.5 ${
                    active ? 'border-ink bg-ink' : 'border-surface-line bg-surface'
                  }`}
                >
                  {chip.id !== ALL ? <View className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: chip.color }} /> : null}
                  <Txt weight="semibold" className={`text-[13px] ${active ? 'text-white' : 'text-ink-soft'}`}>
                    {chip.name}
                  </Txt>
                  <Txt weight="bold" className={`ml-1.5 text-[12px] ${active ? 'text-white/60' : 'text-ink-faint'}`}>
                    {count}
                  </Txt>
                </PressableScale>
              </MView>
            );
          })}
        </ScrollView>
      </View>

      {/* La clé remonte la liste à chaque page : on repart toujours du haut */}
      <FlatList
        key={page}
        data={pageItems}
        ListFooterComponent={<Pagination page={page} pageCount={pageCount} totalItems={results.length} onChange={setPage} />}
        keyExtractor={(a) => a.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: tabBarSpace(insets.bottom), gap: 12, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        ListHeaderComponent={
          filtering && results.length > 0 ? (
            <Txt weight="medium" className="-mb-1 px-1 text-[12px] text-ink-muted">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </Txt>
          ) : undefined
        }
        ListEmptyComponent={
          articles.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="Aucun article pour l’instant"
              message={
                isAdmin
                  ? 'Ajoutez vos articles avec leur photo et leur prix pour constituer votre catalogue.'
                  : 'Le gérant n’a pas encore ajouté d’articles au catalogue.'
              }
              action={isAdmin ? <Button label="Ajouter un article" icon={Plus} onPress={() => router.push('/article/form')} /> : undefined}
            />
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="Aucun résultat"
              message="Essayez un autre mot-clé ou une autre catégorie."
              action={
                <Button
                  label="Réinitialiser les filtres"
                  variant="ghost"
                  onPress={() => {
                    setQuery('');
                    setFilter(ALL);
                  }}
                />
              }
            />
          )
        }
      />

      <Sheet visible={sortOpen} onClose={() => setSortOpen(false)} title="Trier les articles">
        {SORTS.map((s) => {
          const active = s.key === sort;
          return (
            <PressableScale
              key={s.key}
              scaleTo={0.98}
              onPress={() => {
                haptic.tap();
                setSort(s.key);
                setSortOpen(false);
              }}
              className={`mb-1.5 h-14 flex-row items-center rounded-2xl px-4 ${active ? 'bg-brand-50' : ''}`}
            >
              <Txt weight={active ? 'bold' : 'medium'} className={`flex-1 text-[15px] ${active ? 'text-brand-700' : ''}`}>
                {s.label}
              </Txt>
              {active ? <Check size={20} color={colors.brand} strokeWidth={2.6} /> : null}
            </PressableScale>
          );
        })}
      </Sheet>
    </View>
  );
}
