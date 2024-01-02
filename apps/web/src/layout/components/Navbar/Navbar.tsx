/** @jsxImportSource @emotion/react */
import * as style from './Navbar.style';
import { Avatar, Hamburger, Logo } from '@/components';
import { HamburgerRef } from '@/components/Hamburger/Hamburger';
import { logIn, logOut } from '@/modules/auth/utils/logInOut';
import { hiddenIfDesktop, hiddenIfMobile } from '@/utils/css';
import { useIsMobile } from '@/utils/device';
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
import { MdLogin } from 'react-icons/md';
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
  <Link
    aria-hidden
    href={'/'}
    css={{
      all: 'unset',
      cursor: 'pointer',
      '&:hover > svg': {
        fill: useTheme().ref.palette.neutral[90],
      },
    }}
  >
    <Logo
      variant={'spread'}
      height={14}
      fill={(t) => t.sys.color.scheme.onSurface}
    />
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
          aria-label={
            expand.state
              ? getGlobalMessage('aria.navigation.close')
              : getGlobalMessage('aria.navigation.open')
          }
          {...propMerge(
            { css: [style.hamburger, hiddenIfDesktop(theme)] },
            pageAlign
          )}
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
  return (
    <>
      {asDrawer && <Divider />}
      <Text.Body size={'md'} take={{ fontWeight: 'medium' }} {...stackProps}>
        {session.data?.user?.image ? (
          <Avatar
            user={session.data.user}
            size={30}
            name={getGlobalMessage('general.profile_picture')}
            onClick={() => logOut()}
          />
        ) : (
          <Button.Text
            icon={<MdLogin />}
            style={{ opacity: 0.75 }}
            tight
            onClick={() => logIn()}
          >
            Login
          </Button.Text>
        )}
        {asDrawer && session.data?.user?.name}
      </Text.Body>
    </>
  );
}

// prettier-ignore
export type NavbarPageProps = PropsWithStyleable<{
  link: string;
  name: string;
  icon?: ReactElement;
}>;

Navbar.Page = forwardRef<HTMLAnchorElement, NavbarPageProps>(
  function NavbarPageRenderer({ link, name, icon, ...restProps }, ref) {
    const isDrawer = useIsMobile();
    return (
      <Button.Primary
        tight={isDrawer}
        link={link}
        ref={ref}
        leading={isDrawer && icon}
        alignContent={isDrawer ? 'left' : 'center'}
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