import { propMerge } from '../../utils';
import { useDataTextProps } from '../Text/Text';
import type {
  ButtonProps,
  ButtonOptions,
  ButtonType,
  ButtonSize,
} from './Button';
import { ButtonConfig as config } from './Button.config';
import { useTheme } from '@emotion/react';
import { Theme } from '@emotion/react';
import { WithConditionalCSSProp } from '@emotion/react/types/jsx-namespace';
import { merge } from 'lodash';
import Link from 'next/link';
import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  PropsWithoutRef,
  ReactElement,
  RefAttributes,
} from 'react';
import { typescalePinpoint } from 'theme-core';

// prettier-ignore
export type HTMLElementFromButtonProps<TProps extends ButtonProps> =
  undefined extends TProps['link'] ? HTMLButtonElement : HTMLAnchorElement;

export type ButtonRenderPropFactory<TType extends ButtonType> = (
  theme: Theme,
  opts: ButtonOptions,
  type: TType
) => WithConditionalCSSProp<HTMLAttributes<any>> &
  Omit<HTMLAttributes<HTMLElement>, 'children'>;

export type SizeBasedButtonOptions = Record<ButtonSize, ButtonOptions>;

export function createButtonRenderer<TType extends ButtonType>(
  type: TType,
  appearance: SizeBasedButtonOptions,
  factory?: ButtonRenderPropFactory<TType>
) {
  return forwardRef(function ButtonRenderer<TProps extends ButtonProps>(
    {
      link,
      disabled,
      take,
      children,
      leading,
      size = config.Defaults.size,
      tailing,
      evenPadding,
      ...restProps
    }: TProps,
    ref: ForwardedRef<HTMLElementFromButtonProps<TProps>>
  ) {
    const theme = useTheme();
    const opts = merge({}, appearance[size], take);
    if (evenPadding) opts.hPadding = opts.vPadding;
    return (
      <ButtonLink
        ref={ref}
        link={link}
        disabled={disabled}
        {...propMerge(
          useDataTextProps({
            fontData: typescalePinpoint(theme, opts.font),
            emphasis: disabled ? 'disabled' : 'high',
          }),
          factory?.(theme, opts, type),
          restProps
        )}
      >
        <div>
          {leading && <div>{leading}</div>}
          <div>{children}</div>
          {tailing && <div>{tailing}</div>}
        </div>
      </ButtonLink>
    );
  }) as <TProps extends ButtonProps>(
    props: PropsWithoutRef<TProps> &
      RefAttributes<HTMLElementFromButtonProps<TProps>>
  ) => ReactElement<TProps>;
}

type ButtonLinkProps = {
  link: string | undefined;
  children: ButtonProps['children'];
  disabled: ButtonProps['disabled'];
} & object;

const ButtonLink = forwardRef<any, ButtonLinkProps>(
  ({ link, children, disabled, ...restProps }, ref) => {
    return link ? (
      <Link href={link} aria-disabled={disabled} {...restProps} ref={ref}>
        {children}
      </Link>
    ) : (
      <button disabled={disabled} {...restProps} ref={ref}>
        {children}
      </button>
    );
  }
);
ButtonLink.displayName = 'ButtonLink';
