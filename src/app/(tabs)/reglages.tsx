import Constants from 'expo-constants';
import { router } from 'expo-router';
import { KeyRound, LogOut, ShieldCheck, Store, Tags, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Avatar, ListRow, TabHeader } from '@/components/Common';
import { Input } from '@/components/Input';
import { Sheet } from '@/components/Sheet';
import { tabBarSpace } from '@/components/TabBar';
import { toast } from '@/components/Toast';
import { Txt } from '@/components/Txt';
import { colors } from '@/lib/theme';
import { useApp, useCurrentUser } from '@/store/useApp';
import { MView } from '@/components/motion';

export default function ReglagesScreen() {
  const insets = useSafeAreaInsets();
  const user = useCurrentUser();
  const shopName = useApp((s) => s.shopName);
  const setShopName = useApp((s) => s.setShopName);
  const logout = useApp((s) => s.logout);
  const teamSize = useApp((s) => s.users.length);
  const isAdmin = user?.role === 'admin';

  const [shopOpen, setShopOpen] = useState(false);
  const [shopDraft, setShopDraft] = useState(shopName);

  const confirmLogout = () =>
    Alert.alert('Se déconnecter ?', 'Vous devrez saisir à nouveau vos identifiants.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: logout },
    ]);

  return (
    <View className="flex-1 bg-surface-app">
      <TabHeader title="Réglages" subtitle={shopName} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: tabBarSpace(insets.bottom) }}
      >
        {/* Profil */}
        <MView
          entering={FadeInDown.duration(380)}
          className="flex-row items-center rounded-4xl p-4"
          style={{ backgroundColor: colors.brandDeep }}
        >
          <Avatar name={user?.name ?? '?'} size={56} dark />
          <View className="ml-4 flex-1">
            <Txt weight="bold" numberOfLines={1} className="text-[17px] text-white">
              {user?.name}
            </Txt>
            <Txt className="mt-0.5 text-[13px] text-white/60">@{user?.username}</Txt>
          </View>
          <View className="flex-row items-center gap-1 rounded-full bg-white/15 px-3 py-1.5">
            <ShieldCheck size={13} color={colors.white} strokeWidth={2.4} />
            <Txt weight="bold" className="text-[11px] text-white">
              {isAdmin ? 'Gérant' : 'Vendeur'}
            </Txt>
          </View>
        </MView>

        {isAdmin ? (
          <MView entering={FadeInDown.delay(70).duration(380)}>
            <Txt weight="semibold" className="mb-2 ml-1 mt-7 text-[12px] uppercase tracking-[1px] text-ink-muted">
              Boutique
            </Txt>
            <View className="overflow-hidden rounded-3xl border border-surface-line bg-surface">
              <ListRow
                icon={Store}
                label="Nom de la boutique"
                value={shopName}
                onPress={() => {
                  setShopDraft(shopName);
                  setShopOpen(true);
                }}
              />
              <ListRow icon={Users} label="Équipe et accès" value={`${teamSize} membre${teamSize > 1 ? 's' : ''}`} onPress={() => router.push('/equipe')} />
              <ListRow icon={Tags} label="Catégories" onPress={() => router.push('/categories')} last />
            </View>
          </MView>
        ) : null}

        <MView entering={FadeInDown.delay(140).duration(380)}>
          <Txt weight="semibold" className="mb-2 ml-1 mt-7 text-[12px] uppercase tracking-[1px] text-ink-muted">
            Compte
          </Txt>
          <View className="overflow-hidden rounded-3xl border border-surface-line bg-surface">
            <ListRow icon={KeyRound} label="Changer mon mot de passe" onPress={() => router.push('/mot-de-passe')} />
            <ListRow icon={LogOut} label="Se déconnecter" tone="danger" onPress={confirmLogout} last />
          </View>
        </MView>

        <Txt className="mt-8 text-center text-[12px] text-ink-faint">
          GestCom · version {Constants.expoConfig?.version ?? '1.0.0'}
        </Txt>
      </ScrollView>

      <Sheet visible={shopOpen} onClose={() => setShopOpen(false)} title="Nom de la boutique">
        <Input
          icon={Store}
          value={shopDraft}
          onChangeText={setShopDraft}
          placeholder="Nom de la boutique"
          autoFocus
          autoCapitalize="words"
          maxLength={50}
        />
        <Button
          label="Enregistrer"
          className="mt-5"
          disabled={shopDraft.trim().length < 2}
          onPress={() => {
            setShopName(shopDraft);
            setShopOpen(false);
            toast.success('Nom de la boutique mis à jour');
          }}
        />
      </Sheet>
    </View>
  );
}
