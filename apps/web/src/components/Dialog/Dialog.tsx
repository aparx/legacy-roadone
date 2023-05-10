/** @jsxImportSource @emotion/react */
import * as style from './Dialog.style';
import { useIsMobile } from '@/utils/device';
import {
  Button,
  Card,
  Portal,
  PropsWithStyleable,
  Scrim,
  Stack,
  useOnClickOutside,
} from 'next-ui';
import {
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';

export type DialogData = {
  /** @default dialog */
  role?: 'modal' | 'dialog';
  title?: string;
  content?: ReactNode | undefined;
};

type _DialogCloseFn = () => any;

// prettier-ignore
export type DialogProps = PropsWithStyleable<{
  close: _DialogCloseFn;
} & DialogData>;

export type DialogRef = {
  element: RefObject<HTMLDivElement>;
  close: _DialogCloseFn;
};

export const Dialog = forwardRef<DialogRef, DialogProps>(
  function DialogRenderer({ title, content, role, close, ...rest }, ref) {
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
    const titleId = useId();
    return (
      <>
        <Scrim />
        <Portal>
          <Stack hAlign vAlign css={style.wrapper}>
            <Card
              width={false}
              role={'dialog'}
              aria-labelledby={titleId}
              ref={dialogRef}
              css={style.dialog}
            >
              <Card.Header>
                <Card.Header.Title id={titleId}>{title}</Card.Header.Title>
              </Card.Header>
              <Card.Content>{content as any}</Card.Content>
              {/* TODO what if content is a form? What about the footer? */}
              <Card.Footer>
                <Button.Tertiary onClick={close}>Abbrechen</Button.Tertiary>
              </Card.Footer>
            </Card>
          </Stack>
        </Portal>
      </>
    );
  }
);

export default Dialog;
