/** @jsxImportSource @emotion/react */
import { NavbarConfig as config } from './Navbar.config';
import * as style from './Navbar.style';
import { Hamburger } from '@/components';
import { HamburgerRef } from '@/components/Hamburger/Hamburger';
import { useWindowBreakpoint } from '@/utils/context/windowBreakpoint';
import { useClickOutside } from '@/utils/hooks/useClickOutside';
import { useLocalToggle } from '@/utils/localState';
import { getMessage } from '@/utils/message';
import { useTheme } from '@emotion/react';
import { useSession } from 'next-auth/react';
import type { PropsWithoutChildren } from 'next-ui';
import {
  Button,
  Divider,
  PageAlign,
  propMerge,
  Scrim,
  Text,
  useStyleableMerge,
  WithStyleableProp,
} from 'next-ui';
import { usePageAlignProps } from 'next-ui/src/components/PageAlign/PageAlign';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Children,
  forwardRef,
  ForwardRefExoticComponent,
  HTMLAttributes,
  ReactElement,
  useEffect,
  useId,
  useRef,
} from 'react';
import type { WithArray } from 'shared-utils';

export type Navbar = {
  Page: ForwardRefExoticComponent<NavbarPageProps>;
} & ForwardRefExoticComponent<NavbarProps>;

// prettier-ignore
export type NavbarProps = WithStyleableProp<{
  children: WithArray<ReactElement<NavbarPageProps>>;
} & PropsWithoutChildren<HTMLAttributes<HTMLDivElement>>>;

/** Logo component; for Navbar use only */
const NavLogo = () => (
  <Link href={'/'} css={{ all: 'unset', cursor: 'pointer' }}>
    <Text.Title as={'div'} size={'md'} take={{ fontWeight: 'strong' }}>
      {getMessage('baseName')}
    </Text.Title>
  </Link>
);

export const Navbar = forwardRef<HTMLDivElement, NavbarProps>(
  function NavbarRenderer({ children, ...restProps }, ref) {
    console.log(useWindowBreakpoint());
    return (
      <>
        <div ref={ref} css={style.navbar} {...useStyleableMerge(restProps)}>
          <PageAlign css={style.wrapper}>
            <NavLogo />
            <NavItems pages={children} />
          </PageAlign>
        </div>
        {/* Placeholder to create margin between the navbar and outsiders */}
        <div css={style.shadow} />
      </>
    );
  }
) as Navbar;

export default Navbar;

/** The actual navigation items that can collapse into a drawer (expandable). */
function NavItems({ pages }: { pages: NavbarProps['children'] }) {
  const navId = useId();
  const bp = useWindowBreakpoint();
  const hamburger = useRef<HamburgerRef>(null);
  const expand = useLocalToggle();
  const asDrawer = bp?.to?.lte?.(config.drawerBreakpoint);
  const pageAlign = usePageAlignProps();
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathName = usePathname();
  const lastPathName = useRef<string>();
  useClickOutside(
    () => expand.set(false),
    drawerRef.current,
    hamburger.current?.button?.current
  );
  useEffect(() => {
    // automatically closing the drawer when changing sites
    if (asDrawer && lastPathName.current !== pathName) expand.set(false);
    lastPathName.current = pathName;
  }, [asDrawer, expand, pathName]);
  return (
    <>
      <div
        ref={drawerRef}
        id={navId}
        css={style.items(
          useTheme(),
          asDrawer === undefined || (asDrawer && !expand.state)
        )}
      >
        <NavPages pages={pages} />
        <NavProfile asDrawer={asDrawer} />
      </div>
      {/* TODO TAB INDEX NOT WORKING ( TAB-FOCUSING THE HAMBURGER ) */}
      {asDrawer && (
        <Hamburger
          ref={hamburger}
          label={'expand'}
          controls={navId}
          stateOpen={expand}
          {...propMerge({ css: style.hamburger }, pageAlign)}
        />
      )}
      {asDrawer && expand.state && <Scrim />}
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
  const stackProps = useStackProps({ direction: 'row', vCenter: true });
  return session.data?.user?.image ? (
    <>
      {asDrawer && <Divider />}
      <Text.Body size={'md'} take={{ fontWeight: 'medium' }} {...stackProps}>
        <Image
          src={session.data.user.image}
          alt={'profile picture'}
          width={30}
          height={30}
          style={{ borderRadius: '50px' }}
        />
        {asDrawer && (session.data.user.name ?? '')}
      </Text.Body>
    </>
  ) : null;
}

// prettier-ignore
export type NavbarPageProps = WithStyleableProp<{
  link: string;
  name: string;
}>;

Navbar.Page = forwardRef<HTMLAnchorElement, NavbarPageProps>(
  function NavbarPageRenderer({ link, name, ...restProps }, ref) {
    return (
      <Button.Primary
        link={link}
        ref={ref}
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
