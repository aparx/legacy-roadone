import { imprintDetails } from '@/utils/imprintDetails';
import { useTheme } from '@emotion/react';
import { Button, Stack, Text } from 'next-ui';
import { usePageAlignProps } from 'next-ui/src/components/PageAlign/PageAlign';
import { usePinpointTextProps } from 'next-ui/src/components/Text/Text';
import Link from 'next/link';

export default function Footer() {
  const theme = useTheme();
  return (
    <section
      style={{
        padding: theme.rt.multipliers.spacing('xxl'),
        background: theme.sys.color.surface[1],
        opacity: 0.75,
      }}
    >
      <Stack spacing={'lg'} {...usePageAlignProps()}>
        <Text.Title size={'md'}>{process.env.NEXT_PUBLIC_SELF_URL}</Text.Title>
        <Stack
          as={'ul'}
          spacing={0}
          {...usePinpointTextProps({ role: 'body', size: 'md' })}
        >
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
        <Stack>
          <Stack direction={'row'} as={'ol'} spacer={'•'} vAlign>
            <li>
              <FooterLink name={'Kontakt'} link={'/kontakt'} />
            </li>
            <li>
              <FooterLink name={'Datenschutzerklärung'} link={'/datenschutz'} />
            </li>
          </Stack>
        </Stack>
      </Stack>
    </section>
  );
}

function FooterLink({ name, link }: { name: string; link: string }) {
  return (
    <Link href={link} css={{ textDecoration: 'none' }}>
      <Button.Text take={{ hPaddingMode: 'oof' }}>{name}</Button.Text>
    </Link>
  );
}
