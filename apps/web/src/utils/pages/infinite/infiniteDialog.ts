import { DialogConfig } from '@/components';
import { DialogProps } from '@/components/Dialog/Dialog';
import { useDialogHandle, useToastHandle } from '@/handles';
import { useMessage } from '@/utils/hooks/useMessage';
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
export type InfiniteMutationEndpoint<TItem> =
  UseTRPCMutationResult<TItem, any, TItem, any>;

/** Mutation data that is the base with all `InfiniteItemMutation`s. */
export type DialogInfiniteMutationData<TItem extends object> = {
  endpoint: InfiniteMutationEndpoint<TItem>;
  /** @default false */
  dialogWidth?: DialogProps<'form', any, any>['width'];
};

export type InfiniteMutationDialogResult<
  TType extends InfiniteItemMutation,
  TSchema extends ZodSchema,
  TItem extends object = _ImplicitItem<TType, TSchema>
> = InfiniteItemMutateFunction<TType, TItem>;

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
  TItem extends object = _ImplicitItem<'delete', TSchema>
> = DialogInfiniteMutationData<TItem> & {
  content?: ReactNode;
  response?: { success?: string };
};

/** Dialog that deletes the given infinite-item */
export function useDeleteDialog<
  TSchema extends ZodSchema,
  TItem extends _InfiniteItemTarget = _ImplicitItem<'delete', TSchema>
>(
  props: UseDeleteDialogProps<TSchema, TItem>
): InfiniteMutationDialogResult<'delete', TSchema, TItem> {
  const { endpoint, dialogWidth, content, response } = props;
  const [showDialog, closeDialog] = useDialogHandle((s) => [s.show, s.close]);
  const addToast = useToastHandle((s) => s.add);
  return ({ item }: InfiniteItem<TItem>) => {
    const { id } = item;
    showDialog({
      title: getGlobalMessage('modal.sureTitle'),
      type: 'modal',
      actions: DialogConfig.dialogYesCancelSource,
      width: dialogWidth,
      content,
      onHandleYes: () => {
        closeDialog();
        endpoint.mutate(item, {
          onSuccess: () => {
            addToast({
              type: 'success',
              title: getGlobalMessage('general.actionSuccess'),
              message: response?.success,
            });
          },
          onError: (error) => {
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
  TItem extends object = _ImplicitItem<TType, TSchema>
> = MutateFormlessDialogData<TType, TSchema, TItem> &
  _MutateFormProp<TType, TSchema, TItem>;

export type MutateFormlessDialogData<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TItem extends object = _ImplicitItem<TType, TSchema>
> = TType extends 'edit'
  ? TItem extends _InfiniteItemTarget
    ? _MutateFormlessProps<TType, TSchema, TItem>
    : never
  : _MutateFormlessProps<TType, TSchema, TItem>;

type _MutateFormlessProps<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TItem extends object = _ImplicitItem<TType, TSchema>
> = DialogInfiniteMutationData<TItem> & {
  type: TType;
  schema: TSchema;
  response?: { success?: string };
};

export type UseMutateFormInput<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TItem extends object = _ImplicitItem<TType, TSchema>
> = TType extends 'edit'
  ? MutateFormlessDialogData<TType, TSchema, TItem> & InfiniteItem<TItem>
  : MutateFormlessDialogData<TType, TSchema, TItem>;

type _MutateFormProp<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TItem extends object = _ImplicitItem<TType, TSchema>
> = {
  form: (props: UseMutateFormInput<TType, TSchema, TItem>) => ReactNode;
};

/** Dialog that edits or adds a given infinite-item. */
export function useMutateDialog<
  TType extends UseMutateType,
  TSchema extends ZodSchema,
  TItem extends object = _ImplicitItem<TType, TSchema>
>(
  props: UseMutateDialogProps<TType, TSchema, TItem>
): InfiniteMutationDialogResult<TType, TSchema, TItem> {
  const [showDialog, closeDialog] = useDialogHandle((s) => [s.show, s.close]);
  const addToast = useToastHandle((s) => s.add);
  if (typeof props !== 'object') throw new Error();
  const { form, ...restProps } = props;
  const { type, endpoint, schema, response, dialogWidth } = props;
  const title = useMessage(`general.${type}`, getGlobalMessage('gig.name'));
  return (input?: InfiniteItem<TItem> | any) => {
    const item = input
      ? (input.item as TType extends 'edit'
          ? TItem & _InfiniteItemTarget
          : TItem)
      : undefined;
    showDialog({
      title,
      type: 'form',
      schema,
      width: dialogWidth,
      actions: DialogConfig.dialogSaveCancelSource,
      content: form(
        type === 'edit' ? { ...restProps, item } : (restProps as any)
      ),
      handleSubmit: (formData) => {
        let newData: any = formData;
        if (type === 'edit')
          newData = { ...formData, id: (item as _InfiniteItemTarget).id };
        endpoint.mutate(newData, {
          onSuccess: () => {
            closeDialog();
            addToast({
              type: 'success',
              title: getGlobalMessage('general.actionSuccess'),
              message: response?.success,
            });
          },
          onError: (error) => {
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
