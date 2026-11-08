import { router } from 'expo-router';
import { Plus, Receipt, Search, X } from 'lucide-react-native';
import { useDeferredValue, useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, TextInput, View } from 'react-native';
import { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState, TabHeader } from '@/components/Common';
import { Pagination } from '@/components/Pagination';
import { PressableScale } from '@/components/PressableScale';
import { SaleRow } from '@/components/SaleRow';
import { tabBarSpace } from '@/components/TabBar';
import { Txt } from '@/components/Txt';
import { MView } from '@/components/motion';
import { addDays, dayLabel, formatNumber, formatPrice, formatTime, normalize, startOfDay, startOfMonth } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { saleTotal, summarize, useToday } from '@/lib/sales';
import { colors, fonts } from '@/lib/theme';
import { usePagination } from '@/lib/usePagination';
import type { Sale } from '@/store/types';
import { useApp, useCurrentUser } from '@/store/useApp';

type Period = 'all' | 'today' | 'week' | 'month';

const PERIODS: { key: Period; label: string; summary: string }[] = [
  { key: 'all', label: 'Tout', summary: 'Total des ventes' },
  { key: 'today', label: 'Aujourd’hui', summary: 'Total du jour' },
  { key: 'week', label: '7 jours', summary: 'Total des 7 derniers jours' },
  { key: 'month', label: 'Ce mois', summary: 'Total du mois' },
];

export default function VentesScreen() {
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const isAdmin = user?.role === 'admin';
  const allSales = useApp((s) => s.sales);
  const today = useToday();

  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<Period>('all');
  const deferredQuery = useDeferredValue(query);

  // Le gérant voit tout le cahier, un vendeur uniquement ses propres ventes
  const visible = useMemo(() => (isAdmin ? allSales : allSales.filter((s) => s.sellerId === user?.id)), [allSales, isAdmin, user?.id]);

  const results = useMemo(() => {
    const since = { all: 0, today, week: addDays(today, -6), month: startOfMonth(today) }[period];
    const tokens = normalize(deferredQuery).split(/\s+/).filter(Boolean);
    return visible.filter((s) => {
      if (s.createdAt < since) return false;
      const hay = normalize(`${s.articleName} ${s.sellerName}`);
      return tokens.every((t) => hay.includes(t));
    });
  }, [visible, period, today, deferredQuery]);

  const summary = useMemo(() => summarize(results), [results]);

  // Le dernier identifiant ramène à la page 1 après une nouvelle vente, pour qu'elle soit visible
  const { page, pageCount, pageItems, setPage } = usePagination(results, `${deferredQuery}|${period}|${visible[0]?.id ?? ''}`);

  // Comme les pages du cahier : une section par jour, la plus récente en premier.
  // Le total du jour porte sur toutes ses ventes, même si elles s'étalent sur plusieurs pages.
  const sections = useMemo(() => {
    const dayTotals = new Map<number, number>();
    for (const s of results) {
      const day = startOfDay(s.createdAt);
      dayTotals.set(day, (dayTotals.get(day) ?? 0) + saleTotal(s));
    }
    const days = new Map<number, Sale[]>();
    for (const s of pageItems) {
      const day = startOfDay(s.createdAt);
      const list = days.get(day);
      if (list) list.push(s);
      else days.set(day, [s]);
    }
    return [...days.entries()].map(([day, data]) => ({ day, data, total: dayTotals.get(day) ?? 0 }));
  }, [results, pageItems]);

  const newSale = () => router.push('/vente/form');
  const periodInfo = PERIODS.find((p) => p.key === period) ?? PERIODS[0];

  return (
    <View className="flex-1 bg-surface-app">
      <TabHeader title="Ventes" subtitle={isAdmin ? 'Le cahier de la boutique' : 'Mes ventes'} />

      <View className="px-5">
        <View className="h-12 flex-row items-center rounded-2xl border border-surface-line bg-surface px-3.5">
          <Search size={18} color={colors.faint} strokeWidth={2.2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={isAdmin ? 'Rechercher un article, un vendeur…' : 'Rechercher un article…'}
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
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 8 }}>
          {PERIODS.map((p) => {
            const active = p.key === period;
            return (
              <PressableScale
                key={p.key}
                scaleTo={0.94}
                onPress={() => {
                  haptic.tap();
                  setPeriod(p.key);
                }}
                className={`h-9 flex-row items-center rounded-full border px-3.5 ${active ? 'border-ink bg-ink' : 'border-surface-line bg-surface'}`}
              >
                <Txt weight="semibold" className={`text-[13px] ${active ? 'text-white' : 'text-ink-soft'}`}>
                  {p.label}
                </Txt>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      {/* La clé remonte la liste à chaque page : on repart toujours du haut */}
      <SectionList
        key={page}
        sections={sections}
        ListFooterComponent={<Pagination page={page} pageCount={pageCount} totalItems={results.length} onChange={setPage} />}
        keyExtractor={(s) => s.id}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        windowSize={9}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: tabBarSpace(insets.bottom) + 68, flexGrow: 1 }}
        ListHeaderComponent={
          results.length > 0 ? (
            <View className="rounded-3xl p-4" style={{ backgroundColor: colors.brandDeep }}>
              <Txt weight="semibold" className="text-[12.5px] text-white/70">
                {periodInfo.summary}
              </Txt>
              <Txt weight="extrabold" numberOfLines={1} adjustsFontSizeToFit className="mt-0.5 text-[28px] leading-[34px] text-white">
                {formatPrice(summary.total)}
              </Txt>
              <Txt className="mt-1 text-[12.5px] text-white/70">
                {summary.count} vente{summary.count > 1 ? 's' : ''} · {formatNumber(summary.items)} article{summary.items > 1 ? 's' : ''} vendu{summary.items > 1 ? 's' : ''}
              </Txt>
            </View>
          ) : undefined
        }
        renderSectionHeader={({ section }) => (
          <View className="mb-1 mt-5 flex-row items-center justify-between px-1">
            <Txt weight="bold" className="text-[14px]">
              {dayLabel(section.day, today)}
            </Txt>
            <Txt weight="bold" className="text-[13px] text-ink-muted">
              {formatNumber(section.total)} F
            </Txt>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View className={index < section.data.length - 1 ? 'border-b border-surface-line' : ''}>
            <SaleRow
              sale={item}
              when={formatTime(item.createdAt)}
              showSeller={isAdmin}
              onEdit={isAdmin ? () => router.push({ pathname: '/vente/form', params: { id: item.id } }) : undefined}
            />
          </View>
        )}
        ListEmptyComponent={
          visible.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Aucune vente enregistrée"
              message="Notez chaque vente ici à la place du cahier : l’article, la quantité et le prix."
              action={<Button label="Enregistrer une vente" icon={Plus} onPress={newSale} />}
            />
          ) : (
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              message="Essayez un autre mot-clé ou une autre période."
              action={
                <Button
                  label="Réinitialiser les filtres"
                  variant="ghost"
                  onPress={() => {
                    setQuery('');
                    setPeriod('all');
                  }}
                />
              }
            />
          )
        }
      />

      {visible.length > 0 ? (
        <PressableScale
          haptics
          scaleTo={0.94}
          onPress={newSale}
          accessibilityRole="button"
          accessibilityLabel="Nouvelle vente"
          style={{
            position: 'absolute',
            right: 20,
            bottom: tabBarSpace(insets.bottom) - 12,
            height: 52,
            paddingHorizontal: 18,
            borderRadius: 18,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.brand,
            shadowColor: colors.brand,
            shadowOpacity: 0.32,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <Plus size={20} color={colors.white} strokeWidth={2.4} />
          <Txt weight="bold" style={{ fontSize: 15, color: colors.white }}>
            Nouvelle vente
          </Txt>
        </PressableScale>
      ) : null}
    </View>
  );
}
