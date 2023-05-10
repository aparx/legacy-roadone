import { NavbarConfig } from '@/components/Navbar/Navbar.config';
import { useWindowBreakpoint } from '@/utils/context/windowBreakpoint';
import { Theme } from '@emotion/react';

export const mobileBreakpoint = NavbarConfig.drawerBreakpoint;

/**
 * Returns true if the user's window width is mobile-like.
 * The definition of "mobile-like" here is simply put, whenever the device-width
 * is less or equal to when a drawer is used in the navigation instead of the
 * full-sized Navbar.
 *
 * @return `true` if the device-width is mobile and a drawer is used for
 * navigation. If the width is unclear - or is currently being evaluated -
 * `undefined` is returned.
 */
export function useIsMobile(): boolean | undefined {
  return useWindowBreakpoint()?.to?.lte(mobileBreakpoint);
}

/**
 * Exact opposite to `useIsMobile`, whereas a device-width is declared being a
 * `desktop` size, whenever a full-sized navigation is used instead of a drawer.
 * @return `false` if the device-width is mobile and a drawer is used for
 * navigation. If the width is unclear - or is currently being evaluated -
 * `undefined` is returned.
 */
export function useIsDesktop(): boolean | undefined {
  const isMobile = useIsMobile();
  return isMobile !== undefined ? isMobile : undefined;
}

export function mobileMediaQuery(theme: Theme) {
  return theme.rt.breakpoints.lte(mobileBreakpoint);
}

export function desktopMediaQuery(theme: Theme) {
  return theme.rt.breakpoints.lte(mobileBreakpoint, 'not');
}
