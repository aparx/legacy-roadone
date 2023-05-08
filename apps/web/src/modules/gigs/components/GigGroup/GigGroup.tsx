/** @jsxImportSource @emotion/react */
import { GigCard } from '@/modules/gigs/components/GigCard';
import { RenderableGig } from '@/modules/gigs/components/GigCard/GigCard';
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
    return (
      <Card
        ref={ref}
        width={'md'}
        id={`${year}`}
        {...useStyleableMerge(restProps)}
      >
        <Card.Header
          title={`${year}`}
          {...useStackProps({ direction: 'row', hCenter: true })}
        />
        <Card.Content {...useStackProps({ spacing: 'md' })}>
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig} isNext={true} />
          ))}
        </Card.Content>
      </Card>
    );
  }
);

export default GigGroup;
