import {
  DetailedHTMLFactory,
  DOMFactory,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  ReactElement,
  ReactHTML,
  RefAttributes,
} from 'react';

export type HTMLTag = keyof ReactHTML;

export type TagProp<TTag extends HTMLTag> = { as: TTag };

// prettier-ignore
export type WithTagProp<TTag extends HTMLTag, TProps = {}> =
  Omit<TProps, keyof TagProp<TTag>> & TagProp<TTag>;

// prettier-ignore
export type WithTagAttributes<TTag extends HTMLTag, TProps = {}>
  = TProps & Omit<HTMLPropsFromTag<TTag>, keyof TProps>;

// prettier-ignore
export type WithTagRepresentation<TTag extends HTMLTag, TProps> =
  Partial<WithTagProp<TTag, TProps>> & WithTagAttributes<TTag, TProps>;

export type HTMLAttributesFromFactory<
  TFactory extends DetailedHTMLFactory<any, any>
> = TFactory extends DetailedHTMLFactory<infer TAttribs, any>
  ? TAttribs
  : never;

export type HTMLElementFromFactory<TFactory extends DOMFactory<any, any>> =
  TFactory extends DetailedHTMLFactory<any, infer TElement> ? TElement : never;

export type HTMLFactoryFromTag<TTag extends HTMLTag> = ReactHTML[TTag];

// prettier-ignore
export type HTMLPropsFromTag<TTag extends HTMLTag> =
  HTMLAttributesFromFactory<HTMLFactoryFromTag<TTag>>;

// prettier-ignore
export type HTMLElementFromTag<TTag extends HTMLTag> =
  HTMLElementFromFactory<HTMLFactoryFromTag<TTag>>;

export type HTMLTagRenderer<
  TDefault extends HTMLTag,
  TPropsInternal = {},
  TReturn = ReactElement<unknown>
> = <TTag extends HTMLTag = TDefault>(
  props: _TagRenderer_ForwardProps<TTag, TPropsInternal>
) => TReturn extends ReactElement<unknown>
  ? ReactElement<_TagRenderer_PureProps<TTag, TPropsInternal>, TTag>
  : TReturn;

// prettier-ignore
type _TagRenderer_ForwardProps<TTag extends HTMLTag, TProps> = PropsWithoutRef<
  _TagRenderer_PureProps<TTag, TProps>
> & RefAttributes<HTMLElementFromTag<TTag>>;

// prettier-ignore
type _TagRenderer_PureProps<TTag extends HTMLTag, TProps> =
  WithTagRepresentation<TTag, Omit<TProps, keyof TagProp<TTag>>>;
