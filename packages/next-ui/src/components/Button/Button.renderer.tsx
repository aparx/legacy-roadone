import { useOnEvent } from '../../hooks';
import { propMerge, useStyleableMerge } from '../../utils';
import { multiRef } from '../../utils/mutliRef';
import { useDataTextProps } from '../Text/Text';
import type {
  ButtonOptions,
  ButtonProps,
  ButtonSize,
  ButtonType,
} from './Button';
import { ButtonConfig as config } from './Button.config';
import { Theme, useTheme } from '@emotion/react';
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
  useRef,
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
      tight,
      ...restProps
    }: TProps,
    ref: ForwardedRef<HTMLElementFromButtonProps<TProps>>
  ) {
    const theme = useTheme();
    const visual = appearance[size];
    const opts = merge({}, visual, take);
    if (tight) opts.hPadding = opts.vPadding;
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
          useStyleableMerge(restProps)
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
    const action = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const onPress = () => action.current.setAttribute('data-pressed', 'true');
    const onLoose = () => action.current.setAttribute('data-pressed', 'false');
    useOnEvent('mousedown', onPress, action.current);
    useOnEvent('touchstart', onPress, action.current);
    useOnEvent('mouseup', onLoose, action.current);
    useOnEvent('touchend', onLoose, action.current);
    return link ? (
      <Link
        href={link}
        aria-disabled={disabled}
        {...restProps}
        ref={multiRef(action, ref)}
      >
        {children}
      </Link>
    ) : (
      <button disabled={disabled} {...restProps} ref={multiRef(action, ref)}>
        {children}
      </button>
    );
  }
);
ButtonLink.displayName = 'ButtonLink';
