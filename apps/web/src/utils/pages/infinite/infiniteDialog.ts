import { DialogConfig } from '@/components';
import { DialogProps } from '@/components/Dialog/Dialog';
import { useDialogHandle, useToastHandle } from '@/handles';
import { getGlobalMessage } from '@/utils/message';
import {
  InfiniteItem,
  InfiniteItemMutateFunction,
  InfiniteItemMutation,
} from '@/utils/pages/infinite/infiniteItem';
import { UseTRPCMutationResult } from '@trpc/react-query/shared';
import { ReactNode } from 'react';
import { UnionExtract } from 'shared-utils';
import { z, ZodSchema } from 'zod';

// prettier-ignore
export type InfiniteMutationEndpoint<TFormData, TReturnData = unknown> =
  UseTRPCMutationResult<TReturnData, any, TFormData, any>;

/** Mutation data that is the base with all `InfiniteItemMutation`s. */
export type DialogInfiniteMutationData<
  TFormData extends object,
  TReturnData = unknown
> = {
  title?: string;
  endpoint: InfiniteMutationEndpoint<TFormData, TReturnData>;
  /** @default false */
  width?: DialogProps<'form', any, any>['width'];
  onSuccess?: (data: TReturnData) => any;
  onError?: (error: any) => any;
};

export type InfiniteMutationDialogResult<
  TType extends InfiniteItemMutation,
  TSchema extends ZodSchema,
  TDataItem extends object = _ImplicitItem<TType, TSchema>
> = InfiniteItemMutateFunction<TType, TDataItem>;

/** Target (identifier) used to target a specific item for a mutation. */
type _InfiniteItemTarget = { id: string };

type _ImplicitItem<
  TType extends InfiniteItemMutation,
  TSchema extends ZodSchema
> = TType extends 'add'
  ? z.infer<TSchema>
  : z.infer<TSchema> & _InfiniteItemTarget;

// <==================================================>
//       `useDeleteDialog` PROPERTIES AND TYPES
// <==================================================>

export type UseDeleteDialogProps<
  TSchema extends ZodSchema,
  TDataItem extends TFormData = _ImplicitItem<'delete', TSchema>,
  TReturnData = unknown,
  TFormData extends _InfiniteItemTarget = _ImplicitItem<'delete', TSchema>
> = DialogInfiniteMutationData<TFormData, TReturnData> & {
  content?: (item: InfiniteItem<TDataItem>) => ReactNode;
  response?: { success?: string };
};

/** Dialog that deletes the given infinite-item */
export function useDeleteDialog<
  TSchema extends ZodSchema,
  TDataItem extends TFormData = _ImplicitItem<'delete', TSchema>,
  TReturnData = unknown,
  TFormData extends _InfiniteItemTarget = _ImplicitItem<'delete', TSchema>
>(
  props: UseDeleteDialogProps<TSchema, TDataItem, TReturnData, TFormData>
): InfiniteMutationDialogResult<'delete', TSchema, TDataItem> {
  const { endpoint, width, content, response, title, onSuccess, onError } =
    props;
  const [showDialog, closeDialog] = useDialogHandle((s) => [s.show, s.close]);
  const addToast = useToastHandle((s) => s.add);
  return (iItem: InfiniteItem<TDataItem>) => {
    const { id } = iItem.item;
    showDialog({
      title,
      type: 'modal',
      actions: DialogConfig.dialogYesCancelSource,
      width: width,
      content: content?.(iItem),
      onHandleYes: () => {
        closeDialog();
        endpoint.mutate(iItem.item, {
          onSuccess: (data) => {
            onSuccess?.(data);
            addToast({
              type: 'success',
              title: getGlobalMessage('general.actionSuccess'),
              message: response?.success,
            });
          },
          onError: (error) => {
            onError?.(error);
            addToast({
              type: 'error',
              title: getGlobalMessage('general.actionFailed'),
              message: getGlobalMessage(
                error as any,
                getGlobalMessage('general.error')
              ),
            });
          },
        });
      },
    });
  };
}

// <==================================================>
//       `useMutateDialog` PROPERTIES AND TYPES
// <==================================================>

export type UseMutateType = UnionExtract<InfiniteItemMutation, 'add' | 'edit'>;

export type UseMutateDialogProps<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TReturnData = unknown,
  TFormData extends object = _ImplicitItem<TType, TSchema>
> = MutateFormlessDialogData<TType, TSchema, TReturnData, TFormData> &
  _MutateFormProp<TType, TSchema, TFormData>;

export type MutateFormlessDialogData<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TReturnData = unknown,
  TFormData extends object = _ImplicitItem<TType, TSchema>
> = TType extends 'edit'
  ? TFormData extends _InfiniteItemTarget
    ? _MutateFormlessProps<TType, TSchema, TReturnData, TFormData>
    : never
  : _MutateFormlessProps<TType, TSchema, TReturnData, TFormData>;

type _MutateFormlessProps<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TReturnData = unknown,
  TFormData extends object = _ImplicitItem<TType, TSchema>
> = DialogInfiniteMutationData<TFormData, TReturnData> & {
  type: TType;
  schema: TSchema;
  response?: { success?: string };
};

export type UseMutateFormInput<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TFormData extends object = _ImplicitItem<TType, TSchema>,
  TReturnData = unknown
> = TType extends 'edit'
  ? MutateFormlessDialogData<TType, TSchema, TFormData> &
      InfiniteItem<TFormData>
  : MutateFormlessDialogData<TType, TSchema, TFormData>;

type _MutateFormProp<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TFormData extends object = _ImplicitItem<TType, TSchema>
> = {
  form: (props: UseMutateFormInput<TType, TSchema, TFormData>) => ReactNode;
};

/** Dialog that edits or adds a given infinite-item. */
export function useMutateDialog<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TReturnData = unknown,
  TFormData extends object = _ImplicitItem<TType, TSchema>
>(
  props: UseMutateDialogProps<TType, TSchema, TReturnData, TFormData>
): InfiniteMutationDialogResult<TType, TSchema, TFormData> {
  const [showDialog, closeDialog] = useDialogHandle((s) => [s.show, s.close]);
  const addToast = useToastHandle((s) => s.add);
  if (typeof props !== 'object') throw new Error();
  const { form, onSuccess, onError, ...restProps } = props;
  const { type, endpoint, schema, response, width, title } = props;
  return (input?: InfiniteItem<TFormData> | any) => {
    const item = input
      ? (input.item as TType extends 'edit'
          ? TFormData & _InfiniteItemTarget
          : TFormData)
      : undefined;
    showDialog({
      title,
      type: 'form',
      schema,
      width: width,
      actions: DialogConfig.dialogSaveCancelSource,
      content: form(
        type === 'edit' ? { ...restProps, item } : (restProps as any)
      ),
      handleSubmit: (formData) => {
        let newData: any = formData;
        if (type === 'edit')
          newData = { ...formData, id: (item as _InfiniteItemTarget).id };
        endpoint.mutate(newData, {
          onSuccess: (data) => {
            onSuccess?.(data);
            closeDialog();
            addToast({
              type: 'success',
              title: getGlobalMessage('general.actionSuccess'),
              message: response?.success,
            });
          },
          onError: (error) => {
            onError?.(error);
            addToast({
              type: 'error',
              title: getGlobalMessage('general.actionSuccess'),
              message: `${getGlobalMessage(
                error.message as any,
                error.message
              )}`,
            });
          },
        });
      },
    });
  };
}
