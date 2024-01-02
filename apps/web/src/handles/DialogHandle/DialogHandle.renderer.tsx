import { Dialog, DialogConfig as config } from '@/components';
import { useDialogHandle } from '@/handles';
import { Portal, propMerge, Scrim, Stack } from 'next-ui';
import { usePageAlignProps } from 'next-ui/src/components/PageAlign/PageAlign';
import React from 'react';

export default function DialogHandle() {
  const handle = useDialogHandle();
  const pageAlign = usePageAlignProps();
  if (!handle || !handle.dialog) return null;
  return (
    <>
      <Scrim />
      <Portal>
        <Stack
          hAlign
          vAlign
          {...propMerge(
            {
              css: {
                position: 'fixed',
                inset: 0,
                zIndex: config.zIndex,
              },
            },
            pageAlign
          )}
        >
          <Dialog {...handle.dialog} close={handle.close} />
        </Stack>
      </Portal>
    </>
  );
}