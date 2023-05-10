/** @jsxImportSource @emotion/react */
import * as style from './Navbar.style';
import { Avatar, Hamburger } from '@/components';
import { HamburgerRef } from '@/components/Hamburger/Hamburger';
import { hiddenIfDesktop, hiddenIfMobile } from '@/utils/css';
import { useIsMobile } from '@/utils/device';
import { useMessage } from '@/utils/hooks/useMessage';
import { useOnNavigation } from '@/utils/hooks/useOnNavigation';
import { useLocalToggle } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import { useTheme } from '@emotion/react';
import { useSession } from 'next-auth/react';
import type { PropsWithoutChildren } from 'next-ui';
import {
  Button,
  Divider,
  PageAlign,
  propMerge,
  PropsWithStyleable,
  Scrim,
  Text,
  useOnClickOutside,
  useStyleableMerge,
} from 'next-ui';
import { usePageAlignProps } from 'next-ui/src/components/PageAlign/PageAlign';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Children,
  forwardRef,
  ForwardRefExoticComponent,
  HTMLAttributes,
  ReactElement,
  useId,
  useRef,
} from 'react';
import type { WithArray } from 'shared-utils';

export type Navbar = {
  Page: ForwardRefExoticComponent<NavbarPageProps>;
} & ForwardRefExoticComponent<NavbarProps>;

// prettier-ignore
export type NavbarProps = PropsWithStyleable<{
  children: WithArray<ReactElement<NavbarPageProps>>;
} & PropsWithoutChildren<HTMLAttributes<HTMLDivElement>>>;

/** Logo component; for Navbar use only */
const NavLogo = () => (
  <Link href={'/'} css={{ all: 'unset', cursor: 'pointer' }}>
    <Text.Title as={'div'} size={'md'} take={{ fontWeight: 'strong' }}>
      {useMessage('app.name')}
    </Text.Title>
  </Link>
);

export const Navbar = forwardRef<HTMLDivElement, NavbarProps>(
  function NavbarRenderer({ children, ...restProps }, ref) {
    return (
      <div ref={ref} css={style.navbar} {...useStyleableMerge(restProps)}>
        <PageAlign ref={ref} css={style.wrapper}>
          <NavLogo />
          <NavItems pages={children} />
        </PageAlign>
      </div>
    );
  }
) as Navbar;

export default Navbar;

/** The actual navigation items that can collapse into a drawer (expandable). */
function NavItems({ pages }: { pages: NavbarProps['children'] }) {
  const theme = useTheme();
  const navId = useId();
  const hamburger = useRef<HamburgerRef>(null);
  const expand = useLocalToggle();
  const isDrawer = useIsMobile();
  // This check ensures no layout shifts with slow devices, since media-queries
  // are executed immediately, before the actual JS logic
  const isDrawerOrInitial = isDrawer === undefined || isDrawer;
  const pageAlign = usePageAlignProps();
  const drawerRef = useRef<HTMLDivElement>(null);
  // Must only be true, if the drawer-state is loading or the drawer collapsed
  const isCollapsed = isDrawer === undefined || (isDrawer && !expand.state);
  useOnClickOutside(
    () => expand.set(false),
    drawerRef,
    hamburger.current?.button
  );
  // automatically close the drawer on navigation
  useOnNavigation(() => expand.set(false));
  return (
    <>
      <div
        ref={drawerRef}
        id={navId}
        css={[style.items, isCollapsed && hiddenIfMobile(theme)]}
      >
        <NavPages pages={pages} />
        <NavProfile asDrawer={isDrawer} />
      </div>
      {isDrawerOrInitial && (
        <Hamburger
          ref={hamburger}
          label={'expand'}
          controls={navId}
          stateOpen={expand}
          css={hiddenIfDesktop(theme)}
          aria-label={
            expand.state
              ? getGlobalMessage('aria.navigation.close')
              : getGlobalMessage('aria.navigation.open')
          }
          {...propMerge({ css: style.hamburger }, pageAlign)}
        />
      )}
      {isDrawerOrInitial && expand.state && (
        <Scrim css={hiddenIfDesktop(theme)} />
      )}
    </>
  );
}

/** Component that lists all given pages in the right order; for Navbar use only. */
function NavPages({ pages }: { pages: NavbarProps['children'] }) {
  return (
    <nav css={style.nav}>
      <ul css={style.list}>
        {Children.map(pages, (child) => {
          return <li css={style.listItem}>{child}</li>;
        })}
      </ul>
    </nav>
  );
}

function NavProfile({ asDrawer }: { asDrawer: boolean | undefined }) {
  const session = useSession();
  const stackProps = useStackProps({ direction: 'row', vAlign: true });
  return session.status === 'authenticated' ? (
    <>
      {asDrawer && <Divider />}
      <Text.Body size={'md'} take={{ fontWeight: 'medium' }} {...stackProps}>
        {session.data?.user?.image && (
          <Avatar
            user={session.data.user}
            size={30}
            name={getGlobalMessage('general.profile_picture')}
          />
        )}
        {asDrawer && session.data?.user?.name}
      </Text.Body>
    </>
  ) : null;
}

// prettier-ignore
export type NavbarPageProps = PropsWithStyleable<{
  link: string;
  name: string;
}>;

Navbar.Page = forwardRef<HTMLAnchorElement, NavbarPageProps>(
  function NavbarPageRenderer({ link, name, ...restProps }, ref) {
    const isDrawerItem = useIsMobile();
    return (
      <Button.Primary
        link={link}
        ref={ref}
        alignContent={isDrawerItem ? 'left' : 'center'}
        {...propMerge(
          { css: style.pageButton(useTheme(), usePathname() === link) },
          restProps
        )}
        style={{ width: '100%' }}
      >
        {name}
      </Button.Primary>
    );
  }
);
