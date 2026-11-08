import { Image } from 'expo-image';
import { Camera, ImagePlus, Images, RefreshCw, X } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { FadeIn, ZoomIn } from 'react-native-reanimated';

import { pickPhoto, type PhotoSource } from '@/lib/photos';
import { colors } from '@/lib/theme';
import { PressableScale } from './PressableScale';
import { Sheet } from './Sheet';
import { toast } from './Toast';
import { Txt } from './Txt';
import { MView } from './motion';

type Props = {
  uri: string | null;
  onChange: (uri: string | null) => void;
};

/** Zone photo de l'article : prise de vue ou galerie, recadrage carré. */
export function PhotoField({ uri, onChange }: Props) {
  const [choosing, setChoosing] = useState(false);

  const choose = async (source: PhotoSource) => {
    setChoosing(false);
    // Laisse la feuille se fermer avant d'ouvrir l'activité native
    await new Promise((r) => setTimeout(r, 250));
    try {
      const picked = await pickPhoto(source);
      if (picked) onChange(picked);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <View>
      <PressableScale scaleTo={0.985} haptics onPress={() => setChoosing(true)} accessibilityLabel="Photo de l'article">
        {uri ? (
          <MView entering={ZoomIn.duration(260)} className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-surface-sunken">
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
            <View className="absolute bottom-3 right-3 flex-row gap-2">
              <View className="h-10 flex-row items-center gap-1.5 rounded-full bg-black/55 px-3.5">
                <RefreshCw size={15} color={colors.white} strokeWidth={2.4} />
                <Txt weight="semibold" className="text-[13px] text-white">
                  Changer
                </Txt>
              </View>
            </View>
          </MView>
        ) : (
          <MView
            entering={FadeIn}
            className="aspect-[4/3] w-full items-center justify-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/60"
          >
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-[22px] bg-brand-600">
              <ImagePlus size={28} color={colors.white} strokeWidth={2} />
            </View>
            <Txt weight="bold" className="text-[15px] text-brand-800">
              Ajouter une photo
            </Txt>
            <Txt className="mt-1 text-xs text-ink-muted">Appareil photo ou galerie</Txt>
          </MView>
        )}
      </PressableScale>

      {uri ? (
        <PressableScale
          haptics
          scaleTo={0.85}
          onPress={() => onChange(null)}
          accessibilityLabel="Retirer la photo"
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-black/55"
        >
          <X size={17} color={colors.white} strokeWidth={2.6} />
        </PressableScale>
      ) : null}

      <Sheet visible={choosing} onClose={() => setChoosing(false)} title="Photo de l’article">
        <View className="flex-row gap-3 pb-2">
          <SourceButton icon={Camera} label="Prendre une photo" onPress={() => choose('camera')} />
          <SourceButton icon={Images} label="Galerie" onPress={() => choose('library')} />
        </View>
      </Sheet>
    </View>
  );
}

function SourceButton({ icon: Icon, label, onPress }: { icon: typeof Camera; label: string; onPress: () => void }) {
  return (
    <PressableScale haptics onPress={onPress} className="flex-1 items-center rounded-3xl border border-surface-line bg-surface-app py-6">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
        <Icon size={24} color={colors.brand} strokeWidth={2} />
      </View>
      <Txt weight="bold" className="text-[14px]">
        {label}
      </Txt>
    </PressableScale>
  );
}
