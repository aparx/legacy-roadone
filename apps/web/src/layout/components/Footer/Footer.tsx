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
          <li>Alexander Zeband</li>
          <li>41569 Rommerskirchen</li>
          <li>Hellenbergstraße 130</li>
          <li>
            E-Mail:{' '}
            <Link href={'mailto:alexanderzeband@yahoo.de'}>
              alexanderzeband@yahoo.de
            </Link>
          </li>
        </Stack>
        <Stack>
          <Stack direction={'row'} as={'ol'} spacer={'•'} vAlign>
            <FooterLink name={'Pressetext'} link={'/kontakt'} />
            <FooterLink name={'Datenschutzerklärung'} link={'/datenschutz'} />
          </Stack>
        </Stack>
      </Stack>
    </section>
  );
}

function FooterLink({ name, link }: { name: string; link: string }) {
  return (
    <ol>
      <Link href={link} css={{ textDecoration: 'none' }}>
        <Button.Text take={{ hPaddingMode: 'oof' }}>{name}</Button.Text>
      </Link>
    </ol>
  );
}
