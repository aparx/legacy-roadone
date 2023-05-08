/** @jsxImportSource @emotion/react */
import * as style from './GigCard.style';
import { Gig } from '@/modules/schemas/gig';
import {
  propMerge,
  PropsWithoutChildren,
  PropsWithStyleable,
  Stack,
  useStyleableMerge,
} from 'next-ui';
import { forwardRef, HTMLAttributes } from 'react';

export type GigProps = PropsWithoutChildren<HTMLAttributes<HTMLDivElement>> &
  PropsWithStyleable<{ gig: Gig }>;

export const GigCard = forwardRef<HTMLDivElement, GigProps>(
  function GigRenderer({ gig, ...restProps }, ref) {
    return (
      <Stack
        ref={ref}
        direction={'row'}
        {...propMerge({ css: style.gig }, useStyleableMerge(restProps))}
      >
        <Stack direction={'column'} spacing={'md'}>
          <div>01.</div>
          <div>Mai</div>
        </Stack>
        <Stack direction={'column'} spacing={'md'}>
          <div>{gig.title}</div>
          <div>Address</div>
          {gig.description?.length && <div>{gig.description}</div>}
        </Stack>
      </Stack>
    );
  }
);

export default GigCard;
