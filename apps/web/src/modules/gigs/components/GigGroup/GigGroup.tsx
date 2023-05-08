/** @jsxImportSource @emotion/react */
import { GigCard } from '@/modules/gigs/components/GigCard';
import { RenderableGig } from '@/modules/gigs/components/GigCard/GigCard';
import { useMessage } from '@/utils/hooks/useMessage';
import {
  Card,
  PropsWithoutChildren,
  PropsWithStyleable,
  useStyleableMerge,
} from 'next-ui';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import { forwardRef, HTMLAttributes } from 'react';

export type GigGroupProps = PropsWithoutChildren<
  HTMLAttributes<HTMLDivElement>
> &
  PropsWithStyleable<{ year: number; gigs: RenderableGig[] }>;

export const GigGroup = forwardRef<HTMLDivElement, GigGroupProps>(
  function GigGroupRenderer({ year, gigs, ...restProps }, ref) {
    const isDone = year < new Date().getFullYear();
    return (
      <Card
        ref={ref}
        width={'md'}
        id={`${year}`}
        aria-label={useMessage('aria.gig.group', String(year))}
        {...useStyleableMerge(restProps)}
      >
        <Card.Header {...useStackProps({ direction: 'row', hAlign: true })}>
          <Card.Header.Title emphasis={isDone ? 'disabled' : 'high'}>
            {year}
          </Card.Header.Title>
        </Card.Header>
        <Card.Content {...useStackProps({ spacing: 'md' })}>
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </Card.Content>
      </Card>
    );
  }
);

export default GigGroup;
