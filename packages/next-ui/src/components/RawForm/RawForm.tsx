/** @jsxImportSource @emotion/react */
import {
  RawFormContext,
  RawFormContextProvider,
} from './context/rawFormContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useState } from 'react';
import type { UseFormProps } from 'react-hook-form';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { ObjectConjunction } from 'shared-utils';
import { ZodSchema } from 'zod';

export type InternalFormProps<
  TSchema extends ZodSchema,
  TContext = undefined
> = {
  schema: TSchema;
  onSubmit: SubmitHandler<TSchema['_output']>;
} & (TContext extends undefined | null
  ? { context?: undefined }
  : { context: TContext }) &
  (
    | { children?: ReactNode; form?: undefined }
    | {
        children?: undefined;
        form?: (form: RawFormContext<TSchema>, schema: TSchema) => ReactNode;
      }
  );

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
  form,
  context,
  onSubmit,
  ...rest
}: FormProps<TSchema>) => {
  const methods = useForm<TSchema>({
    resolver: zodResolver(schema),
    context,
    ...rest,
  });
  const [errors, setErrors] = useState<FieldErrors<TSchema>>();
  return (
    <RawFormContextProvider value={{ methods, errors }}>
      <form
        onSubmit={methods.handleSubmit((v) => {
          setErrors({});
          onSubmit(v);
        }, setErrors)}
      >
        {form?.({ methods, errors }, schema) ?? children}
      </form>
    </RawFormContextProvider>
  );
};

export default RawForm;
