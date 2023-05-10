import { fullyHiddenStyle } from '@/utils/css';
import { desktopMediaQuery, mobileMediaQuery } from '@/utils/device';
import { css, Theme } from '@emotion/react';

const infoList = (theme: Theme) =>
  css({
    display: 'flex',
    [desktopMediaQuery(theme)]: {
      gap: theme.rt.multipliers.spacing('md'),
    },
  });

/** Separator that is visible on larger screens (desktop-size), that separates
 *  different Gig information from one-another. */
export const separator = (theme: Theme) =>
  css({
    [desktopMediaQuery(theme)]: {
      '&::before': { content: '"-"' },
    },
    [mobileMediaQuery(theme)]: fullyHiddenStyle,
  });

export const address = (theme: Theme) => [
  infoList,
  css({
    [mobileMediaQuery(theme)]: {
      flexDirection: 'column',
      paddingRight: theme.rt.multipliers.spacing('xl'),
    },
  }),
];

export const time = (theme: Theme) => infoList(theme);
