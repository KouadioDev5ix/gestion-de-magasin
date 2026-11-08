import { router } from 'expo-router';
import { memo, type ReactNode } from 'react';
import { View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import { formatNumber } from '@/lib/format';
import type { Article, Category } from '@/store/types';
import { ArticleThumb } from './ArticleThumb';
import { CategoryBadge } from './CategoryBadge';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';
import { MView } from './motion';

type Props = { article: Article; category?: Category; index: number; width: number };

/** Carte de la grille "Magasin" : photo carrée, catégorie, nom, prix. */
export const ArticleCard = memo(function ArticleCard({ article, category, index, width }: Props) {
  return (
    <MView entering={FadeInDown.delay(Math.min(index, 8) * 35).duration(320)} style={{ width }}>
      <PressableScale
        onPress={() => router.push({ pathname: '/article/[id]', params: { id: article.id } })}
        className="flex-1 rounded-3xl border border-surface-line bg-surface p-2"
        accessibilityLabel={`${article.name}, ${formatNumber(article.price)} francs CFA`}
      >
        <ArticleThumb uri={article.photoUri} category={category} className="aspect-square w-full" iconSize={36} rounded="rounded-[20px]" />
        <View className="px-1.5 pb-1.5 pt-3">
          <CategoryBadge category={category} />
          <Txt weight="semibold" numberOfLines={2} className="mt-2 min-h-[38px] text-[14px] leading-[19px]">
            {article.name}
          </Txt>
          <View className="mt-1.5 flex-row items-baseline gap-1">
            <Txt weight="extrabold" className="text-[17px] text-brand-700">
              {formatNumber(article.price)}
            </Txt>
            <Txt weight="semibold" className="text-[11px] text-ink-muted">
              FCFA
            </Txt>
          </View>
        </View>
      </PressableScale>
    </MView>
  );
});

/** Variante en ligne, utilisée dans le tableau de bord */
export function ArticleRow({ article, category, right }: { article: Article; category?: Category; right?: ReactNode }) {
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/article/[id]', params: { id: article.id } })}
      className="flex-row items-center gap-3 py-2.5"
    >
      <ArticleThumb uri={article.photoUri} category={category} className="h-12 w-12" iconSize={20} rounded="rounded-xl" />
      <View className="flex-1">
        <Txt weight="semibold" numberOfLines={1} className="text-[14px]">
          {article.name}
        </Txt>
        <Txt numberOfLines={1} className="mt-0.5 text-xs text-ink-muted">
          {category?.name ?? 'Sans catégorie'}
        </Txt>
      </View>
      {right ?? (
        <Txt weight="bold" className="text-[14px] text-ink">
          {formatNumber(article.price)} F
        </Txt>
      )}
    </PressableScale>
  );
}
