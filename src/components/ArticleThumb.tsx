import { Image } from 'expo-image';
import { View } from 'react-native';

import { alpha, colors } from '@/lib/theme';
import type { Category } from '@/store/types';
import { CategoryGlyph } from './CategoryBadge';

type Props = {
  uri: string | null;
  category?: Category;
  className?: string;
  iconSize?: number;
  rounded?: string;
};

/** Photo de l'article, ou pictogramme de sa catégorie s'il n'y a pas de photo. */
export function ArticleThumb({ uri, category, className = '', iconSize = 28, rounded = 'rounded-2xl' }: Props) {
  const tint = category?.color ?? colors.muted;

  if (uri) {
    return (
      <View className={`overflow-hidden bg-surface-sunken ${rounded} ${className}`}>
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} recyclingKey={uri} />
      </View>
    );
  }

  return (
    <View className={`items-center justify-center ${rounded} ${className}`} style={{ backgroundColor: alpha(tint, 0.1) }}>
      <CategoryGlyph icon={category?.icon} size={iconSize} color={tint} strokeWidth={1.6} />
    </View>
  );
}
