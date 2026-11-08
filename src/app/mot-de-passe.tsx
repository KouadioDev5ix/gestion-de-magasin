import { router } from 'expo-router';
import { Check, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { StackHeader } from '@/components/Common';
import { Input } from '@/components/Input';
import { toast } from '@/components/Toast';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/useApp';
import { MView } from '@/components/motion';

export default function MotDePasseScreen() {
  const changePassword = useApp((s) => s.changePassword);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e: typeof errors = {};
    if (!current) e.current = 'Saisissez votre mot de passe actuel.';
    if (next.length < 6) e.next = 'Au moins 6 caractères.';
    if (confirm !== next) e.confirm = 'Les mots de passe ne correspondent pas.';
    setErrors(e);
    if (Object.keys(e).length) return haptic.error();

    setLoading(true);
    try {
      await changePassword(current, next);
      toast.success('Mot de passe modifié');
      router.back();
    } catch (err) {
      setErrors({ current: (err as Error).message });
      haptic.error();
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface-app">
      <StackHeader title="Mot de passe" />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20 }}>
          <MView entering={FadeInDown.duration(380)} className="rounded-4xl border border-surface-line bg-surface p-5">
            <Input label="Mot de passe actuel" icon={Lock} password value={current} onChangeText={setCurrent} error={errors.current} autoCapitalize="none" />
            <Input label="Nouveau mot de passe" icon={Lock} password value={next} onChangeText={setNext} error={errors.next} autoCapitalize="none" className="mt-4" />
            <Input
              label="Confirmer"
              icon={Lock}
              password
              value={confirm}
              onChangeText={setConfirm}
              error={errors.confirm}
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={submit}
              className="mt-4"
            />
            <View className="mt-6">
              <Button label="Enregistrer" icon={Check} loading={loading} onPress={submit} />
            </View>
          </MView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
