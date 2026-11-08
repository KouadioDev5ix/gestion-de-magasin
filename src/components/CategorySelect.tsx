import { Check, ChevronDown, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { colors } from '@/lib/theme';
import { useApp } from '@/store/useApp';
import { CategoryEditor } from './CategoryEditor';
import { CategoryIcon } from './CategoryBadge';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';
import { Txt } from './Txt';

type Props = {
  value: string | null;
  onChange: (id: string | null) => void;
  error?: string | null;
};

/** Champ "select" de catégorie, avec création à la volée. */
export function CategorySelect({ value, onChange, error }: Props) {
  const categories = useApp((s) => s.categories);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <View>
      <Txt weight="semibold" className="mb-2 text-[13px] text-ink-soft">
        Catégorie
      </Txt>
      <PressableScale
        scaleTo={0.985}
        onPress={() => {
          haptic.tap();
          setOpen(true);
        }}
        accessibilityRole="combobox"
        accessibilityLabel={`Catégorie : ${selected?.name ?? 'aucune'}`}
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: error ? colors.danger : colors.line,
          backgroundColor: '#FAFBFC',
          paddingLeft: selected ? 10 : 16,
          paddingRight: 14,
        }}
      >
        {selected ? <CategoryIcon category={selected} size={34} /> : null}
        <Txt
          weight={selected ? 'semibold' : 'medium'}
          numberOfLines={1}
          style={{ flex: 1, marginLeft: selected ? 12 : 0, fontSize: 15, color: selected ? colors.ink : colors.faint }}
        >
          {selected ? selected.name : 'Choisir une catégorie'}
        </Txt>
        <ChevronDown size={20} color={colors.faint} />
      </PressableScale>
      {error ? (
        <Txt weight="medium" className="ml-1 mt-1.5 text-xs text-danger">
          {error}
        </Txt>
      ) : null}

      <Sheet visible={open} onClose={() => setOpen(false)} title="Catégorie" subtitle="Classez l’article pour le retrouver vite">
        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          {categories.map((c) => {
            const active = c.id === value;
            return (
              <PressableScale
                key={c.id}
                scaleTo={0.98}
                onPress={() => {
                  haptic.tap();
                  onChange(c.id);
                  setOpen(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 6,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: active ? colors.brandSoft : 'transparent',
                }}
              >
                <CategoryIcon category={c} size={40} />
                <Txt weight="semibold" numberOfLines={1} style={{ flex: 1, marginLeft: 12, fontSize: 15 }}>
                  {c.name}
                </Txt>
                {active ? <Check size={20} color={colors.brand} strokeWidth={2.6} /> : null}
              </PressableScale>
            );
          })}
        </ScrollView>
        <PressableScale
          onPress={() => {
            setOpen(false);
            setTimeout(() => setCreating(true), 260);
          }}
          style={{
            marginTop: 8,
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 16,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: '#A3A8FD',
          }}
        >
          <Plus size={19} color={colors.brand} strokeWidth={2.4} />
          <Txt weight="bold" style={{ fontSize: 15, color: colors.brandDark }}>
            Nouvelle catégorie
          </Txt>
        </PressableScale>
      </Sheet>

      <CategoryEditor visible={creating} onClose={() => setCreating(false)} onCreated={(c) => onChange(c.id)} />
    </View>
  );
}
