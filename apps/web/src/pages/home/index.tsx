import { signIn, signOut, useSession } from 'next-auth/react';
import { Button, PageAlign, Stack, Text } from 'next-ui';
import { usePinpointTextProps } from 'next-ui/src/components/Text/Text';

export default function Web() {
  const { status, data } = useSession();
  return (
    <PageAlign {...usePinpointTextProps({ role: 'body', size: 'md' })}>
      <Text.Headline
        size={'lg'}
        sd={{
          roundness: 'lg',
          background: (t) => t.sys.color.scheme.primaryContainer,
          color: (t) => t.sys.color.scheme.onPrimaryContainer,
          marginV: 'xxl',
          padding: 'xl',
        }}
      >
        Homepage
      </Text.Headline>
      <Stack direction={'row'} spacing={'lg'} vCenter>
        <Text.Title size={'md'}>
          <Stack direction={'row'}>
            Welcome, {data?.user?.email ?? '[Please Sign In]'}
          </Stack>
        </Text.Title>
        {status === 'authenticated' ? <SignOut /> : <SignIn />}
      </Stack>
    </PageAlign>
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
