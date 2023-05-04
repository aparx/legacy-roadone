import { signIn, signOut, useSession } from 'next-auth/react';
import { Button, Card, PageAlign, Stack, Text } from 'next-ui';
import { usePinpointTextProps } from 'next-ui/src/components/Text/Text';
import { FaSearch } from 'react-icons/fa';

export default function Web() {
  const { status, data } = useSession();
  return (
    <>
      <PageAlign
        sd={{ marginTop: 'xl' }}
        {...usePinpointTextProps({ role: 'body', size: 'md' })}
      >
        <Text.Headline size={'lg'} sd={{}}>
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
        <Card width={'md'}>
          <Card.Header subtitle={'et dolore magna aliquyam erat'}>
            <Card.Header.Title>Lorem Ipsum dolor sit</Card.Header.Title>
          </Card.Header>
          <Card.Content>
            At vero eos et accusam et justo duo dolores et ea rebum. Stet clita
            kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
            amet.
          </Card.Content>
          <Card.Footer>
            <Button.Primary tight>
              <FaSearch />
            </Button.Primary>
          </Card.Footer>
        </Card>
      </PageAlign>
    </>
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
