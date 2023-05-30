/** @jsxImportSource @emotion/react */
import {
  HTMLElementFromTag,
  HTMLTag,
  HTMLTagRenderer,
  propMerge,
  PropsWithoutChildren,
  PropsWithStyleable,
  StyleableProp,
  useStyleableMerge,
  WithTagRepresentation,
} from '../../utils';
import { useStackProps } from '../Stack/Stack';
import { Text } from '../Text';
import { TextTypeProps } from '../Text/Text';
import { CardConfig as config } from './Card.config';
import * as style from './Card.style';
import { jsx, useTheme } from '@emotion/react';
import {
  ForwardedRef,
  forwardRef,
  ForwardRefExoticComponent,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import type { BreakpointName } from 'theme-core';

export type Card = {
  Header: {
    Title: ForwardRefExoticComponent<CardTitleProps>;
    Subtitle: ForwardRefExoticComponent<CardTitleProps>;
  } & ForwardRefExoticComponent<CardHeaderProps>;
  Content: ForwardRefExoticComponent<CardContentProps>;
  Footer: ForwardRefExoticComponent<CardFooterProps>;
} & HTMLTagRenderer<
  typeof config.Defaults.tag,
  InternalCardProps,
  ReactElement
>;

export type InternalCardProps = (
  | {
      width: BreakpointName | false;
      /** If false, stretches the width to 100%.
       * @default false */
      tight?: boolean | undefined;
    }
  | {
      width?: undefined;
      /** If false, stretches the width to 100%.
       * @default false */
      tight?: undefined;
    }
) & {
  /** If true, keeps the Card's padding regardless of the device's width. */
  keepPadding?: boolean;
} & PropsWithoutChildren &
  StyleableProp;

// prettier-ignore
export type CardProps<TTag extends HTMLTag> =
  WithTagRepresentation<TTag, InternalCardProps>;

export const Card = forwardRef(function CardRenderer<TTag extends HTMLTag>(
  {
    as,
    children,
    width = config.defaults.width,
    tight,
    keepPadding,
    ...rest
  }: CardProps<TTag>,
  ref: ForwardedRef<HTMLElementFromTag<TTag>>
) {
  return jsx(
    as ?? config.Defaults.tag,
    propMerge(
      { css: style.card(useTheme(), width, tight ?? true, !!keepPadding) },
      { ref },
      useStyleableMerge(rest)
    ),
    children
  );
}) as HTMLTagRenderer<
  typeof config.Defaults.tag,
  InternalCardProps,
  ReactElement
> as Card;

export default Card;

// <====================>
//      CARD HEADER
// <====================>

// prettier-ignore
export type CardHeaderProps = PropsWithStyleable<{
  children?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
} & HTMLAttributes<HTMLElement>>;

Card.Header = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeaderRenderer({ children, title, subtitle, ...rest }, ref) {
    return (
      <header css={style.header} ref={ref} {...useStyleableMerge(rest)}>
        {subtitle && <Card.Header.Subtitle>{subtitle}</Card.Header.Subtitle>}
        {title && <Card.Header.Title>{title}</Card.Header.Title>}
        {children}
      </header>
    );
  }
) as Card['Header'];

// <====================>
//   CARD HEADER TITLE
// <====================>

// prettier-ignore
export type CardTitleProps = PropsWithStyleable<{
  children: ReactNode;
} & Partial<Omit<TextTypeProps<'div'>, 'size' | 'children'>>>;

// eslint-disable-next-line react/display-name
Card.Header.Title = forwardRef<HTMLDivElement, CardTitleProps>(
  ({ children, ...rest }, ref) => (
    <Text.Headline
      size={'md'}
      ref={ref}
      {...propMerge(
        useStackProps({ direction: 'row', vAlign: true }),
        useStyleableMerge(rest)
      )}
    >
      {children}
    </Text.Headline>
  )
);
// eslint-disable-next-line react/display-name
Card.Header.Subtitle = forwardRef<HTMLDivElement, CardTitleProps>(
  ({ children, ...rest }, ref) => (
    <Text.Label
      size={'lg'}
      emphasis={'low'}
      ref={ref}
      {...useStyleableMerge(rest)}
    >
      {children}
    </Text.Label>
  )
);

// <====================>
//      CARD CONTENT
// <====================>

export type CardContentProps = PropsWithStyleable<
  HTMLAttributes<HTMLDivElement>
>;

Card.Content = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContentRenderer({ children, ...rest }, ref) {
    return (
      <Text.Body
        size={'lg'}
        emphasis={'medium'}
        color={(t) => t.sys.color.scheme.onSurface}
        ref={ref}
        {...useStyleableMerge(rest)}
      >
        {children}
      </Text.Body>
    );
  }
);

// <====================>
//      CARD FOOTER
// <====================>

// prettier-ignore
export type CardFooterProps = PropsWithStyleable<{
  children?: ReactNode;
} & PropsWithoutChildren<HTMLAttributes<HTMLElement>>>;

Card.Footer = forwardRef<HTMLElement, CardFooterProps>(
  function CardFooterRenderer({ children, ...rest }, ref) {
    return (
      <section
        {...propMerge({ css: style.footer }, { ref }, useStyleableMerge(rest))}
      >
        {children}
      </section>
    );
  }
);
