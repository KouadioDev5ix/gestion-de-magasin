import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const PHOTOS_DIR = 'articles';

export type PhotoSource = 'camera' | 'library';

/** Ouvre la caméra ou la galerie. Renvoie l'URI temporaire, ou null si annulé. */
export async function pickPhoto(source: PhotoSource): Promise<string | null> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.75,
  };

  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error("L'accès à l'appareil photo a été refusé.");
    const res = await ImagePicker.launchCameraAsync(options);
    return res.canceled ? null : (res.assets[0]?.uri ?? null);
  }

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("L'accès aux photos a été refusé.");
  const res = await ImagePicker.launchImageLibraryAsync(options);
  return res.canceled ? null : (res.assets[0]?.uri ?? null);
}

/** Copie la photo dans le stockage permanent de l'app (le cache du picker peut être vidé). */
export async function persistPhoto(tempUri: string, articleId: string): Promise<string> {
  const dir = new Directory(Paths.document, PHOTOS_DIR);
  dir.create({ idempotent: true, intermediates: true });
  const raw = tempUri.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  const ext = /^(jpe?g|png|webp|heic)$/.test(raw) ? raw : 'jpg';
  const dest = new File(dir, `${articleId}-${Date.now()}.${ext}`);
  await new File(tempUri).copy(dest);
  return dest.uri;
}

/** Supprime une photo copiée par l'app ; ignore les autres URIs. */
export function deletePhoto(uri?: string | null) {
  if (!uri || !uri.includes(`/${PHOTOS_DIR}/`)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // fichier déjà absent : rien à faire
  }
}
