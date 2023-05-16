import { createContext, useContext } from 'react';
import { FieldErrors, UseFormReturn } from 'react-hook-form';
import { FieldValues } from 'react-hook-form/dist/types/fields';

export type RawFormContext<TFields extends FieldValues, TContext = any> = {
  methods: UseFormReturn<TFields, TContext>;
  errors: FieldErrors<TFields> | undefined;
};

export const rawFormContext = createContext<RawFormContext<any>>(null as any);

export const RawFormContextProvider = rawFormContext.Provider;

export function useRawForm<
  TFields extends FieldValues
>(): RawFormContext<TFields> {
  return useContext(rawFormContext);
}
