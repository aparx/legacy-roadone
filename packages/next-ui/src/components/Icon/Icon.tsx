/** @jsxImportSource @emotion/react */
import {
  propMerge,
  PropsWithStyleable,
  RequiredChildren,
  useStyleableMerge,
} from '../../utils';
import { useDataTextProps } from '../Text/Text';
import { IconConfig as config } from './Icon.config';
import * as style from './Icon.style';
import { jsx, useTheme } from '@emotion/react';
import type { HTMLAttributes, ReactElement } from 'react';
import type { IconBaseProps } from 'react-icons';
import type { TypescaleData, TypescalePinpoint } from 'theme-core';
import { typescalePinpoint } from 'theme-core';

export type InternalIconProps = {
  /** Changes size and min-width as well as min-height to its lineHeight.
   * @default { role: 'body', size: 'md' } */
  font?: TypescalePinpoint;
  /** Special attribute applied to the icon's wrapper, identifying the icon. */
  identify?: string;
} & IconChildrenDiscrimination &
  IconFontDiscrimination;

/** Type that requires either `icon` OR `children` to be present */
type IconChildrenDiscrimination =
  | { icon: ReactElement<IconBaseProps>; children?: undefined }
  | { children: RequiredChildren; icon?: undefined };

/** Type that requires either `font` or `fontData` to be present */
type IconFontDiscrimination =
  | { font?: TypescalePinpoint; fontData?: undefined }
  | { font?: undefined; fontData: TypescaleData };

export type IconProps = PropsWithStyleable<InternalIconProps> &
  HTMLAttributes<HTMLElement>;

export default function Icon({ fontData, font, ...props }: IconProps) {
  const { icon, children, identify, ...rest } = props;
  const theme = useTheme();
  fontData ??= typescalePinpoint(theme, font ?? config.Defaults.font);
  return jsx(
    icon ? 'i' : 'div',
    {
      ...propMerge(
        useDataTextProps({ fontData }),
        {
          css: style.wrapper(fontData),
          [config.identifyHTMLAttribute]: identify,
        },
        useStyleableMerge(rest)
      ),
    },
    <>
      {icon}
      {children}
    </>
  );
}
