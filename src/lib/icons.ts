import {
  BatteryCharging,
  Cable,
  Camera,
  Gamepad2,
  Headphones,
  Keyboard,
  Laptop,
  MemoryStick,
  Mouse,
  Package,
  Plug,
  Shield,
  Smartphone,
  Speaker,
  Tablet,
  Watch,
  type LucideIcon,
} from 'lucide-react-native';

export const CATEGORY_ICONS = {
  smartphone: Smartphone,
  tablet: Tablet,
  shield: Shield,
  cable: Cable,
  battery: BatteryCharging,
  plug: Plug,
  headphones: Headphones,
  speaker: Speaker,
  watch: Watch,
  memory: MemoryStick,
  laptop: Laptop,
  keyboard: Keyboard,
  mouse: Mouse,
  gamepad: Gamepad2,
  camera: Camera,
  package: Package,
} satisfies Record<string, LucideIcon>;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS) as CategoryIconKey[];

export function getCategoryIcon(key?: string): LucideIcon {
  return (key && CATEGORY_ICONS[key as CategoryIconKey]) || Package;
}
