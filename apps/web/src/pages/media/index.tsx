import { Page } from '@/components';
import { toastTypeArray } from '@/components/Toast/Toast';
import { useToastHandle } from '@/handles';
import { capitalize } from 'lodash';
import { Button, Skeleton, Stack, TextField } from 'next-ui';
import { v4 as uuidv4 } from 'uuid';

export default function MediaPage() {
  const showToast = useToastHandle((s) => s.add);
  return (
    <Page name={'Medien'} pageURL={'media'}>
      <Skeleton
        width={200}
        height={200}
        baseColor={'black'}
        roundness={'full'}
        scanColor={(t) => t.sys.color.scheme.primaryContainer}
      />
      <Stack
        direction={'row'}
        style={{ position: 'fixed', right: 50, marginTop: 15 }}
      >
        {toastTypeArray.map((type) => (
          <Button.Primary
            key={type}
            onClick={() =>
              showToast({
                type,
                title: `${type}`,
                message: `Lorem ipsum dolor sit amet ${uuidv4()}`,
                duration: 'short',
              })
            }
          >
            {capitalize(type)}
          </Button.Primary>
        ))}
      </Stack>
      <Stack>
        <Button.Secondary>Click</Button.Secondary>
        <TextField
          name={'test'}
          type={'textarea'}
          placeholder={'Placeholder'}
          required
        />
      </Stack>
    </Page>
  );
}
