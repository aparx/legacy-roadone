/** @jsxImportSource @emotion/react */
import { DialogConfig as config } from './Dialog.config';
import * as style from './Dialog.style';
import { useIsMobile } from '@/utils/device';
import { Button, Card, Portal, Scrim, Stack, useOnClickOutside } from 'next-ui';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import { useAttributes } from 'next-ui/src/hooks/useAttributes';
import {
  ForwardedRef,
  forwardRef,
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

// <===================================>
//           DIALOG FORM TYPES
// <===================================>

export type DialogFormData = {
  type: 'form';
  description?: string;
  formContent?: ReactNode | undefined;
};

// <===================================>
//         DIALOG CONTENT TYPES
// <===================================>

export type DialogContentData = {
  type: 'content';
  content?: ReactNode | undefined;
};

// <===================================>
//          DIALOG MODAL TYPES
// <===================================>

export type DialogModalData = {
  type: 'modal';
  content?: ReactNode | undefined;
};

// <===================================>
//          DIALOG ACTION TYPES
// <===================================>

export type DialogAction = {
  id: string;
  name: string;
  /** if true, closes the modal if the user choose that response. */
  doClose?: boolean;
};

export type DialogResponseSource =
  | readonly Readonly<DialogAction>[]
  | Readonly<DialogAction>[];

// prettier-ignore
type _CreateActionHandlerName<TAction extends DialogAction> =
  `on${Capitalize<TAction['id']>}Perform`;

type DialogExplicitActionHandlers<TSource extends DialogResponseSource> = {
  [A in TSource[number] as _CreateActionHandlerName<A>]?: (
    action: A extends DialogAction ? A : DialogAction
  ) => any;
};

export type DialogActionData<TActions extends DialogResponseSource> = {
  actions: TActions;
  onPerformAction?: (action: TActions[number]) => any;
} & DialogExplicitActionHandlers<TActions>;

// <===================================>
//         DIALOG IMPLEMENTATION
// <===================================>

export type DialogData<TActions extends DialogResponseSource> = {
  title?: string;
} & (
  | (DialogFormData & Partial<DialogActionData<TActions>>)
  | (DialogContentData & Partial<DialogActionData<TActions>>)
  | (DialogModalData & DialogActionData<TActions>)
);

type _DialogCloseFn = () => any;

// prettier-ignore
export type DialogProps<TActions extends DialogResponseSource> = {
  close: _DialogCloseFn;
} & DialogData<TActions>;

export type DialogRef = {
  element: RefObject<HTMLDivElement>;
  close: _DialogCloseFn;
};

export const Dialog = forwardRef(function DialogRenderer<
  TActions extends DialogResponseSource
>(
  { title, type, close, ...restData }: DialogProps<TActions>,
  ref: ForwardedRef<DialogRef>
) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<_DialogCloseFn>(close);
  // prettier-ignore
  useEffect(() => { closeRef.current = close });
  // prettier-ignore
  useImperativeHandle(ref, () => ({
      element: dialogRef,
      close: closeRef.current,
    }), []);
  useOnClickOutside(useIsMobile() ? close : () => {}, dialogRef);
  return (
    <>
      <Scrim />
      <Portal>
        <Stack hAlign vAlign css={style.wrapper}>
          <Card
            width={false}
            role={'dialog'}
            ref={dialogRef}
            css={style.dialog}
          >
            <DialogInner
              close={closeRef}
              dialogRef={dialogRef}
              data={{ title, type, ...restData } as any}
            />
          </Card>
        </Stack>
      </Portal>
    </>
  );
}) as <T extends DialogResponseSource = typeof config.Defaults.actions>(
  props: DialogProps<T> & RefAttributes<DialogRef>
) => ReactElement;

export default Dialog;

function DialogInner<T extends DialogResponseSource>({
  data,
  close,
  dialogRef,
}: {
  data: DialogData<T>;
  close: RefObject<_DialogCloseFn>;
  dialogRef: NonNullable<DialogRef['element']>;
}) {
  const actions = data.actions ?? config.Defaults.actions;
  const performAction = useCallback(
    (action: (typeof actions)[number]) => {
      data.onPerformAction?.(action as T[number]);
      if (action.id in data) data[action.id](action);
      if (action.doClose) close.current?.();
    },
    [close, data]
  );
  const labeledBy = useId();
  const describedBy = useId();
  useAttributes(
    { 'aria-labeledby': labeledBy, 'aria-describedby': describedBy },
    dialogRef
  );
  return (
    <>
      <Card.Header title={data.title} id={labeledBy} />
      <Card.Footer {...useStackProps({ direction: 'row' })}>
        {actions.map((action) => {
          return (
            <Button.Primary
              key={action.id}
              onClick={() => performAction(action)}
            >
              {action.name}
            </Button.Primary>
          );
        })}
      </Card.Footer>
    </>
  );
}
