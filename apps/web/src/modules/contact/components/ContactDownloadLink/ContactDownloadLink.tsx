import * as style from './ContactDownloadLink.style';
import { Icon, Stack, Text } from 'next-ui';
import Link from 'next/link';
import { MdDownload } from 'react-icons/md';

export type ContactDownloadLinkProps = {
  title: string;
  objectId: string;
  download?: string;
};

export default function ContactDownloadLink({
  title,
  objectId,
  download,
}: ContactDownloadLinkProps) {
  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${objectId}`}
      download={download ?? objectId}
      css={{ all: 'unset' }}
    >
      <Stack css={style.btn} direction={'row'} hAlign={'space-between'} vAlign>
        <Text.Body size={'lg'}>{title}</Text.Body>
        <Icon icon={<MdDownload size={24} />} />
      </Stack>
    </Link>
  );
}
