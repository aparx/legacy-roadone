import { Page } from '@/layout/components';
import { ContactDownloadLink } from '@/modules/contact/components';
import { MemberModel } from '@/modules/home/member';
import { apiRouter } from '@/server/routers/_api';
import { api, queryClient } from '@/utils/api';
import { Globals } from '@/utils/global/globals';
import { imprintDetails } from '@/utils/imprintDetails';
import { useTheme } from '@emotion/react';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { Card, Icon, Skeleton, Stack, Text } from 'next-ui';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { MdDownload } from 'react-icons/md';
import superjson from 'superjson';

export type ContactPageProps = {};

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    queryClient,
    router: apiRouter,
    ctx: { session: null },
    transformer: superjson,
  });
  await helpers.member.get.prefetch();
  return {
    props: { trpcState: helpers.dehydrate() },
    revalidate: Globals.isrIntervals.home,
  };
}

// <==> /kontakt <==>
export default function ContactPage() {
  const theme = useTheme();

  return (
    <Page
      name={'Kontakt'}
      page={'kontakt'}
      {...useStackProps({ hAlign: true })}
    >
      <Stack hAlign style={{ width: 'fit-content' }} spacing={'xxl'}>
        <Text.Display as={'h1'} size={'md'}>
          Kontakt
        </Text.Display>
        <Stack>
          <MemberSection />
          <Stack hAlign direction={'row'} style={{ width: '100%' }} wrap>
            <Card
              as={'article'}
              keepPadding
              sd={{
                width: '100%',
                minWidth: 250,
                maxWidth: theme.rt.breakpoints.point('md'),
                flex: '1 1 0',
              }}
            >
              <Card.Header
                title={'Für Veranstalter'}
                subtitle={'Informationen für Veranstalter'}
              />
              <Card.Content {...useStackProps({})}>
                <ContactDownloadLink
                  title={'Stageplan'}
                  objectId={'stageplan.jpg'}
                />
                <ContactDownloadLink title={'Plakat'} objectId={'plakat.pdf'} />
              </Card.Content>
            </Card>
            <Card
              as={'article'}
              keepPadding
              sd={{
                width: '100%',
                minWidth: 250,
                maxWidth: theme.rt.breakpoints.point('md'),
                flex: '1 1 0',
              }}
            >
              <Card.Header
                title={'Für die Presse'}
                subtitle={'Informationen für die Presse'}
              />
              <Card.Content {...useStackProps({})}>
                <ContactDownloadLink
                  title={'Pressetext'}
                  objectId={'pressetext.pdf'}
                />
              </Card.Content>
            </Card>
          </Stack>
          <Card
            aria-hidden={true /* Is already shown through footer */}
            style={{ width: '100%', maxWidth: '100%' }}
          >
            <Card.Content>
              <Stack as={'ol'} spacing={0}>
                <li>{imprintDetails.owner}</li>
                <li>{imprintDetails.city}</li>
                <li>{imprintDetails.street}</li>
                <li>
                  E-Mail:{' '}
                  <Link href={`mailto:${imprintDetails.email}`}>
                    {imprintDetails.email}
                  </Link>
                </li>
              </Stack>
            </Card.Content>
          </Card>
        </Stack>
      </Stack>
    </Page>
  );
}

function MemberSection() {
  const { data: memberData } = api.member.get.useQuery();
  return (
    <Stack hAlign direction={'row'} style={{ width: '100%' }} wrap>
      {memberData?.map((member) => (
        <MemberPicture key={member.id} member={member} />
      ))}
    </Stack>
  );
}

function MemberPicture({ member }: { member: MemberModel }) {
  const fileSuffix = member.image?.substring(
    member.image.lastIndexOf('.'),
    member.image.length
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const theme = useTheme();
  return (
    <Link
      aria-label={`Bild von ${member.firstName} ${member.lastName} herunterladen`}
      href={`${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${member.image}`}
      download={`${member.firstName} ${member.lastName}.${fileSuffix}`}
    >
      <div
        style={{
          position: 'relative',
          width: 150,
          height: 200,
          overflow: 'hidden',
          borderRadius: theme.rt.multipliers.roundness('md'),
        }}
      >
        {!imageLoaded && <Skeleton style={{ width: '100%', height: '100%' }} />}
        <Image
          aria-hidden={true}
          src={`${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${member.image}`}
          alt={`Bild von ${member.firstName} ${member.lastName}`}
          fill
          onLoad={() => setImageLoaded(true)}
          style={{
            filter: 'saturate(0)',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: theme.rt.multipliers.spacing('md'),
            right: theme.rt.multipliers.spacing('md'),
            padding: theme.rt.multipliers.spacing('sm'),
            background: theme.sys.color.scheme.secondaryContainer,
            color: theme.sys.color.scheme.primary,
            borderRadius: theme.rt.multipliers.roundness('md'),
          }}
        >
          <Icon icon={<MdDownload size={24} />} />
        </div>
      </div>
    </Link>
  );
}
