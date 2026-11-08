import { Lock, Phone, ShieldCheck, Store, User } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { View, type TextInputInstance } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Txt } from '@/components/Txt';
import { haptic } from '@/lib/haptics';
import { colors } from '@/lib/theme';
import { useApp } from '@/store/useApp';

type Field = 'shopName' | 'name' | 'username' | 'password' | 'confirm';

export default function RegisterScreen() {
  const registerOwner = useApp((s) => s.registerOwner);
  const nameRef = useRef<TextInputInstance>(null);
  const usernameRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const [form, setForm] = useState<Record<Field, string>>({
    shopName: '',
    name: '',
    username: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: Field) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    if (form.shopName.trim().length < 2) e.shopName = 'Indiquez le nom de votre boutique.';
    if (form.name.trim().length < 2) e.name = 'Indiquez votre nom.';
    if (form.username.trim().length < 3) e.username = 'Au moins 3 caractères (votre numéro par exemple).';
    if (form.password.length < 6) e.password = 'Au moins 6 caractères.';
    if (form.confirm !== form.password) e.confirm = 'Les mots de passe ne correspondent pas.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      haptic.error();
      return;
    }
    setLoading(true);
    try {
      await registerOwner({
        shopName: form.shopName,
        name: form.name,
        username: form.username,
        password: form.password,
      });
      haptic.success();
    } catch (err) {
      setErrors({ username: (err as Error).message });
      haptic.error();
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Bienvenue"
      title="Créez votre boutique"
      subtitle="Votre catalogue et vos prix, toujours à portée de main pour toute l’équipe."
      footer={
        <View className="flex-row items-start gap-2.5">
          <ShieldCheck size={18} color={colors.success} strokeWidth={2.2} style={{ marginTop: 1 }} />
          <Txt className="flex-1 text-[13px] leading-5 text-ink-muted">
            Vous serez le gérant : vous ajoutez les articles et créez les accès de vos vendeurs depuis les Réglages.
          </Txt>
        </View>
      }
    >
      <Input
        label="Nom de la boutique"
        icon={Store}
        placeholder="Ex. Alfred Phone Store"
        value={form.shopName}
        onChangeText={set('shopName')}
        error={errors.shopName}
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => nameRef.current?.focus()}
      />
      <Input
        ref={nameRef}
        label="Votre nom"
        icon={User}
        placeholder="Prénom et nom"
        value={form.name}
        onChangeText={set('name')}
        error={errors.name}
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => usernameRef.current?.focus()}
        className="mt-4"
      />
      <Input
        ref={usernameRef}
        label="Identifiant de connexion"
        icon={Phone}
        placeholder="Ex. 0707070707"
        value={form.username}
        onChangeText={set('username')}
        error={errors.username}
        hint="Votre numéro de téléphone ou un nom d’utilisateur."
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        className="mt-4"
      />
      <Input
        ref={passwordRef}
        label="Mot de passe"
        icon={Lock}
        password
        placeholder="6 caractères minimum"
        value={form.password}
        onChangeText={set('password')}
        error={errors.password}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        className="mt-4"
      />
      <Input
        ref={confirmRef}
        label="Confirmer le mot de passe"
        icon={Lock}
        password
        placeholder="Retapez le mot de passe"
        value={form.confirm}
        onChangeText={set('confirm')}
        error={errors.confirm}
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={submit}
        className="mt-4"
      />
      <View className="mt-6">
        <Button label="Créer ma boutique" onPress={submit} loading={loading} />
      </View>
    </AuthShell>
  );
}
