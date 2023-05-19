/** @jsxImportSource @emotion/react */
import { GigGroupConfig as config } from './GigGroup.config';
import { GigCard } from '@/modules/gigs/components/GigCard';
import {
  GigRequiringMutationMap,
  RenderableGig,
} from '@/modules/gigs/components/GigCard/GigCard';
import { useMessage } from '@/utils/hooks/useMessage';
import {
  Card,
  PropsWithoutChildren,
  PropsWithStyleable,
  useStyleableMerge,
} from 'next-ui';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import { forwardRef, HTMLAttributes } from 'react';
import type { ObjectConjunction } from 'shared-utils';
import type { BreakpointName } from 'theme-core';

export type InternalGigGroupProps = {
  year: number;
  gigs: RenderableGig[];
  /** @default 'md' */
  width?: BreakpointName;
  events: GigRequiringMutationMap;
};

export type GigGroupProps = ObjectConjunction<
  PropsWithoutChildren<HTMLAttributes<HTMLDivElement>>,
  PropsWithStyleable<InternalGigGroupProps>
>;

export const GigGroup = forwardRef<HTMLDivElement, GigGroupProps>(
  function GigGroupRenderer({ year, gigs, width, events, ...restProps }, ref) {
    const isDone = year < new Date().getFullYear();
    return (
      <Card
        as={'article'}
        ref={ref}
        width={width ?? config.defaults.width}
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
          <ul {...useStackProps({ spacing: 'md' })}>
            {gigs.map((gig) => (
              <li
                role={gig.state === 'done' ? 'group' : undefined}
                key={gig.id}
                aria-hidden={gig.state === 'done'}
              >
                <GigCard gig={gig} {...events} />
              </li>
            ))}
          </ul>
        </Card.Content>
      </Card>
    );
  }
);

export default GigGroup;
