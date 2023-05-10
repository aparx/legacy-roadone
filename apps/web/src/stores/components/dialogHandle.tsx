import { Dialog, DialogConfig as config } from '@/components';
import {
  DialogData,
  DialogResponseSource,
  DialogType,
} from '@/components/Dialog/Dialog';
import { ZodSchema } from 'zod';
import { create } from 'zustand';

export type DialogHandle = {
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

export const useDialogHandle = create<DialogHandle>((set) => ({
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

export function DialogHandleRenderer() {
  const handle = useDialogHandle();
  if (!handle || !handle.dialog) return null;
  return <Dialog {...handle.dialog} close={handle.close} />;
}
