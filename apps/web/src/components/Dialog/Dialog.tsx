/** @jsxImportSource @emotion/react */
import { DialogConfig as config } from './Dialog.config';
import { useIsMobile } from '@/utils/device';
import { useOnNavigation } from '@/utils/hooks/useOnNavigation';
import { capitalize } from 'lodash';
import { Button, Card, useOnClickOutside } from 'next-ui';
import { ButtonProps } from 'next-ui/src/components/Button/Button';
import { InternalCardProps } from 'next-ui/src/components/Card/Card';
import RawForm from 'next-ui/src/components/RawForm/RawForm';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import 'next/dist/client/components/react-dev-overlay/internal/components/Dialog';
import React, {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  RefAttributes,
  RefObject,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import { UseFormProps } from 'react-hook-form';
import { SubmitHandler } from 'react-hook-form/dist/types/form';
import { UnionExtract } from 'shared-utils';
import { ZodSchema } from 'zod';

// <===================================>
//           DIALOG FORM TYPES
// <===================================>

export type DialogFormData<TFormSchema extends ZodSchema> = {
  schema: TFormSchema;
  handleSubmit: SubmitHandler<TFormSchema['_output']>;
  description?: string;
  content?: ReactNode;
  hookform?: UseFormProps<TFormSchema['_output'], 'schema' | 'resolver'>;
};

// <===================================>
//         DIALOG CONTENT TYPES
// <===================================>

export type DialogContentData = {
  content?: ReactNode | undefined;
};

// <===================================>
//          DIALOG MODAL TYPES
// <===================================>

export type DialogModalData = {
  content?: ReactNode | undefined;
};

// <===================================>
//          DIALOG ACTION TYPES
// <===================================>

export type DialogAction = {
  id: string;
  name: string;
  /** Role of the button, that alters their behaviour */
  role?: 'close' | 'submit' | 'default';
};

export type DialogResponseSource =
  | readonly Readonly<DialogAction>[]
  | Readonly<DialogAction>[];

// prettier-ignore
export type ActionHandlerName<TAction extends DialogAction> =
  ReturnType<typeof createHandlerName<TAction>>;

function createHandlerName<TAction extends DialogAction>(
  action: TAction
): `onHandle${Capitalize<TAction['id']>}` {
  return `onHandle${capitalize(action.id) as Capitalize<typeof action.id>}`;
}

type DialogExplicitActionHandlers<TSource extends DialogResponseSource> = {
  [A in TSource[number] as ActionHandlerName<A>]?: DialogActionHandler<A>;
};

export type DialogActionHandler<TAction extends DialogAction> = (data: {
  action: TAction;
  close: _DialogCloseFn | null;
}) => any;

export type DialogActionData<TActions extends DialogResponseSource> = {
  actions: TActions;
  onPerformAction?: (action: TActions[number]) => any;
} & DialogExplicitActionHandlers<TActions>;

// <===================================>
//         DIALOG IMPLEMENTATION
// <===================================>

export type DialogType = 'form' | 'content' | 'modal';

/** Properties that depend on each other regarding the style of the dialog. */
export type DialogStyleDiscrimination =
  | {
      /** The preferred max-width of the dialog. */
      width: InternalCardProps['width'] | false;
      /** If true avoids the stretch to max-width (see `width`). */
      tight?: boolean | undefined;
    }
  | {
      /** The preferred max-width of the dialog. */
      width?: undefined;
      /** If true avoids the stretch to max-width (see `width`). */
      tight?: undefined;
    };

export type DialogData<
  TType extends DialogType,
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema
> = {
  type: TType;
  title?: string;
} & DialogStyleDiscrimination &
  (TType extends UnionExtract<DialogType, 'form'>
    ? DialogFormData<TFormSchema> & Partial<DialogActionData<TActions>>
    : TType extends UnionExtract<DialogType, 'content'>
    ? DialogContentData & Partial<DialogActionData<TActions>>
    : DialogModalData & DialogActionData<TActions>);

type _DialogCloseFn = () => any;

export type DialogProps<
  TType extends DialogType,
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema
> = {
  close: _DialogCloseFn;
} & DialogData<TType, TActions, TFormSchema>;

export type DialogRef<
  TType extends DialogType,
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema = any,
  // prettier-ignore
  TProps extends DialogProps<TType, TActions, TFormSchema> =
    DialogProps<TType, TActions, TFormSchema>
> = {
  element: RefObject<HTMLDivElement>;
  close: _DialogCloseFn;
} & (TProps['type'] extends UnionExtract<DialogType, 'form'>
  ? { form: RefObject<HTMLFormElement> }
  : { form: undefined });

export const Dialog = forwardRef(function SoloDialogRenderer<
  TType extends DialogType,
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema,
  TProps extends DialogProps<TType, TActions, TFormSchema>
>(
  { title, type, close, width, tight, ...restData }: TProps,
  forwardRef: ForwardedRef<DialogRef<TType, TActions, TFormSchema, TProps>>
) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef<_DialogCloseFn>(close);
  // prettier-ignore
  useEffect(() => { closeRef.current = close });
  // prettier-ignore
  useImperativeHandle(forwardRef, () => ({
    element: dialogRef,
    close: closeRef.current,
    form: type === 'form' ? formRef : undefined,
  } as DialogRef<TType, TActions, TFormSchema, TProps>), [type]);
  useOnClickOutside(useIsMobile() ? close : () => {}, dialogRef);
  useOnNavigation(() => close());
  const labelledBy = useId();
  return (
    <Card
      width={width ?? false}
      tight={tight}
      keepPadding
      role={'dialog'}
      ref={dialogRef}
      aria-labelledby={labelledBy}
    >
      <DialogInner
        close={closeRef}
        formRef={formRef}
        labelledBy={labelledBy}
        data={{ title, type, ...restData } as any}
      />
    </Card>
  );
}) as <
  TType extends DialogType,
  TFormSchema extends ZodSchema,
  TProps extends DialogProps<TType, TActions, TFormSchema> &
    RefAttributes<DialogRef<TType, TActions, TFormSchema, TProps>>,
  TActions extends DialogResponseSource = typeof config.Defaults.actions
>(
  props: TProps
) => ReactElement;

export default Dialog;

type DialogInnerProps<
  TType extends DialogType,
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema
> = {
  data: DialogData<TType, TActions, TFormSchema>;
  labelledBy: string;
  formRef: RefObject<HTMLFormElement> | undefined | null;
  close: RefObject<_DialogCloseFn>;
};

function DialogInner<
  TType extends DialogType,
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema
>(props: DialogInnerProps<TType, TActions, TFormSchema>) {
  const inner = (
    <>
      <DialogHeader {...props} />
      <Card.Content>
        <>{props.data.content}</>
      </Card.Content>
      <DialogFooter {...props} />
    </>
  );
  return props.data.type === 'form' ? (
    <DialogForm {...(props as DialogInnerProps<'form', TActions, TFormSchema>)}>
      {inner}
    </DialogForm>
  ) : (
    inner
  );
}

function DialogHeader<
  TType extends DialogType,
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema
>(props: DialogInnerProps<TType, TActions, TFormSchema>) {
  const { data, labelledBy } = props;
  return <Card.Header title={data.title} id={labelledBy} />;
}

function DialogFooter<
  TType extends DialogType,
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema
>({ data, close }: DialogInnerProps<TType, TActions, TFormSchema>) {
  const actions = data.actions ?? config.Defaults.actions;
  const performAction = useCallback(
    (action: TActions[number]) => {
      data.onPerformAction?.(action as TActions[number]);
      const handlerName = createHandlerName(action);
      if (handlerName in data)
        (data[handlerName] as DialogActionHandler<typeof action>)({
          action,
          close: close.current,
        });
      if (action.role === 'close') close.current?.();
    },
    [close, data]
  );
  return (
    <Card.Footer {...useStackProps({ direction: 'row', hAlign: true })}>
      {actions.map((action) => {
        const props = {
          key: action.id,
          type: action.role === 'submit' ? 'submit' : undefined,
          onClick: () => performAction(action),
          children: action.name,
        } satisfies ButtonProps & { key: string };
        return action.role === 'close' ? (
          <Button.Secondary {...props} />
        ) : (
          <Button.Primary {...props} />
        );
      })}
    </Card.Footer>
  );
}

function DialogForm<
  TActions extends DialogResponseSource,
  TFormSchema extends ZodSchema
>(props: PropsWithChildren<DialogInnerProps<'form', TActions, TFormSchema>>) {
  return (
    // TODO create custom context and use state to manage errors (to force re-renders)
    <RawForm
      schema={props.data.schema}
      onSubmit={props.data.handleSubmit}
      {...props.data.hookform}
    >
      <>{props.children}</>
    </RawForm>
  );
}
