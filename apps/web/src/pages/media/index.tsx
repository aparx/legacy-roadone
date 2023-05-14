import { Page } from '@/components';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Stack, TextField } from 'next-ui';
import { useState } from 'react';
import { FieldErrors, useForm } from 'react-hook-form';
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
    </Page>
  );
}
