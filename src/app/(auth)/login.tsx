import { Lock, LogIn, User } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Pressable, View, type TextInputInstance } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Txt } from '@/components/Txt';
import { haptic } from '@/lib/haptics';
import { colors } from '@/lib/theme';
import { useApp } from '@/store/useApp';

export default function LoginScreen() {
  const login = useApp((s) => s.login);
  const shopName = useApp((s) => s.shopName);
  const resetAll = useApp((s) => s.resetAll);
  const passwordRef = useRef<TextInputInstance>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) {
      setError('Renseignez votre identifiant et votre mot de passe.');
      haptic.error();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      haptic.success();
      // La garde de navigation redirige automatiquement vers l'application.
    } catch (e) {
      setError((e as Error).message);
      haptic.error();
      setLoading(false);
    }
  };

  // Outil de développement uniquement : jamais présent dans l'application de production.
  const confirmReset = () =>
    Alert.alert(
      'Réinitialiser l’application ?',
      'Toutes les données de cet appareil seront effacées : boutique, comptes, catégories et articles. Vous pourrez recréer la boutique.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Tout effacer', style: 'destructive', onPress: resetAll },
      ],
    );

  return (
    <AuthShell
      eyebrow={shopName || 'Espace boutique'}
      title="Bon retour parmi nous"
      subtitle="Connectez-vous pour consulter le catalogue et les prix."
      footer={
        <View>
          <Txt className="text-center text-[13px] leading-5 text-ink-muted">
            Identifiants oubliés ? Demandez au gérant de la boutique de réinitialiser votre accès.
          </Txt>
          {__DEV__ ? (
            <Pressable onPress={confirmReset} hitSlop={10} className="mt-6 items-center">
              <Txt weight="semibold" style={{ fontSize: 13, color: colors.danger }}>
                Réinitialiser l’application (mode développement)
              </Txt>
            </Pressable>
          ) : null}
        </View>
      }
    >
      <Input
        label="Identifiant"
        icon={User}
        placeholder="Téléphone ou nom d’utilisateur"
        value={username}
        onChangeText={(t) => {
          setUsername(t);
          setError(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <Input
        ref={passwordRef}
        label="Mot de passe"
        icon={Lock}
        password
        placeholder="••••••"
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setError(null);
        }}
        autoCapitalize="none"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={submit}
        error={error}
        className="mt-4"
      />
      <View className="mt-6">
        <Button label="Se connecter" icon={LogIn} onPress={submit} loading={loading} />
      </View>
    </AuthShell>
  );
}
