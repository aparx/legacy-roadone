import { NavbarConfig, Toast } from '@/components';
import { useToastHandle } from '@/handles';
import { useOnNavigation } from '@/utils/hooks/useOnNavigation';
import {
  PageAlign,
  Portal,
  propMerge,
  PropsWithStyleable,
  useStyleableMerge,
} from 'next-ui';

export default function ToastHandle(props: PropsWithStyleable) {
  const handle = useToastHandle();
  useOnNavigation(handle.clear);
  const styleableMerge = useStyleableMerge(props);
  if (!handle.list.length) return null;
  const toast = handle.list[0];
  return (
    <Portal>
      <PageAlign
        {...propMerge(
          {
            css: {
              zIndex: 1 + NavbarConfig.zBaseIndex,
              pointerEvents: 'none',
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'start',
            },
          },
          styleableMerge
        )}
      >
        <Toast
          // key will force a refresh and thus animation resets
          key={toast.id}
          {...toast}
          sd={{ marginV: 'md' }}
          onFinish={handle.close}
        />
      </PageAlign>
    </Portal>
  );
}
