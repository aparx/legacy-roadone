import { NavbarConfig as config } from './Navbar.config';
import { mobileMediaQuery } from '@/utils/device';
import { css, Theme } from '@emotion/react';
import { UI } from 'next-ui';

/** Shadow style for the "shadow" navbar (background in-flow navbar) */
export const shadow = (theme: Theme) =>
  css({
    height: config.height,
    marginBottom: theme.rt.multipliers.spacing('xl'),
  });

/** Style for the main navbar container, containing all the navbar items */
export const navbar = (theme: Theme) =>
  css({
    top: 0,
    width: '100%',
    display: 'flex',
    position: 'fixed',
    background: theme.sys.color.surface[1],
    zIndex: config.zBaseIndex,
    height: config.height,
    /* Drawer */
    [mobileMediaQuery(theme)]: {
      zIndex: config.zDrawerIndex,
    },
  });

export const wrapper = (theme: Theme) =>
  css({
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

/** NavBar's actual items, containing the list and other items (e.g. profile) */
export const items = (theme: Theme) =>
  css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.rt.multipliers.spacing('xl'),
    /* Drawer */
    [mobileMediaQuery(theme)]: {
      position: 'fixed',
      inset: 0,
      left: 'unset',
      width: 'min(60%, 200px)',
      padding: theme.rt.multipliers.spacing(6),
      paddingTop: config.height,
      flexDirection: 'column',
      background: theme.sys.color.surface[2],
    },
  });

/** The navigation element, containing the list of pages */
export const nav = css({
  width: '100%',
});

/** The actual page list (ul-Element), listing all navigable pages */
export const list = (theme: Theme) =>
  css({
    display: 'flex',
    gap: theme.rt.multipliers.spacing('md'),
    /* Within Drawer */
    [mobileMediaQuery(theme)]: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  });

/** The list item style, that usually encapsulates a `pageButton` */
export const listItem = (theme: Theme) =>
  css({
    /* Within Drawer */
    [mobileMediaQuery(theme)]: {
      // This decides about the length of the encapsulated item
      minWidth: '100%',
    },
  });

export const pageButton = (theme: Theme, active: boolean) =>
  css({
    background: !active ? 'transparent !important' : undefined,
    color: !active
      ? `${theme.sys.color.scheme.onSurface} !important`
      : undefined,
    transition: `background ${UI.baseTransitionMs}ms`,
    /* Within Drawer */
    [mobileMediaQuery(theme)]: {
      width: '100% !important',
    },
  });

export const hamburger = (theme: Theme) =>
  css({
    position: 'fixed',
    zIndex: config.zBaseIndex + 1,
    right: 0,
  });
