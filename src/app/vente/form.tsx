import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Check, Hash, Minus, Plus, Trash2, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleSelect } from '@/components/ArticleSelect';
import { Button } from '@/components/Button';
import { IconButton, StackHeader } from '@/components/Common';
import { Input } from '@/components/Input';
import { PressableScale } from '@/components/PressableScale';
import { toast } from '@/components/Toast';
import { Txt } from '@/components/Txt';
import { MView } from '@/components/motion';
import { formatNumber, formatPrice, parseAmount } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors } from '@/lib/theme';
import { useApp, useIsAdmin } from '@/store/useApp';

type Errors = Partial<Record<'article' | 'quantity' | 'price', string>>;

const MAX_QUANTITY = 9999;

/** Enregistrement (sans paramètre) ou modification (?id=..., gérant uniquement) d'une vente. */
export default function SaleFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const isAdmin = useIsAdmin();
  const articles = useApp((s) => s.articles);
  const existing = useApp((s) => (id ? s.sales.find((x) => x.id === id) : undefined));
  const addSale = useApp((s) => s.addSale);
  const updateSale = useApp((s) => s.updateSale);
  const removeSale = useApp((s) => s.removeSale);

  const [articleId, setArticleId] = useState<string | null>(existing?.articleId ?? null);
  const [quantityText, setQuantityText] = useState(existing ? String(existing.quantity) : '1');
  const [priceText, setPriceText] = useState(existing ? formatNumber(existing.unitPrice) : '');
  const [errors, setErrors] = useState<Errors>({});
  // Empêche d'enregistrer deux fois la vente sur un double appui pendant la fermeture de l'écran
  const closing = useRef(false);

  const article = articles.find((a) => a.id === articleId);
  const quantity = parseAmount(quantityText);
  const price = parseAmount(priceText);
  const total = quantity * price;
  const editing = !!id;
  // Une vente ancienne reste modifiable même si son article a été retiré du magasin
  const keepsRemovedArticle = !article && !!existing && articleId === existing.articleId;

  if (editing && !isAdmin) return <Redirect href="/ventes" />;

  const clearError = (key: keyof Errors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const stepQuantity = (delta: number) => {
    haptic.tap();
    setQuantityText(String(Math.min(MAX_QUANTITY, Math.max(1, quantity + delta))));
    clearError('quantity');
  };

  const save = (addAnother: boolean) => {
    if (closing.current) return;
    const e: Errors = {};
    if (!articleId || (!article && !keepsRemovedArticle)) e.article = 'Choisissez l’article vendu.';
    if (quantity <= 0) e.quantity = 'Indiquez une quantité d’au moins 1.';
    if (price <= 0) e.price = 'Indiquez un prix supérieur à 0.';
    setErrors(e);
    if (!articleId || Object.keys(e).length > 0) {
      haptic.error();
      return;
    }

    try {
      if (existing) updateSale(existing.id, { articleId, quantity, unitPrice: price });
      else addSale({ articleId, quantity, unitPrice: price });
    } catch (err) {
      toast.error((err as Error).message);
      return;
    }
    haptic.success();
    toast.success(existing ? 'Vente modifiée' : `Vente enregistrée : ${formatPrice(total)}`);

    if (addAnother) {
      setArticleId(null);
      setQuantityText('1');
      setPriceText('');
    } else {
      closing.current = true;
      router.back();
    }
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert(
      'Supprimer cette vente ?',
      `${existing.quantity} × ${existing.articleName} (${formatPrice(existing.quantity * existing.unitPrice)}). Cette suppression est définitive.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            closing.current = true;
            removeSale(existing.id);
            toast.success('Vente supprimée');
            router.back();
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-surface-app">
      <StackHeader
        title={editing ? 'Modifier la vente' : 'Nouvelle vente'}
        right={
          editing ? (
            <IconButton icon={Trash2} tone="danger" label="Supprimer la vente" onPress={confirmDelete} />
          ) : (
            <IconButton icon={X} label="Fermer" onPress={() => router.back()} />
          )
        }
      />

      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 }}
        >
          <MView entering={FadeInDown.duration(380)} className="rounded-4xl border border-surface-line bg-surface p-5">
            <ArticleSelect
              value={articleId}
              fallbackName={keepsRemovedArticle ? existing.articleName : undefined}
              onChange={(pickedId) => {
                setArticleId(pickedId);
                // Le prix du catalogue est proposé, mais reste modifiable (remise, négociation)
                const picked = articles.find((a) => a.id === pickedId);
                if (picked) setPriceText(formatNumber(picked.price));
                setErrors((prev) => ({ ...prev, article: undefined, price: undefined }));
              }}
              error={errors.article}
            />

            <Input
              label="Quantité"
              icon={Hash}
              keyboardType="number-pad"
              placeholder="1"
              value={quantityText}
              onChangeText={(t) => {
                const q = parseAmount(t);
                setQuantityText(q ? String(Math.min(MAX_QUANTITY, q)) : '');
                clearError('quantity');
              }}
              error={errors.quantity}
              maxLength={4}
              suffix={
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <StepButton icon="minus" disabled={quantity <= 1} onPress={() => stepQuantity(-1)} />
                  <StepButton icon="plus" disabled={quantity >= MAX_QUANTITY} onPress={() => stepQuantity(1)} />
                </View>
              }
              className="mt-4"
            />

            <Input
              label="Prix unitaire"
              placeholder="0"
              keyboardType="number-pad"
              large
              value={priceText}
              onChangeText={(t) => {
                const amount = parseAmount(t);
                setPriceText(amount ? formatNumber(amount) : '');
                clearError('price');
              }}
              error={errors.price}
              hint={article ? `Prix du catalogue : ${formatPrice(article.price)}` : undefined}
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

            <View style={{ marginTop: 20, borderRadius: 16, padding: 16, backgroundColor: colors.brandSoft, flexDirection: 'row', alignItems: 'center' }}>
              <Txt weight="semibold" style={{ flex: 1, fontSize: 14, color: colors.brandDark }}>
                Total
              </Txt>
              <Txt weight="extrabold" numberOfLines={1} adjustsFontSizeToFit style={{ fontSize: 22, color: colors.brandDark }}>
                {formatPrice(total)}
              </Txt>
            </View>
          </MView>
        </ScrollView>

        <View className="border-t border-surface-line bg-surface px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 12) + 4 }}>
          {editing ? (
            <Button label="Enregistrer les modifications" icon={Check} onPress={() => save(false)} />
          ) : (
            <View className="flex-row gap-3">
              <Button label="+ Autre" variant="ghost" onPress={() => save(true)} />
              <View className="flex-1">
                <Button label="Enregistrer" icon={Check} onPress={() => save(false)} />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function StepButton({ icon, disabled, onPress }: { icon: 'minus' | 'plus'; disabled: boolean; onPress: () => void }) {
  const Icon = icon === 'minus' ? Minus : Plus;
  return (
    <PressableScale
      scaleTo={0.88}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={icon === 'minus' ? 'Diminuer la quantité' : 'Augmenter la quantité'}
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brandSoft,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Icon size={18} color={colors.brandDark} strokeWidth={2.4} />
    </PressableScale>
  );
}
