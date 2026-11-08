/** Valeurs utilisées hors des classes Tailwind (icônes, animations, dégradés). */
export const colors = {
  brand: '#4F46E5',
  brandDark: '#352EA2',
  brandDeep: '#1C1A4B',
  brandSoft: '#EEF0FF',
  ink: '#0B1220',
  inkSoft: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  line: '#E6E8EF',
  app: '#F5F6FA',
  white: '#FFFFFF',
  success: '#0F9D74',
  danger: '#E5484D',
  warning: '#F59E0B',
} as const;

/** Palette proposée pour les catégories */
export const CATEGORY_COLORS = [
  '#4F46E5',
  '#0EA5E9',
  '#0F9D74',
  '#F59E0B',
  '#E5484D',
  '#D946EF',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
  '#64748B',
] as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export type FontWeight = keyof typeof fonts;

/** Ressorts partagés : rapides, sans rebond excessif */
export const springs = {
  snappy: { damping: 18, stiffness: 260, mass: 0.6 },
  gentle: { damping: 20, stiffness: 160, mass: 0.8 },
} as const;

/** Couleur hexadécimale + opacité -> rgba() */
export function alpha(hex: string, opacity: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
