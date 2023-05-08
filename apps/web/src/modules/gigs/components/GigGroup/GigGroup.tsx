/** @jsxImportSource @emotion/react */
import { GigCard } from '@/modules/gigs/components/GigCard';
import { Gig } from '@/modules/schemas/gig';
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
  PropsWithStyleable<{ year: number; gigs: Gig[] }>;

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
        <Card.Content>
          {gigs.map((gig) => (
            <GigCard key={gig.id} gig={gig as Gig} />
          ))}
        </Card.Content>
      </Card>
    );
  }
);

export default GigGroup;
