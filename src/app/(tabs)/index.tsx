import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { CalendarDays, CalendarRange, Package, Plus, Receipt, Tags, TrendingDown, TrendingUp, Users, type LucideIcon } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleRow } from '@/components/ArticleCard';
import { ArticleThumb } from '@/components/ArticleThumb';
import { Avatar, Card, EmptyState, SectionTitle } from '@/components/Common';
import { Button } from '@/components/Button';
import { PressableScale } from '@/components/PressableScale';
import { SaleRow } from '@/components/SaleRow';
import { tabBarSpace } from '@/components/TabBar';
import { Txt } from '@/components/Txt';
import { addDays, formatNumber, greeting, startOfMonth, timeAgo } from '@/lib/format';
import { saleTotal, summarize, useToday } from '@/lib/sales';
import { alpha, colors } from '@/lib/theme';
import { useApp, useCategoryMap, useCurrentUser, useIsAdmin } from '@/store/useApp';
import { MView } from '@/components/motion';

export default function DashboardScreen() {
  const isAdmin = useIsAdmin();
  const user = useCurrentUser();
  const shopName = useApp((s) => s.shopName);
  const articles = useApp((s) => s.articles);
  const sales = useApp((s) => s.sales);
  const catMap = useCategoryMap();
  const insets = useSafeAreaInsets();
  const today = useToday();

  const stats = useMemo(() => {
    const yesterdayStart = addDays(today, -1);
    const weekStart = addDays(today, -6);
    const monthStart = startOfMonth(today);

    const todayStats = summarize(sales.filter((s) => s.createdAt >= today));
    const yesterday = summarize(sales.filter((s) => s.createdAt >= yesterdayStart && s.createdAt < today));
    const weekSales = sales.filter((s) => s.createdAt >= weekStart);

    // Les plus vendus sur 7 jours, par quantité
    const byArticle = new Map<string, { articleId: string; name: string; quantity: number; total: number }>();
    for (const s of weekSales) {
      const entry = byArticle.get(s.articleId) ?? { articleId: s.articleId, name: s.articleName, quantity: 0, total: 0 };
      entry.quantity += s.quantity;
      entry.total += saleTotal(s);
      byArticle.set(s.articleId, entry);
    }

    return {
      today: todayStats,
      trend: yesterday.total > 0 ? Math.round(((todayStats.total - yesterday.total) / yesterday.total) * 100) : null,
      week: summarize(weekSales),
      month: summarize(sales.filter((s) => s.createdAt >= monthStart)),
      top: [...byArticle.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
      latest: sales.slice(0, 5),
      recent: [...articles].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    };
  }, [sales, articles, today]);

  if (!isAdmin) return <Redirect href="/magasin" />;

  const average = stats.today.count ? stats.today.total / stats.today.count : 0;
  const empty = articles.length === 0 && sales.length === 0;

  return (
    <ScrollView
      className="flex-1 bg-surface-app"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: tabBarSpace(insets.bottom), paddingHorizontal: 20 }}
    >
      {/* En-tête */}
      <MView entering={FadeInDown.duration(380)} className="mb-5 flex-row items-center">
        <View className="flex-1">
          <Txt weight="medium" className="text-[13px] text-ink-muted">
            {greeting()}, {user?.name.split(' ')[0]}
          </Txt>
          <Txt weight="extrabold" numberOfLines={1} className="text-[26px] leading-[32px] tracking-tight">
            {shopName || 'Ma boutique'}
          </Txt>
        </View>
        <PressableScale scaleTo={0.9} onPress={() => router.navigate('/reglages')} accessibilityLabel="Mon profil">
          <Avatar name={user?.name ?? '?'} size={46} />
        </PressableScale>
      </MView>

      {/* Ventes du jour */}
      <MView entering={FadeInDown.delay(60).duration(420)}>
        <LinearGradient
          colors={[colors.brandDeep, '#2E2B80', colors.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 28, padding: 20, overflow: 'hidden' }}
        >
          <View className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5" />
          <View className="absolute -bottom-16 right-10 h-36 w-36 rounded-full bg-white/5" />

          <View className="flex-row items-center justify-between">
            <Txt weight="semibold" className="text-[13px] text-white/70">
              Ventes du jour
            </Txt>
            {stats.trend !== null ? <TrendPill percent={stats.trend} /> : null}
          </View>
          <Txt weight="extrabold" numberOfLines={1} adjustsFontSizeToFit className="mt-1 text-[40px] leading-[50px] text-white">
            {formatNumber(stats.today.total)}
            <Txt weight="bold" className="text-[18px] text-white/70">
              {' '}FCFA
            </Txt>
          </Txt>

          <View className="mt-4 flex-row rounded-2xl bg-white/10 p-3">
            <HeroStat label="Articles vendus" value={formatNumber(stats.today.items)} />
            <View className="mx-3 w-px bg-white/15" />
            <HeroStat label="Ventes" value={formatNumber(stats.today.count)} />
            <View className="mx-3 w-px bg-white/15" />
            <HeroStat label="Vente moyenne" value={`${formatNumber(average)} F`} />
          </View>
        </LinearGradient>
      </MView>

      {empty ? (
        <Card className="mt-5">
          <EmptyState
            icon={Package}
            title="Votre catalogue est vide"
            message="Ajoutez vos téléphones et accessoires avec leur photo et leur prix. Vous pourrez ensuite enregistrer vos ventes."
            action={<Button label="Ajouter mon premier article" icon={Plus} onPress={() => router.push('/article/form')} />}
          />
        </Card>
      ) : (
        <>
          {/* Totaux de la période */}
          <MView entering={FadeInDown.delay(120).duration(420)} className="mt-4 flex-row gap-3">
            <StatTile icon={CalendarDays} label="7 derniers jours" total={stats.week.total} items={stats.week.items} />
            <StatTile icon={CalendarRange} label="Ce mois" total={stats.month.total} items={stats.month.items} />
          </MView>

          {/* Les plus vendus */}
          {stats.top.length > 0 ? (
            <MView entering={FadeInDown.delay(180).duration(420)}>
              <SectionTitle title="Les plus vendus (7 jours)" />
              <Card className="py-2">
                {stats.top.map((t, i) => {
                  const article = articles.find((a) => a.id === t.articleId);
                  return (
                    <View
                      key={t.articleId}
                      className={`flex-row items-center py-2.5 ${i < stats.top.length - 1 ? 'border-b border-surface-line' : ''}`}
                    >
                      <ArticleThumb
                        uri={article?.photoUri ?? null}
                        category={article?.categoryId ? catMap[article.categoryId] : undefined}
                        className="h-12 w-12"
                        iconSize={20}
                        rounded="rounded-xl"
                      />
                      <View className="ml-3 flex-1">
                        <Txt weight="semibold" numberOfLines={1} className="text-[14px]">
                          {t.name}
                        </Txt>
                        <Txt className="mt-0.5 text-xs text-ink-muted">
                          {formatNumber(t.quantity)} vendu{t.quantity > 1 ? 's' : ''}
                        </Txt>
                      </View>
                      <Txt weight="bold" className="ml-2 text-[14px]">
                        {formatNumber(t.total)} F
                      </Txt>
                    </View>
                  );
                })}
              </Card>
            </MView>
          ) : null}

          {/* Dernières ventes */}
          <MView entering={FadeInDown.delay(240).duration(420)}>
            <SectionTitle
              title="Dernières ventes"
              action={sales.length ? <LinkText label="Tout voir" onPress={() => router.navigate('/ventes')} /> : undefined}
            />
            <Card className="py-2">
              {stats.latest.length ? (
                stats.latest.map((s, i) => (
                  <View key={s.id} className={i < stats.latest.length - 1 ? 'border-b border-surface-line' : ''}>
                    <SaleRow
                      sale={s}
                      when={timeAgo(s.createdAt)}
                      onEdit={() => router.push({ pathname: '/vente/form', params: { id: s.id } })}
                    />
                  </View>
                ))
              ) : (
                <View className="py-2">
                  <Txt className="mb-3 text-[13px] leading-5 text-ink-muted">
                    Aucune vente pour l’instant. Enregistrez votre première vente pour voir vos chiffres ici.
                  </Txt>
                  <Button label="Enregistrer une vente" icon={Plus} size="md" onPress={() => router.push('/vente/form')} />
                </View>
              )}
            </Card>
          </MView>

          {/* Derniers ajouts */}
          {stats.recent.length > 0 ? (
            <MView entering={FadeInDown.delay(300).duration(420)}>
              <SectionTitle title="Derniers ajouts" action={<LinkText label="Tout voir" onPress={() => router.navigate('/magasin')} />} />
              <Card className="py-2">
                {stats.recent.map((a, i) => (
                  <View key={a.id} className={i < stats.recent.length - 1 ? 'border-b border-surface-line' : ''}>
                    <ArticleRow
                      article={a}
                      category={a.categoryId ? catMap[a.categoryId] : undefined}
                      right={
                        <View className="items-end">
                          <Txt weight="bold" className="text-[14px]">
                            {formatNumber(a.price)} F
                          </Txt>
                          <Txt className="text-[11px] text-ink-muted">{timeAgo(a.createdAt)}</Txt>
                        </View>
                      }
                    />
                  </View>
                ))}
              </Card>
            </MView>
          ) : null}
        </>
      )}

      {/* Raccourcis */}
      <MView entering={FadeInDown.delay(360).duration(420)}>
        <SectionTitle title="Raccourcis" />
        <View className="flex-row gap-3">
          <Shortcut icon={Receipt} label="Nouvelle vente" onPress={() => router.push('/vente/form')} />
          <Shortcut icon={Tags} label="Catégories" onPress={() => router.push('/categories')} />
          <Shortcut icon={Users} label="Équipe" onPress={() => router.push('/equipe')} />
        </View>
      </MView>
    </ScrollView>
  );
}

function TrendPill({ percent }: { percent: number }) {
  const up = percent >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const color = up ? '#A7F3D0' : '#FDE68A';
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-white/15 px-2.5 py-1">
      <Icon size={13} color={color} strokeWidth={2.4} />
      <Txt weight="bold" className="text-[11px]" style={{ color }}>
        {up ? '+' : ''}
        {percent} % par rapport à hier
      </Txt>
    </View>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Txt numberOfLines={1} className="text-[11px] text-white/60">
        {label}
      </Txt>
      <Txt weight="bold" numberOfLines={1} adjustsFontSizeToFit className="mt-0.5 text-[15px] text-white">
        {value}
      </Txt>
    </View>
  );
}

function StatTile({ icon: Icon, label, total, items }: { icon: LucideIcon; label: string; total: number; items: number }) {
  return (
    <View className="flex-1 rounded-3xl border border-surface-line bg-surface p-4">
      <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: alpha(colors.brand, 0.12) }}>
        <Icon size={19} color={colors.brand} strokeWidth={2.2} />
      </View>
      <Txt weight="medium" className="mt-3 text-[12px] text-ink-muted">
        {label}
      </Txt>
      <Txt weight="extrabold" numberOfLines={1} adjustsFontSizeToFit className="mt-0.5 text-[20px] leading-[26px]">
        {formatNumber(total)} F
      </Txt>
      <Txt className="mt-0.5 text-[12px] text-ink-muted">
        {formatNumber(items)} article{items > 1 ? 's' : ''} vendu{items > 1 ? 's' : ''}
      </Txt>
    </View>
  );
}

function Shortcut({ icon: Icon, label, onPress }: { icon: LucideIcon; label: string; onPress: () => void }) {
  return (
    <PressableScale haptics onPress={onPress} className="flex-1 items-center rounded-3xl border border-surface-line bg-surface py-4">
      <View className="mb-2 h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
        <Icon size={20} color={colors.brand} strokeWidth={2.2} />
      </View>
      <Txt weight="semibold" className="text-[12px]">
        {label}
      </Txt>
    </PressableScale>
  );
}

function LinkText({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale scaleTo={0.94} onPress={onPress} hitSlop={10}>
      <Txt weight="bold" className="text-[13px] text-brand-600">
        {label}
      </Txt>
    </PressableScale>
  );
}
