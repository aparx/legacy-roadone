import { css, Theme } from '@emotion/react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';


/** The app root style, generally used to alter its contents. */
export const appRoot = css({});

const reactSvgComponentToMarkupString = (Component, props) =>
  `data:image/svg+xml,${encodeURIComponent(
    renderToStaticMarkup(createElement(Component, props))
  )}`;

/** The general global style, that applies to the body */
export const appGlobal = ({ sys }: Theme) =>
  css`
    html,
    body {
      color: ${sys.color.scheme.onSurface};
      background: ${sys.color.scheme.background} !important;
    }

    a {
      text-decoration: underline;
      color: unset;
    }
  `;