import { MemberItem } from '../../modules/home/components/MemberItem';
import imageBackground from '../../public/images/background.png';
import { Logo, Repeat } from '@/components';
import { NavbarConfig, Page } from '@/layout/components';
import { CONTENT_TOP_MARGIN } from '@/layout/components/Page/Page';
import { EventModel } from '@/modules/event/event';
import LatestContentCard from '@/modules/home/components/LatestContentCard/LatestContentCard';
import { MemberModel } from '@/modules/home/member';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { getGlobalMessage } from '@/utils/message';
import { css, keyframes, useTheme } from '@emotion/react';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { signIn, signOut } from 'next-auth/react';
import { Button, Card, Skeleton, Stack } from 'next-ui';
import Image from 'next/image';
import { useMemo } from 'react';
import { MdArrowForward } from 'react-icons/md';
import superjson from 'superjson';

/** The limit of number of event cards displayed and fetched */
const eventCardLimit = 2;

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: { session: null },
    transformer: superjson,
  });
  await helpers.member.get.prefetch();
  await helpers.event.get.prefetchInfinite({});
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: Globals.isrIntervals.home,
  };
}

export default function HomePage() {
  const { data: memberData } = api.member.get.useQuery();
  const { data: eventData } = api.event.get.useInfiniteQuery({});
  const events: EventModel[] | undefined = useMemo(
    () => eventData?.pages?.flatMap((p) => p.data),
    [eventData?.pages]
  );

  const t = useTheme();

  const dynamicCardProps = css({
    minWidth: 400,
    maxWidth: 600,
    flex: '1 1 0',
    [t.rt.breakpoints.lte('sm')]: {
      minWidth: 200,
    },
  });

  return (
    <Page name={'Startseite'} page={'home'} sd={{ marginTop: 0 }}>
      <HomeHeader height={375} />
      <Stack
        as={'main'}
        spacing={'xxl'}
        aria-flowto={'info members updates'}
        css={{
          marginTop: t.rt.multipliers.spacing(CONTENT_TOP_MARGIN),
          [t.rt.breakpoints.lte('lg')]: {
            flexDirection: 'column-reverse',
            gap: `${t.rt.multipliers.spacing('xxl')}px !important`,
          },
        }}
      >
        <MemberList members={memberData} />
        <Stack direction={'row'} hAlign sd={{ width: '100%' }} wrap>
          <Card id={'info'} tight css={dynamicCardProps} keepPadding>
            <Card.Header>
              <Card.Header.Title>Wir sind Mowtown!</Card.Header.Title>
            </Card.Header>
            <Card.Content>
              Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
              nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
              erat, sed diam voluptua. At vero eos et accusam et justo duo
              dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
              sanctus.
            </Card.Content>
          </Card>
          <Card
            id={'updates'}
            tight
            css={dynamicCardProps}
            sd={{ padding: 'md' }}
          >
            <Card.Content style={{ height: '100%' }}>
              <Stack
                spacing={'sm'}
                css={{
                  height: '100%',
                  '> *': { height: '100%' },
                }}
              >
                {events ? (
                  events?.map((event) => (
                    <LatestContentCard key={event.id} {...event} />
                  ))
                ) : (
                  <Repeat amount={eventCardLimit}>
                    <Skeleton style={{ width: '100%', height: '100%' }} />
                  </Repeat>
                )}
              </Stack>
            </Card.Content>
          </Card>
        </Stack>
      </Stack>
    </Page>
  );
}

/**
 * Visual list of members of the band.
 */
function MemberList(props: { members: MemberModel[] | undefined }) {
  const { members } = props;
  return (
    <Stack
      id={'members'}
      as={'ul'}
      hAlign
      direction={'row'}
      spacing={'md'}
      wrap
      aria-label={getGlobalMessage('aria.home.memberList')}
    >
      {members?.map((x, index) => (
        <MemberItem key={x.id} index={index} member={x} />
      ))}
    </Stack>
  );
}

/**
 * Header representing the hero area of the "Home" page.
 */
function HomeHeader(props: { height: number }) {
  const { height } = props;
  const theme = useTheme();
  // prettier-ignore
  const { sys: { color: { scheme } } } = theme;

  // prettier-ignore
  const backAnim = useMemo(() => keyframes({
    from: { transform: 'scale(1.2)' },
    to: { transform: 'scale(1.1)' }
  }), []);

  // prettier-ignore
  const logoAnim = useMemo(() => keyframes({
    from: { transform: 'scale(.9)' },
    to: { transform: 'scale(1)' }
  }), []);

  // Animation interpolation for `backAnim` & `logoAnim`
  const intrpl = 'cubic-bezier(0, 0, 0.1, 0.75)';
  const duration = '.75s';

  const backdropIndex = NavbarConfig.zBaseIndex - 2;
  return (
    <Stack vAlign hAlign style={{ height }}>
      {/* Backdrop */}
      <div
        css={{
          position: 'absolute',
          zIndex: backdropIndex,
          width: '100%',
          height,
          overflow: 'hidden',
          background: `
            radial-gradient(
              circle at 25% -20%, 
              ${scheme.primaryContainer} 5%, 
              transparent 20%
            ),
            radial-gradient(
              circle at 75% 120%, 
              ${scheme.primaryContainer} 5%, 
              transparent 20%
            ),
            linear-gradient(
              175deg, 
              ${scheme.primaryContainer} 0%, 
              ${scheme.background} 50%
            )
          `,
        }}
      >
        <Image
          aria-hidden
          src={imageBackground}
          alt={'Backdrop'}
          fill
          style={{
            filter: 'saturate(0) blur(5px)',
            opacity: 0.4,
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          css={{ animation: `${backAnim} ${duration} ${intrpl} forwards` }}
        />
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: theme.ref.palette.neutral[10],
            opacity: 0.5,
          }}
        />
      </div>
      {/* Content */}
      <Stack
        spacing={'xxl'}
        hAlign
        style={{
          position: 'absolute',
          zIndex: 1 + backdropIndex,
        }}
      >
        <Logo
          width={165}
          css={{ animation: `${logoAnim} ${duration} ${intrpl} forwards` }}
        />
        <HeroCallToAction />
      </Stack>
    </Stack>
  );
}

/**
 * Hero-Area Call-To-Action Button
 */
function HeroCallToAction() {
  // prettier-ignore
  const btnAnim = useMemo(() => keyframes({
    from: { transform: 'translateX(0%)' },
    '15%': { transform: 'translateX(125%)' },
    '16%': { color: 'transparent', transform: 'translateX(-150%)' },
    '40%': { color: 'unset', transform: 'translateX(0%)' }
  }), []);

  return (
    <Button.Primary
      link={'/gigs'}
      leading={<MdArrowForward size={18} />}
      css={{
        '& .leading': {
          overflow: 'hidden',
          '& > *': { animation: `${btnAnim} 1.5s linear .5s infinite` },
        },
      }}
    >
      Auftritte ansehen
    </Button.Primary>
  );
}

function SignIn() {
  return (
    <Button.Primary onClick={() => signIn('google')}>Sign in</Button.Primary>
  );
}

function SignOut() {
  return <Button.Tertiary onClick={() => signOut()}>Sign out</Button.Tertiary>;
}
