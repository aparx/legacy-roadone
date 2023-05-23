import { propMerge, useStyleableMerge } from '../../utils';
import { multiRef } from '../../utils/mutliRef';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { useDataTextProps, useFontData } from '../Text/Text';
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
  ButtonHTMLAttributes,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  PropsWithoutRef,
  ReactElement,
  RefAttributes,
  useRef,
} from 'react';

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
      alignContent = config.Defaults.alignContent,
      tailing,
      tight,
      icon,
      ...restProps
    }: TProps,
    ref: ForwardedRef<HTMLElementFromButtonProps<TProps>>
  ) {
    const theme = useTheme();
    const visual = appearance[size];
    const opts = merge({}, visual, take);
    if (tight) opts.hPadding = opts.vPadding;
    const fontData = useFontData(opts.font);
    return (
      <ButtonLink
        ref={ref}
        link={link}
        disabled={disabled}
        {...propMerge(
          useDataTextProps({
            fontData,
            emphasis: disabled ? 'disabled' : 'high',
          }),
          factory?.(theme, opts, type),
          useStyleableMerge(restProps)
        )}
      >
        <Stack direction={'row'} hAlign={alignContent} spacing={0.5}>
          {leading && <Icon fontData={fontData}>{leading}</Icon>}
          {icon && (
            <Icon
              fontData={fontData}
              icon={icon}
              style={{ fontSize: '105%' }}
            />
          )}
          {children && <div>{children}</div>}
          {tailing && <Icon fontData={fontData}>{tailing}</Icon>}
        </Stack>
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
} & ButtonHTMLAttributes<HTMLElement>;

const ButtonLink = forwardRef<any, ButtonLinkProps>(
  ({ link, children, disabled, type, ...restProps }, ref) => {
    const action = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    // TODO touch events for `data-pressed` attribute
    // const onPress = () => action.current.setAttribute('data-pressed', 'true');
    // const onLoose = () => action.current.setAttribute('data-pressed', 'false');
    // useOnEvent('touchstart', onPress, action.current);
    // useOnEvent('touchend', onLoose, action.current);
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
      <button
        disabled={disabled}
        type={type ?? 'button'}
        {...restProps}
        ref={multiRef(action, ref)}
      >
        {children}
      </button>
    );
  }
);
ButtonLink.displayName = 'ButtonLink';
