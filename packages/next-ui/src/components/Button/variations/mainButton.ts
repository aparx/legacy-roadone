import { ButtonConfig as config } from '../Button.config';
import * as style from '../Button.style';
import { capitalize } from 'lodash';
import { memoize } from 'shared-utils';

// (!) Cannot default export due to implementation details
export const mainButton = memoize(() => {
  return config.External.treeToModule(
    ['primary', 'secondary', 'surface', 'tertiary'],
    {
      _factory: (theme, opts, type) => ({
        css: style.button(theme, opts, {
          background:
            type !== 'surface'
              ? theme.sys.color.scheme[`${type}Container`]
              : theme.sys.color.scheme.surfaceVariant,
          foreground:
            type !== 'surface'
              ? theme.sys.color.scheme[`on${capitalize(type)}Container`]
              : theme.sys.color.scheme.onSurfaceVariant,
          state: type,
        }),
      }),
      _opts: {
        font: {
          role: 'body',
          size: 'md',
        },
        flowPaddingH: 2,
        flowPaddingV: 1,
        roundness: 1.25,
      },
      _size: {
        sm: {
          _opts: {
            font: {
              size: 'sm',
            },
            flowPaddingH: 1.5,
          },
        },
      },
      _type: {
        primary: {
          _opts: {
            roundness: 1,
          },
        },
      },
    }
  );
});
