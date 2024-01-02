import { DialogConfig as config } from '@/components';
import {
  DialogData,
  DialogResponseSource,
  DialogType,
} from '@/components/Dialog/Dialog';
import { ZodSchema } from 'zod';
import { create } from 'zustand';

export type DialogHandleStore = {
  dialog: DialogData<any, any, any> | undefined;
  close: () => void;
  show: <
    TType extends DialogType,
    TFormSchema extends ZodSchema,
    TActions extends DialogResponseSource = typeof config.Defaults.actions
  >(
    dialog: DialogData<TType, TActions, TFormSchema>
  ) => void;
};

export const useDialogHandle = create<DialogHandleStore>((set) => ({
  dialog: undefined,
  close: () => set({ dialog: undefined }),
  show: <
    TType extends DialogType,
    TFormSchema extends ZodSchema,
    TActions extends DialogResponseSource = typeof config.Defaults.actions
  >(
    dialog: DialogData<TType, TActions, TFormSchema>
  ) => set({ dialog: dialog }),
}));