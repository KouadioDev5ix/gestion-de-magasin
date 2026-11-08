import type { LucideProps } from 'lucide-react-native';
import { createElement } from 'react';
import { View } from 'react-native';

import { getCategoryIcon } from '@/lib/icons';
import { alpha, colors } from '@/lib/theme';
import type { Category } from '@/store/types';
import { Txt } from './Txt';

/** Icône d'une catégorie à partir de sa clé (référence de composant stable). */
export function CategoryGlyph({ icon, ...props }: LucideProps & { icon?: string }) {
  return createElement(getCategoryIcon(icon), props);
}

export function CategoryBadge({ category, size = 'sm' }: { category?: Category; size?: 'sm' | 'md' }) {
  const color = category?.color ?? colors.muted;
  const md = size === 'md';
  return (
    <View
      className={`flex-row items-center self-start rounded-full ${md ? 'gap-1.5 px-3 py-1.5' : 'gap-1 px-2 py-0.5'}`}
      style={{ backgroundColor: alpha(color, 0.1) }}
    >
      <CategoryGlyph icon={category?.icon} size={md ? 14 : 11} color={color} strokeWidth={2.2} />
      <Txt weight="semibold" numberOfLines={1} className={md ? 'text-[13px]' : 'text-[11px]'} style={{ color }}>
        {category?.name ?? 'Sans catégorie'}
      </Txt>
    </View>
  );
}

/** Pastille arrondie avec l'icône de la catégorie */
export function CategoryIcon({ category, size = 44 }: { category?: Category; size?: number }) {
  const color = category?.color ?? colors.muted;
  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{ width: size, height: size, backgroundColor: alpha(color, 0.12) }}
    >
      <CategoryGlyph icon={category?.icon} size={size * 0.45} color={color} strokeWidth={2} />
    </View>
  );
}
