import { Pencil } from 'lucide-react-native';
import { View } from 'react-native';

import { formatNumber } from '@/lib/format';
import { saleTotal } from '@/lib/sales';
import { colors } from '@/lib/theme';
import type { Sale } from '@/store/types';
import { useApp } from '@/store/useApp';
import { ArticleThumb } from './ArticleThumb';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

type Props = {
  sale: Sale;
  /** Heure ou date affichée sous le nom */
  when: string;
  showSeller?: boolean;
  onEdit?: () => void;
};

/** Ligne de vente. Le nom et le prix restent ceux de la vente, même si l'article change ensuite. */
export function SaleRow({ sale, when, showSeller, onEdit }: Props) {
  const article = useApp((s) => s.articles.find((a) => a.id === sale.articleId));
  const category = useApp((s) => s.categories.find((c) => c.id === article?.categoryId));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
      <ArticleThumb uri={article?.photoUri ?? null} category={category} className="h-12 w-12" iconSize={20} rounded="rounded-xl" />
      <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
        <Txt weight="semibold" numberOfLines={1} className="text-[14px]">
          {sale.articleName}
        </Txt>
        <Txt numberOfLines={1} className="mt-0.5 text-xs text-ink-muted">
          {sale.quantity} × {formatNumber(sale.unitPrice)} F · {when}
          {showSeller ? ` · ${sale.sellerName}` : ''}
        </Txt>
      </View>
      <Txt weight="bold" className="text-[14px]">
        {formatNumber(saleTotal(sale))} F
      </Txt>
      {onEdit ? (
        <PressableScale
          haptics
          scaleTo={0.85}
          hitSlop={8}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Modifier la vente de ${sale.articleName}`}
          style={{ marginLeft: 10, width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandSoft }}
        >
          <Pencil size={15} color={colors.brandDark} strokeWidth={2.2} />
        </PressableScale>
      ) : null}
    </View>
  );
}
