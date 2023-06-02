import { NavbarConfig } from '@/components';
import { Theme } from '@emotion/react';

function getPageViewportOffsetY(theme: Theme) {
  return NavbarConfig.height + (theme.rt.multipliers.spacing('lg') ?? 0);
}

/***
 * Non-experimental function that scrolls `element` into the page viewport (viewport
 * including the top `Navbar`) if it is not already *fully* visible.
 *
 * @param theme the theme that determines the additional spacing between the Navbar
 * and the target element.
 * @param element the target element that is supposed to be fully in view.
 */
export function scrollInViewIfNeeded(theme: Theme, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  if (isInPageViewport(theme, rect)) return;
  const top = rect.top + window.scrollY - getPageViewportOffsetY(theme);
  window.scrollTo({ top, behavior: 'smooth' });
}

export function isInViewport(rect: DOMRect, offsetY: number = 0) {
  return (
    rect.x >= 0 &&
    rect.y >= offsetY &&
    rect.y + rect.height <= window.innerHeight &&
    rect.x + rect.width <= window.innerWidth
  );
}

export function isInPageViewport(theme: Theme, rect: DOMRect) {
  return isInViewport(rect, getPageViewportOffsetY(theme));
}
