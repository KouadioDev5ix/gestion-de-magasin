import { router } from 'expo-router';
import { Check, ChevronDown, Plus, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Dimensions, FlatList, View } from 'react-native';

import { formatNumber, normalize } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors } from '@/lib/theme';
import { useApp, useCategoryMap, useIsAdmin } from '@/store/useApp';
import { ArticleThumb } from './ArticleThumb';
import { Button } from './Button';
import { Input } from './Input';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';
import { Txt } from './Txt';

const LIST_HEIGHT = Dimensions.get('window').height * 0.38;

type Props = {
  value: string | null;
  onChange: (id: string) => void;
  error?: string | null;
  /** Nom affiché quand l'article d'une vente a depuis été retiré du magasin */
  fallbackName?: string;
};

/** Champ "select" listant les articles du magasin, avec recherche. */
export function ArticleSelect({ value, onChange, error, fallbackName }: Props) {
  const articles = useApp((s) => s.articles);
  const catMap = useCategoryMap();
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = articles.find((a) => a.id === value);

  const results = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    return articles
      .filter((a) => {
        const hay = normalize(`${a.name} ${a.categoryId ? (catMap[a.categoryId]?.name ?? '') : ''}`);
        return tokens.every((t) => hay.includes(t));
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [articles, catMap, query]);

  return (
    <View>
      <Txt weight="semibold" className="mb-2 text-[13px] text-ink-soft">
        Nom de l’article
      </Txt>
      <PressableScale
        scaleTo={0.985}
        onPress={() => {
          haptic.tap();
          setQuery('');
          setOpen(true);
        }}
        accessibilityRole="combobox"
        accessibilityLabel={`Article : ${selected?.name ?? 'aucun'}`}
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
        {selected ? (
          <ArticleThumb
            uri={selected.photoUri}
            category={selected.categoryId ? catMap[selected.categoryId] : undefined}
            className="h-9 w-9"
            iconSize={16}
            rounded="rounded-xl"
          />
        ) : null}
        <Txt
          weight={selected || fallbackName ? 'semibold' : 'medium'}
          numberOfLines={1}
          style={{ flex: 1, marginLeft: selected ? 12 : 0, fontSize: 15, color: selected || fallbackName ? colors.ink : colors.faint }}
        >
          {selected?.name ?? fallbackName ?? 'Choisir un article'}
        </Txt>
        <ChevronDown size={20} color={colors.faint} />
      </PressableScale>
      {error ? (
        <Txt weight="medium" className="ml-1 mt-1.5 text-xs text-danger">
          {error}
        </Txt>
      ) : null}

      <Sheet visible={open} onClose={() => setOpen(false)} title="Choisir un article">
        {articles.length === 0 ? (
          <View style={{ paddingBottom: 8 }}>
            <Txt className="mb-4 text-sm leading-5 text-ink-muted">
              {isAdmin ? 'Ajoutez d’abord vos articles au magasin pour pouvoir enregistrer une vente.' : 'Le gérant n’a pas encore ajouté d’articles au magasin.'}
            </Txt>
            {isAdmin ? (
              <Button
                label="Ajouter un article"
                icon={Plus}
                onPress={() => {
                  setOpen(false);
                  router.push('/article/form');
                }}
              />
            ) : null}
          </View>
        ) : (
          <>
            <Input icon={Search} placeholder="Rechercher un article…" value={query} onChangeText={setQuery} autoCorrect={false} returnKeyType="search" />
            <FlatList
              data={results}
              keyExtractor={(a) => a.id}
              style={{ height: LIST_HEIGHT, marginTop: 8 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Txt className="py-8 text-center text-sm text-ink-muted">Aucun article trouvé.</Txt>}
              renderItem={({ item }) => {
                const active = item.id === value;
                return (
                  <PressableScale
                    scaleTo={0.98}
                    onPress={() => {
                      haptic.tap();
                      onChange(item.id);
                      setOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                      borderRadius: 16,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: active ? colors.brandSoft : 'transparent',
                    }}
                  >
                    <ArticleThumb
                      uri={item.photoUri}
                      category={item.categoryId ? catMap[item.categoryId] : undefined}
                      className="h-11 w-11"
                      iconSize={18}
                      rounded="rounded-xl"
                    />
                    <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                      <Txt weight="semibold" numberOfLines={1} style={{ fontSize: 14.5 }}>
                        {item.name}
                      </Txt>
                      <Txt numberOfLines={1} className="mt-0.5 text-xs text-ink-muted">
                        {formatNumber(item.price)} FCFA
                      </Txt>
                    </View>
                    {active ? <Check size={20} color={colors.brand} strokeWidth={2.6} /> : null}
                  </PressableScale>
                );
              }}
            />
          </>
        )}
      </Sheet>
    </View>
  );
}
