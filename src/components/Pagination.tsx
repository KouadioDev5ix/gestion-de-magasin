import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { formatNumber } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors } from '@/lib/theme';
import { PAGE_SIZE } from '@/lib/usePagination';
import { PressableScale } from './PressableScale';
import { Txt } from './Txt';

type Props = {
  page: number;
  pageCount: number;
  totalItems: number;
  onChange: (page: number) => void;
};

/** Boutons de page placés sous une liste. Rien ne s'affiche s'il n'y a qu'une page. */
export function Pagination({ page, pageCount, totalItems, onChange }: Props) {
  if (pageCount <= 1) return null;

  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, totalItems);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
      <PageButton icon={ChevronLeft} label="Page précédente" disabled={page <= 1} onPress={() => onChange(page - 1)} />
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
        <Txt weight="bold" className="text-[14px]">
          Page {page} sur {pageCount}
        </Txt>
        <Txt className="mt-0.5 text-xs text-ink-muted">
          {first}–{last} sur {formatNumber(totalItems)}
        </Txt>
      </View>
      <PageButton icon={ChevronRight} label="Page suivante" disabled={page >= pageCount} onPress={() => onChange(page + 1)} />
    </View>
  );
}

function PageButton({ icon: Icon, label, disabled, onPress }: { icon: LucideIcon; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <PressableScale
      scaleTo={0.9}
      disabled={disabled}
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brandSoft,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Icon size={22} color={colors.brandDark} strokeWidth={2.4} />
    </PressableScale>
  );
}
