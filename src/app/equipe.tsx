import { Redirect } from 'expo-router';
import { KeyRound, Lock, Plus, ShieldCheck, Trash2, User, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Avatar, IconButton, StackHeader } from '@/components/Common';
import { Input } from '@/components/Input';
import { PressableScale } from '@/components/PressableScale';
import { Sheet } from '@/components/Sheet';
import { toast } from '@/components/Toast';
import { Txt } from '@/components/Txt';
import { formatDate } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { colors } from '@/lib/theme';
import type { Role, User as Member } from '@/store/types';
import { useApp, useCurrentUser } from '@/store/useApp';
import { MView } from '@/components/motion';

export default function EquipeScreen() {
  const insets = useSafeAreaInsets();
  const me = useCurrentUser();
  const users = useApp((s) => s.users);
  const addMember = useApp((s) => s.addMember);
  const removeMember = useApp((s) => s.removeMember);
  const resetMemberPassword = useApp((s) => s.resetMemberPassword);

  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState<Member | null>(null);

  if (me?.role !== 'admin') {
    return <Redirect href="/magasin" />;
  }

  const confirmRemove = (u: Member) =>
    Alert.alert(`Retirer ${u.name} ?`, 'Cette personne ne pourra plus se connecter.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: () => {
          removeMember(u.id);
          toast.success('Accès retiré');
        },
      },
    ]);

  return (
    <View className="flex-1 bg-surface-app">
      <StackHeader title="Équipe et accès" right={<IconButton icon={Plus} tone="brand" label="Ajouter un membre" onPress={() => setAdding(true)} />} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}>
        <View className="mb-5 flex-row items-start gap-3 rounded-3xl bg-brand-50 p-4">
          <ShieldCheck size={20} color={colors.brand} strokeWidth={2.2} style={{ marginTop: 1 }} />
          <Txt className="flex-1 text-[13px] leading-5 text-brand-900">
            Les <Txt weight="bold" className="text-[13px] text-brand-900">vendeurs</Txt> consultent le magasin et les prix et enregistrent leurs ventes, sans pouvoir modifier le catalogue ni corriger une vente enregistrée. Les{' '}
            <Txt weight="bold" className="text-[13px] text-brand-900">gérants</Txt> gèrent tout.
          </Txt>
        </View>

        {users.map((u, i) => {
          const isMe = u.id === me.id;
          return (
            <MView
              key={u.id}
              entering={FadeInDown.delay(i * 50).duration(320)}
              exiting={FadeOut.duration(200)}
              layout={LinearTransition.springify().damping(20)}
              className="mb-2.5 flex-row items-center rounded-3xl border border-surface-line bg-surface p-3.5"
            >
              <Avatar name={u.name} size={46} />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center gap-2">
                  <Txt weight="bold" numberOfLines={1} className="shrink text-[15px]">
                    {u.name}
                  </Txt>
                  {isMe ? (
                    <Txt weight="semibold" className="text-[12px] text-ink-muted">
                      (vous)
                    </Txt>
                  ) : null}
                </View>
                <Txt numberOfLines={1} className="mt-0.5 text-[12.5px] text-ink-muted">
                  @{u.username} · depuis le {formatDate(u.createdAt)}
                </Txt>
                <View className={`mt-2 self-start rounded-full px-2.5 py-0.5 ${u.role === 'admin' ? 'bg-brand-600' : 'bg-surface-sunken'}`}>
                  <Txt weight="bold" className={`text-[11px] ${u.role === 'admin' ? 'text-white' : 'text-ink-soft'}`}>
                    {u.role === 'admin' ? 'Gérant' : 'Vendeur'}
                  </Txt>
                </View>
              </View>
              {!isMe ? (
                <View className="flex-row gap-2">
                  <PressableScale haptics scaleTo={0.85} onPress={() => setResetting(u)} accessibilityLabel={`Nouveau mot de passe pour ${u.name}`} className="h-9 w-9 items-center justify-center rounded-xl bg-surface-sunken">
                    <KeyRound size={16} color={colors.inkSoft} strokeWidth={2.2} />
                  </PressableScale>
                  <PressableScale haptics scaleTo={0.85} onPress={() => confirmRemove(u)} accessibilityLabel={`Retirer ${u.name}`} className="h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                    <Trash2 size={16} color={colors.danger} strokeWidth={2.2} />
                  </PressableScale>
                </View>
              ) : null}
            </MView>
          );
        })}

        <Button label="Ajouter un vendeur" icon={UserPlus} variant="ghost" onPress={() => setAdding(true)} className="mt-3" />
      </ScrollView>

      <AddMemberSheet
        visible={adding}
        onClose={() => setAdding(false)}
        onSubmit={async (input) => {
          await addMember(input);
          toast.success(`${input.name} peut maintenant se connecter`);
        }}
      />
      <ResetPasswordSheet
        member={resetting}
        onClose={() => setResetting(null)}
        onSubmit={async (password) => {
          if (!resetting) return;
          await resetMemberPassword(resetting.id, password);
          toast.success('Mot de passe réinitialisé');
        }}
      />
    </View>
  );
}

function AddMemberSheet({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; username: string; password: string; role: Role }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('vendeur');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRole('vendeur');
    setError(null);
    setLoading(false);
  };

  const submit = async () => {
    if (name.trim().length < 2) return setError('Indiquez le nom de la personne.');
    if (username.trim().length < 3) return setError('L’identifiant doit faire au moins 3 caractères.');
    if (password.length < 4) return setError('Le mot de passe doit faire au moins 4 caractères.');
    setLoading(true);
    try {
      await onSubmit({ name, username, password, role });
      reset();
      onClose();
    } catch (e) {
      setError((e as Error).message);
      haptic.error();
      setLoading(false);
    }
  };

  return (
    <Sheet
      visible={visible}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Nouveau membre"
      subtitle="Communiquez-lui son identifiant et son mot de passe."
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row gap-2 rounded-2xl bg-surface-sunken p-1">
          {(['vendeur', 'admin'] as Role[]).map((r) => (
            <PressableScale
              key={r}
              scaleTo={0.97}
              onPress={() => {
                haptic.tap();
                setRole(r);
              }}
              className={`h-11 flex-1 items-center justify-center rounded-xl ${role === r ? 'bg-surface' : ''}`}
              style={role === r ? { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 } : undefined}
            >
              <Txt weight="bold" className={`text-[14px] ${role === r ? 'text-ink' : 'text-ink-muted'}`}>
                {r === 'vendeur' ? 'Vendeur' : 'Gérant'}
              </Txt>
            </PressableScale>
          ))}
        </View>
        <Input label="Nom" icon={User} placeholder="Prénom et nom" value={name} onChangeText={(t) => { setName(t); setError(null); }} autoCapitalize="words" />
        <Input
          label="Identifiant"
          icon={User}
          placeholder="Ex. 0505050505"
          value={username}
          onChangeText={(t) => { setUsername(t); setError(null); }}
          autoCapitalize="none"
          autoCorrect={false}
          className="mt-4"
        />
        <Input
          label="Mot de passe"
          icon={Lock}
          password
          placeholder="4 caractères minimum"
          value={password}
          onChangeText={(t) => { setPassword(t); setError(null); }}
          autoCapitalize="none"
          error={error}
          className="mt-4"
        />
        <Button label="Créer l’accès" icon={UserPlus} loading={loading} onPress={submit} className="mt-6" />
      </ScrollView>
    </Sheet>
  );
}

function ResetPasswordSheet({
  member,
  onClose,
  onSubmit,
}: {
  member: Member | null;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <Sheet visible={!!member} onClose={close} title="Nouveau mot de passe" subtitle={member ? `Pour ${member.name} (@${member.username})` : undefined}>
      <Input
        icon={Lock}
        password
        placeholder="4 caractères minimum"
        value={password}
        onChangeText={(t) => { setPassword(t); setError(null); }}
        autoCapitalize="none"
        autoFocus
        error={error}
      />
      <Button
        label="Réinitialiser"
        icon={KeyRound}
        className="mt-5"
        onPress={async () => {
          if (password.length < 4) return setError('Au moins 4 caractères.');
          await onSubmit(password);
          close();
        }}
      />
    </Sheet>
  );
}
