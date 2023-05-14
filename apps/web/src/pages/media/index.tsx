import { Page } from '@/components';
import { toastTypeArray } from '@/components/Toast/Toast';
import { useToastHandle } from '@/handles';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack, TextField } from 'next-ui';
import { useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const schema = z.object({
  username: z.string(),
  password: z.string(),
  age: z.number().min(18),
});

export default function MediaPage() {
  const methods = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const [errors, setErrors] = useState<FieldErrors<z.infer<typeof schema>>>();
  const queueToast = useToastHandle((h) => h.queue);
  return (
    <Page name={'Medien'} pageURL={'media'}>
      <form onSubmit={methods.handleSubmit(console.log, setErrors)}>
        <Stack spacing={'lg'}>
          <TextField
            leading
            name={'username'}
            placeholder={'Benutzername'}
            hookform={{ methods, errors }}
          />
          <TextField
            leading
            name={'password'}
            type={'password'}
            placeholder={'Passwort'}
            hookform={{ methods, errors }}
          />
          <TextField
            leading
            name={'age'}
            type={'number'}
            placeholder={'Alter'}
            hookform={{ methods, errors }}
            required
          />
        </Stack>
        <Button.Primary type={'submit'}>Submit</Button.Primary>
      </form>
      <Stack direction={'row'}>
        {toastTypeArray.map((type) => (
          <Button.Primary
            key={type}
            onClick={() => {
              queueToast({
                id: uuidv4(),
                duration: 2,
                message: `Hello world! ${Math.random()}`,
                type,
              });
            }}
          >
            Toast {type}
          </Button.Primary>
        ))}
      </Stack>
    </Page>
  );
}
