import { Page } from '@/components';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button, Card, Stack, Text, TextField } from 'next-ui';
import { FaSearch } from 'react-icons/fa';
import { MdArrowRight, MdPassword, MdTextFields } from 'react-icons/md';

export default function HomePage() {
  const { status, data } = useSession();
  return (
    <Page name={'Startseite'} pageURL={'/home'}>
      <Text.Headline size={'lg'}>Homepage</Text.Headline>
      <Stack direction={'row'} spacing={'lg'} vAlign>
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
          <Button.Primary tight aria-label={'search button'}>
            <FaSearch />
          </Button.Primary>
        </Card.Footer>
      </Card>
      <TextField
        name={'username'}
        placeholder={'Benutzername'}
        leading={<MdTextFields />}
        tailing={<MdArrowRight />}
        error={'Lorem ipsum dolor sit amet'}
      />
      <TextField
        tight
        name={'username'}
        type={'text'}
        placeholder={'Passwort'}
        leading={<MdPassword />}
      />
      <TextField
        name={'username'}
        disabled
        placeholder={'Benutzername'}
        leading
        tailing={<MdArrowRight />}
      />
      <TextField
        tight
        name={'username'}
        placeholder={'Benutzername'}
        type={'tel'}
        leading
      />
    </Page>
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
