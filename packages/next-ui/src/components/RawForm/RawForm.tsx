/** @jsxImportSource @emotion/react */
import { RequiredChildren } from '../../utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { UseFormProps } from 'react-hook-form/dist/types';
import { ObjectConjunction } from 'shared-utils';
import { ZodSchema } from 'zod';

export type InternalFormProps<
  TSchema extends ZodSchema,
  TContext = undefined
> = {
  schema: TSchema;
  children: RequiredChildren;
} & (TContext extends undefined | null
  ? { context?: undefined }
  : { context: TContext });

export type FormProps<
  TSchema extends ZodSchema,
  TContext = any
> = ObjectConjunction<
  UseFormProps<TSchema, TContext>,
  InternalFormProps<TSchema, TContext>
>;

export const RawForm = <TSchema extends ZodSchema, TContext = undefined>({
  schema,
  children,
  context,
  ...rest
}: FormProps<TSchema>) => {
  const methods = useForm<TSchema>({
    resolver: zodResolver(schema),
    context,
    ...rest,
  });
  return <form onSubmit={() => console.log('')}>{children}</form>;
};

export default RawForm;
