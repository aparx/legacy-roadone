import { Button, PageAlign, Stack, Text } from 'next-ui';
import { usePageAlignProps } from 'next-ui/src/components/PageAlign/PageAlign';
import { useState } from 'react';

export default function Web() {
  const [, setCount] = useState(0);
  const refreshPage = () => setCount((p) => 1 + p);

  return (
    <div>
      <h1>Web</h1>
      <Stack direction={'column'} spacing={5} {...usePageAlignProps()}>
        <Text.Headline size={'lg'} take={{ fontWeight: 'heavy' }}>
          Buttons
        </Text.Headline>
        <Stack direction={'column'}>
          <Text.Headline size={'md'} emphasis={'medium'}>
            Primary
          </Text.Headline>
          <Stack direction={'row'}>
            <Button.Primary
              link={'https://google.com'}
              size={'md'}
              onClick={refreshPage}
            >
              Primary
            </Button.Primary>
            <Button.Primary size={'sm'} onClick={refreshPage}>
              Primary (II)
            </Button.Primary>
          </Stack>
        </Stack>

        <Stack direction={'column'}>
          <Text.Headline size={'md'} emphasis={'medium'}>
            Secondary
          </Text.Headline>
          <Stack direction={'row'}>
            <Button.Secondary disabled size={'md'} onClick={refreshPage}>
              Secondary (I)
            </Button.Secondary>
            <Button.Secondary size={'sm'} onClick={refreshPage}>
              Secondary (II)
            </Button.Secondary>
          </Stack>
        </Stack>

        <Stack direction={'column'}>
          <Text.Headline size={'md'} emphasis={'medium'}>
            Tertiary
          </Text.Headline>
          <Stack direction={'row'}>
            <Button.Tertiary size={'md'} onClick={refreshPage}>
              Tertiary (I)
            </Button.Tertiary>
            <Button.Tertiary size={'sm'} onClick={refreshPage}>
              Tertiary (II)
            </Button.Tertiary>
          </Stack>
        </Stack>

        <Stack direction={'column'}>
          <Text.Headline size={'md'} emphasis={'medium'}>
            Surface
          </Text.Headline>
          <Stack direction={'row'}>
            <Button.Surface size={'md'} onClick={refreshPage}>
              Surface (I)
            </Button.Surface>
            <Button.Surface size={'sm'} onClick={refreshPage}>
              Surface (II)
            </Button.Surface>
          </Stack>
        </Stack>

        <Stack direction={'column'}>
          <Text.Headline size={'md'} emphasis={'medium'}>
            Text
          </Text.Headline>
          <Stack direction={'row'}>
            <Button.Text size={'md'} onClick={refreshPage}>
              Surface (I)
            </Button.Text>
            <Button.Text size={'sm'} onClick={refreshPage}>
              Surface (II)
            </Button.Text>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
}
