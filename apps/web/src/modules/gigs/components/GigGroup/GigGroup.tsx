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
import { BreakpointName } from 'theme-core';

export type GigGroupProps = PropsWithoutChildren<
  HTMLAttributes<HTMLDivElement>
> &
  PropsWithStyleable<{
    year: number;
    gigs: RenderableGig[];
    /** @default 'md' */
    width?: BreakpointName;
  }>;

export const GigGroup = forwardRef<HTMLDivElement, GigGroupProps>(
  function GigGroupRenderer({ year, gigs, width, ...restProps }, ref) {
    const isDone = year < new Date().getFullYear();
    return (
      <Card
        as={'article'}
        ref={ref}
        width={width ?? 'md'}
        id={`${year}`}
        aria-hidden={isDone}
        aria-label={useMessage('aria.gig.group', String(year))}
        {...useStyleableMerge(restProps)}
      >
        <Card.Header {...useStackProps({ direction: 'row', hAlign: true })}>
          <Card.Header.Title emphasis={isDone ? 'disabled' : 'high'}>
            {year}
          </Card.Header.Title>
        </Card.Header>
        <Card.Content>
          <ol {...useStackProps({ spacing: 'md' })}>
            {gigs.map((gig) => (
              <li
                role={gig.state === 'done' ? 'group' : undefined}
                key={gig.id}
                aria-hidden={gig.state === 'done'}
              >
                <GigCard gig={gig} />
              </li>
            ))}
          </ol>
        </Card.Content>
      </Card>
    );
  }
);

export default GigGroup;
