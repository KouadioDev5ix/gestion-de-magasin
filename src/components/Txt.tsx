import { Text, type TextProps } from 'react-native';

import { fonts, type FontWeight } from '@/lib/theme';

type Props = TextProps & {
  weight?: FontWeight;
  className?: string;
};

/** Texte de base : police Plus Jakarta Sans, couleur encre par défaut. */
export function Txt({ weight = 'regular', className = '', style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      allowFontScaling={false}
      className={`text-ink ${className}`}
      style={[{ fontFamily: fonts[weight], includeFontPadding: false }, style]}
    />
  );
}
