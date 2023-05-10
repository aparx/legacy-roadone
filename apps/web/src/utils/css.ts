import { desktopMediaQuery, mobileMediaQuery } from '@/utils/device';
import { css, Theme } from '@emotion/react';

export const fullyHiddenStyle = {
  visibility: 'hidden',
  display: 'none !important',
  opacity: 0,
} as const;

/** CSS properties that conditionally completely hide the target element(s) if
 * the device-width is less than or equal `drawerBreakpoint`. */
export const hiddenIfMobile = (theme: Theme) =>
  css({ [mobileMediaQuery(theme)]: fullyHiddenStyle });

/** CSS properties that conditionally completely hide the target element(s) if
 * the `drawerBreakpoint` is exclusively exceeded (width). */
export const hiddenIfDesktop = (theme: Theme) =>
  css({ [desktopMediaQuery(theme)]: fullyHiddenStyle });

// ^ the above functions are helpful to avoid (slow) layout shifting, since
//   media queries are theoretically respected faster than any JS code.
