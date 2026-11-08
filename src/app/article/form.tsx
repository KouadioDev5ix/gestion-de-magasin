import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Check, Package, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View, type TextInputInstance } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CategorySelect } from '@/components/CategorySelect';
import { StackHeader, IconButton } from '@/components/Common';
import { Input } from '@/components/Input';
import { PhotoField } from '@/components/PhotoField';
import { toast } from '@/components/Toast';
import { Txt } from '@/components/Txt';
import { formatNumber, parseAmount } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { persistPhoto } from '@/lib/photos';
import { newId } from '@/lib/security';
import { useApp, useIsAdmin } from '@/store/useApp';
import { MView } from '@/components/motion';

type Errors = Partial<Record<'name' | 'category' | 'price', string>>;

/** Ajout (sans paramètre) ou modification (?id=...) d'un article. Réservé au gérant. */
export default function ArticleFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const isAdmin = useIsAdmin();
  const existing = useApp((s) => (id ? s.articles.find((a) => a.id === id) : undefined));
  const addArticle = useApp((s) => s.addArticle);
  const updateArticle = useApp((s) => s.updateArticle);
  const priceRef = useRef<TextInputInstance>(null);

  const [photo, setPhoto] = useState<string | null>(existing?.photoUri ?? null);
  const [name, setName] = useState(existing?.name ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(existing?.categoryId ?? null);
  const [priceText, setPriceText] = useState(existing ? formatNumber(existing.price) : '');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const editing = !!existing;

  if (!isAdmin) {
    return <Redirect href="/magasin" />;
  }

  const validate = () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Indiquez le nom de l’article.';
    if (!categoryId) e.category = 'Choisissez une catégorie.';
    if (parseAmount(priceText) <= 0) e.price = 'Indiquez un prix supérieur à 0.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (addAnother = false) => {
    if (!validate()) {
      haptic.error();
      return;
    }
    setSaving(true);
    try {
      const articleId = existing?.id ?? newId();
      // Copie la photo dans le stockage permanent si elle vient d'être choisie
      let photoUri = photo;
      if (photo && photo !== existing?.photoUri) {
        photoUri = await persistPhoto(photo, articleId);
      }
      const payload = { name, categoryId, price: parseAmount(priceText), photoUri };

      if (existing) {
        updateArticle(existing.id, payload);
        toast.success('Article mis à jour');
        router.back();
      } else {
        addArticle({ id: articleId, ...payload });
        toast.success('Article ajouté au magasin');
        if (addAnother) {
          // On garde la catégorie : on saisit souvent plusieurs articles du même rayon
          setPhoto(null);
          setName('');
          setPriceText('');
          setErrors({});
          setSaving(false);
        } else {
          router.back();
        }
      }
    } catch (e) {
      toast.error((e as Error).message || 'Impossible d’enregistrer la photo.');
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-surface-app">
      <StackHeader
        title={editing ? 'Modifier l’article' : 'Nouvel article'}
        onBack={() => router.back()}
        right={<IconButton icon={X} label="Fermer" onPress={() => router.back()} />}
      />

      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 }}
        >
          <MView entering={FadeInDown.duration(380)}>
            <PhotoField uri={photo} onChange={setPhoto} />
          </MView>

          <MView entering={FadeInDown.delay(70).duration(380)} className="mt-5 rounded-4xl border border-surface-line bg-surface p-5">
            <Input
              label="Nom de l’article"
              icon={Package}
              placeholder="Ex. Coque silicone iPhone 15"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
              }}
              error={errors.name}
              autoCapitalize="sentences"
              maxLength={80}
              returnKeyType="next"
              onSubmitEditing={() => priceRef.current?.focus()}
            />

            <View className="mt-4">
              <CategorySelect
                value={categoryId}
                onChange={(cid) => {
                  setCategoryId(cid);
                  if (errors.category) setErrors((e) => ({ ...e, category: undefined }));
                }}
                error={errors.category}
              />
            </View>

            <Input
              ref={priceRef}
              label="Prix unitaire"
              placeholder="0"
              keyboardType="number-pad"
              large
              value={priceText}
              onChangeText={(t) => {
                const amount = parseAmount(t);
                setPriceText(amount ? formatNumber(amount) : '');
                if (errors.price) setErrors((e) => ({ ...e, price: undefined }));
              }}
              error={errors.price}
              maxLength={14}
              suffix={
                <View className="ml-2 rounded-xl bg-brand-50 px-3 py-1.5">
                  <Txt weight="bold" className="text-[13px] text-brand-700">
                    FCFA
                  </Txt>
                </View>
              }
              className="mt-4"
            />
          </MView>
        </ScrollView>

        <View className="border-t border-surface-line bg-surface px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}>
          {editing ? (
            <Button label="Enregistrer les modifications" icon={Check} loading={saving} onPress={() => save()} />
          ) : (
            <View className="flex-row gap-3">
              <Button label="+ Autre" variant="ghost" disabled={saving} onPress={() => save(true)} className="px-4" />
              <View className="flex-1">
                <Button label="Enregistrer" icon={Check} loading={saving} onPress={() => save()} />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
