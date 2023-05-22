import { ButtonConfig as config } from '../Button.config';
import * as style from '../Button.style';
import { memoize } from 'shared-utils';

// (!) Cannot default export due to implementation details
export const textButton = memoize(() => {
  return config.External.treeToModule(['text'], {
    _factory: (theme, opts) => ({
      css: style.button(theme, opts, {
        background: 'transparent',
        foreground: theme.sys.color.scheme.onSurface,
        state: 'surface',
      }),
    }),
    _opts: {
      font: {
        role: 'body',
        size: 'md',
      },
      flowPaddingH: 0.75,
      flowPaddingV: 0.5,
      roundness: 1,
    },
    _size: {
      sm: {
        _opts: {
          font: {
            size: 'sm',
          },
          flowPaddingH: 0.5,
        },
      },
    },
  });
});
