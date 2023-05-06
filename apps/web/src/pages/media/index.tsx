import { PageAlign } from 'next-ui';
import { usePinpointTextProps } from 'next-ui/src/components/Text/Text';

export default function Web() {
  return (
    <>
      <PageAlign
        sd={{ marginTop: 'xl' }}
        {...usePinpointTextProps({ role: 'body', size: 'md' })}
      >
        Media Page!
      </PageAlign>
    </>
  );
}
