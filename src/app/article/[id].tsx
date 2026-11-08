import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Eye, PackageX, Pencil, Trash2 } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Alert, Dimensions, View } from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CategoryBadge, CategoryGlyph } from '@/components/CategoryBadge';
import { EmptyState, IconButton } from '@/components/Common';
import { toast } from '@/components/Toast';
import { Txt } from '@/components/Txt';
import { formatDate, formatNumber } from '@/lib/format';
import { alpha, colors } from '@/lib/theme';
import { useApp, useIsAdmin } from '@/store/useApp';
import { MView } from '@/components/motion';

const { width: W } = Dimensions.get('window');
const HERO_H = W;

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isAdmin = useIsAdmin();
  const article = useApp((s) => s.articles.find((a) => a.id === id));
  const category = useApp((s) => s.categories.find((c) => c.id === article?.categoryId));
  const recordView = useApp((s) => s.recordView);
  const removeArticle = useApp((s) => s.removeArticle);
  const counted = useRef(false);

  // On compte les consultations des vendeurs (une fois par ouverture)
  useEffect(() => {
    if (!counted.current && article && !isAdmin) {
      counted.current = true;
      recordView(article.id);
    }
  }, [article, isAdmin, recordView]);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [-HERO_H, 0, HERO_H], [-HERO_H / 2, 0, HERO_H * 0.5]) },
      { scale: interpolate(scrollY.value, [-HERO_H, 0], [2, 1], 'clamp') },
    ],
  }));
  const topBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_H * 0.55, HERO_H * 0.8], [0, 1], 'clamp'),
  }));

  if (!article) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-app px-6">
        <EmptyState
          icon={PackageX}
          title="Article introuvable"
          message="Il a peut-être été supprimé."
          action={<Button label="Retour" variant="ghost" onPress={() => router.back()} />}
        />
      </View>
    );
  }

  const tint = category?.color ?? colors.muted;

  const confirmDelete = () =>
    Alert.alert('Supprimer cet article ?', `« ${article.name} » sera retiré du catalogue.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          router.back();
          // Laisse l'écran se fermer avant de retirer les données
          setTimeout(() => {
            removeArticle(article.id);
            toast.success('Article supprimé');
          }, 300);
        },
      },
    ]);

  return (
    <View className="flex-1 bg-surface">
      {/* Visuel avec effet parallaxe */}
      <MView style={[heroStyle, { height: HERO_H }]} className="absolute left-0 right-0 top-0">
        {article.photoUri ? (
          <Image source={{ uri: article.photoUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={250} />
        ) : (
          <View className="h-full w-full items-center justify-center" style={{ backgroundColor: alpha(tint, 0.1) }}>
            <CategoryGlyph icon={category?.icon} size={96} color={tint} strokeWidth={1.2} />
          </View>
        )}
      </MView>

      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: HERO_H - 32 }}>
        <MView
          entering={FadeInDown.duration(420).springify().damping(20)}
          className="min-h-full rounded-t-4xl bg-surface px-6 pt-7"
          style={{ paddingBottom: insets.bottom + (isAdmin ? 120 : 40) }}
        >
          <CategoryBadge category={category} size="md" />
          <Txt weight="extrabold" className="mt-3 text-[26px] leading-[33px] tracking-tight">
            {article.name}
          </Txt>

          {/* Prix : l'information que le vendeur vient chercher */}
          <View className="mt-5 rounded-3xl border border-brand-100 bg-brand-50 p-5">
            <Txt weight="semibold" className="text-[12px] uppercase tracking-[1px] text-brand-700">
              Prix unitaire
            </Txt>
            <View className="mt-1 flex-row items-baseline gap-2">
              <Txt weight="extrabold" className="text-[40px] leading-[48px] text-brand-800">
                {formatNumber(article.price)}
              </Txt>
              <Txt weight="bold" className="text-[16px] text-brand-700">
                FCFA
              </Txt>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <Meta icon={Calendar} label="Ajouté le" value={formatDate(article.createdAt)} />
            {isAdmin ? (
              <Meta icon={Eye} label="Consultations" value={`${article.views}`} />
            ) : (
              <Meta icon={Pencil} label="Mis à jour" value={formatDate(article.updatedAt)} />
            )}
          </View>
        </MView>
      </Animated.ScrollView>

      {/* Barre supérieure : boutons sur la photo, puis fond blanc au défilement */}
      <MView style={[topBarStyle, { height: insets.top + 64 }]} className="absolute left-0 right-0 top-0 border-b border-surface-line bg-surface" />
      <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4" style={{ paddingTop: insets.top + 8 }}>
        <IconButton icon={ArrowLeft} label="Retour" tone="default" onPress={() => router.back()} />
        {isAdmin ? (
          <IconButton icon={Trash2} label="Supprimer" tone="danger" onPress={confirmDelete} />
        ) : null}
      </View>

      {isAdmin ? (
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-surface-line bg-surface px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}
        >
          <Button
            label="Modifier l’article"
            icon={Pencil}
            onPress={() => router.push({ pathname: '/article/form', params: { id: article.id } })}
          />
        </View>
      ) : null}
    </View>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <View className="flex-1 flex-row items-center gap-3 rounded-2xl bg-surface-app p-3.5">
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface">
        <Icon size={17} color={colors.inkSoft} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Txt className="text-[11px] text-ink-muted">{label}</Txt>
        <Txt weight="bold" numberOfLines={1} className="text-[13px]">
          {value}
        </Txt>
      </View>
    </View>
  );
}
