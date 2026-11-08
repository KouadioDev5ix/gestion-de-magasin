import { Check, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { haptic } from '@/lib/haptics';
import { CATEGORY_ICON_KEYS, CATEGORY_ICONS } from '@/lib/icons';
import { alpha, CATEGORY_COLORS, colors } from '@/lib/theme';
import { useApp } from '@/store/useApp';
import type { Category } from '@/store/types';
import { Button } from './Button';
import { CategoryGlyph } from './CategoryBadge';
import { Input } from './Input';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';
import { toast } from './Toast';
import { Txt } from './Txt';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Catégorie à modifier ; absent = création */
  category?: Category | null;
  onCreated?: (category: Category) => void;
};

/** Création / modification d'une catégorie : nom, couleur, icône. */
export function CategoryEditor({ visible, onClose, category, onCreated }: Props) {
  const addCategory = useApp((s) => s.addCategory);
  const updateCategory = useApp((s) => s.updateCategory);
  const removeCategory = useApp((s) => s.removeCategory);
  const usage = useApp((s) => (category ? s.articles.filter((a) => a.categoryId === category.id).length : 0));
  const categoriesCount = useApp((s) => s.categories.length);

  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState<string>('package');
  const [error, setError] = useState<string | null>(null);

  // Réinitialise le formulaire à chaque ouverture (ajustement pendant le rendu)
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const openKey = visible ? (category?.id ?? 'new') : null;
  if (openKey !== openedFor) {
    setOpenedFor(openKey);
    if (openKey) {
      setName(category?.name ?? '');
      setColor(category?.color ?? CATEGORY_COLORS[categoriesCount % CATEGORY_COLORS.length]);
      setIcon(category?.icon ?? 'package');
      setError(null);
    }
  }

  const save = () => {
    if (name.trim().length < 2) {
      setError('Donnez un nom d’au moins 2 caractères.');
      haptic.error();
      return;
    }
    try {
      if (category) {
        updateCategory(category.id, { name, color, icon });
        toast.success('Catégorie mise à jour');
      } else {
        const created = addCategory({ name, color, icon });
        toast.success('Catégorie créée');
        onCreated?.(created);
      }
      onClose();
    } catch (e) {
      setError((e as Error).message);
      haptic.error();
    }
  };

  const remove = () => {
    if (!category) return;
    Alert.alert(
      'Supprimer la catégorie ?',
      usage > 0
        ? `${usage} article${usage > 1 ? 's' : ''} passera${usage > 1 ? 'ont' : ''} en « Sans catégorie ». Les articles ne sont pas supprimés.`
        : 'Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            removeCategory(category.id);
            toast.success('Catégorie supprimée');
            onClose();
          },
        },
      ],
    );
  };


  return (
    <Sheet visible={visible} onClose={onClose} title={category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="mb-5 flex-row items-center gap-4 rounded-3xl p-4" style={{ backgroundColor: alpha(color, 0.08) }}>
          <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: color }}>
            <CategoryGlyph icon={icon} size={26} color={colors.white} strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Txt className="text-xs text-ink-muted">Aperçu</Txt>
            <Txt weight="bold" numberOfLines={1} className="text-[17px]">
              {name.trim() || 'Nom de la catégorie'}
            </Txt>
          </View>
        </View>

        <Input
          label="Nom"
          placeholder="Ex. Power banks"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (error) setError(null);
          }}
          error={error}
          autoCapitalize="sentences"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={save}
        />

        <Txt weight="semibold" className="mb-2.5 mt-5 text-[13px] text-ink-soft">
          Couleur
        </Txt>
        <View className="flex-row flex-wrap gap-2.5">
          {CATEGORY_COLORS.map((c) => (
            <PressableScale
              key={c}
              scaleTo={0.85}
              onPress={() => {
                haptic.tap();
                setColor(c);
              }}
              accessibilityLabel={`Couleur ${c}`}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: c }}
            >
              {color === c ? <Check size={18} color={colors.white} strokeWidth={3} /> : null}
            </PressableScale>
          ))}
        </View>

        <Txt weight="semibold" className="mb-2.5 mt-5 text-[13px] text-ink-soft">
          Icône
        </Txt>
        <View className="flex-row flex-wrap gap-2.5">
          {CATEGORY_ICON_KEYS.map((key) => {
            const Icon = CATEGORY_ICONS[key];
            const active = key === icon;
            return (
              <PressableScale
                key={key}
                scaleTo={0.88}
                onPress={() => {
                  haptic.tap();
                  setIcon(key);
                }}
                accessibilityLabel={`Icône ${key}`}
                className="h-12 w-12 items-center justify-center rounded-2xl border-[1.5px]"
                style={{
                  borderColor: active ? color : colors.line,
                  backgroundColor: active ? alpha(color, 0.1) : colors.white,
                }}
              >
                <Icon size={21} color={active ? color : colors.muted} strokeWidth={1.9} />
              </PressableScale>
            );
          })}
        </View>

        <Button label={category ? 'Enregistrer' : 'Créer la catégorie'} onPress={save} className="mt-7" />
        {category ? (
          <Button label="Supprimer" icon={Trash2} variant="dangerSoft" onPress={remove} className="mt-3" />
        ) : null}
      </ScrollView>
    </Sheet>
  );
}
