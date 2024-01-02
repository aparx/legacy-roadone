import { Toast, ToastConfig as config } from '@/components';
import type { ToastData } from '@/components/Toast/Toast';
import { useToastHandle } from '@/handles';
import {
  PageAlign,
  Portal,
  propMerge,
  PropsWithStyleable,
  useStyleableMerge,
} from 'next-ui';

export default function ToastHandle(props: PropsWithStyleable) {
  const [toasts, closeToast] = useToastHandle((s) => [s.list, s.close]);
  const styleableMerge = useStyleableMerge(props);
  if (!toasts.length) return null;
  const renderToasts: ToastData[] = [];
  for (let i = 0; i < Math.min(5, toasts.length); ++i)
    renderToasts.push(toasts[i]);
  return (
    <Portal>
      <PageAlign
        role={'alert'}
        {...propMerge(
          {
            css: {
              zIndex: config.zIndex,
              pointerEvents: 'none',
              position: 'fixed',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              spacing: 20,
              alignItems: 'start',
            },
          },
          styleableMerge
        )}
      >
        {renderToasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            sd={{ marginV: 'md' }}
            onFinish={closeToast}
          />
        ))}
      </PageAlign>
    </Portal>
  );
}