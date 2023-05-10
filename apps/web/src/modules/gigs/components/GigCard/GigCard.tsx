/** @jsxImportSource @emotion/react */
import * as style from './GigCard.style';
import { address } from '@/modules/gigs/components/GigCard/GigCard.style';
import { GigEvent } from '@/modules/schemas/gig';
import { useMessage } from '@/utils/hooks/useMessage';
import {
  propMerge,
  PropsWithoutChildren,
  PropsWithStyleable,
  Stack,
  Text,
  UI,
  useStyleableMerge,
} from 'next-ui';
import { useStackProps } from 'next-ui/src/components/Stack/Stack';
import { usePinpointTextProps } from 'next-ui/src/components/Text/Text';
import { forwardRef, HTMLAttributes, useMemo } from 'react';

// Any `GigEvent` is renderable, but some might include extra (render) data
export type RenderableGig = GigEvent & {
  /** @default 'upcoming' */
  state?: 'upcoming' | 'next' | 'done';
};

export type GigProps = PropsWithoutChildren<HTMLAttributes<HTMLDivElement>> &
  PropsWithStyleable<{ gig: RenderableGig }>;

export const GigCard = forwardRef<HTMLDivElement, GigProps>(
  function GigRenderer({ gig, ...restProps }, ref) {
    const isDone = gig.state === 'done';
    const isNext = gig.state === 'next';
    // prettier-ignore
    const [day, month, zone] = useMemo(() => [
      // cannot use automatic locale detection, because of SSR (server locale)
      gig.start.toLocaleString('de-DE', { day: '2-digit' }),
      gig.start.toLocaleString('de-DE', { month: 'short' }),
      gig.start.toLocaleString('de-DE', { timeZoneName: 'short' }),
    ], [gig.start]);
    // Renderable address information being displayed with a possible separator
    const address: string[] = [`${gig.postcode} ${gig.city}`, `${gig.street}`];
    return (
      <Stack
        ref={ref}
        as={'article'}
        direction={'row'}
        spacing={0}
        aria-label={useMessage('aria.gig.card', zone)}
        tabIndex={isDone ? -1 : undefined}
        aria-hidden={isDone}
        sd={{
          roundness: UI.generalRoundness,
          background: (t) =>
            isNext
              ? t.sys.color.scheme.primaryContainer
              : t.sys.color.surface[2],
          color: (t) =>
            isNext
              ? t.sys.color.scheme.onPrimaryContainer
              : t.sys.color.scheme.onSurface,
        }}
        {...propMerge(useStyleableMerge(restProps), {
          style: { overflow: 'hidden' },
        })}
      >
        {/* prefix box (day-month-box) */}
        <Stack
          direction={'column'}
          spacing={0}
          vAlign
          aria-hidden={true /* replaced by top aria-label */}
          sd={{
            padding: 'xl',
            background: ({ sys: { color } }) =>
              isDone
                ? color.surface[4]
                : isNext
                ? color.scheme.inversePrimary
                : color.scheme.secondaryContainer,
          }}
          {...usePinpointTextProps({
            role: 'title',
            size: 'md',
            color: ({ sys: { color } }) =>
              isDone
                ? color.scheme.onSurface
                : isNext
                ? color.scheme.inverseOnPrimary
                : color.scheme.onSecondaryContainer,
            emphasis: isDone ? 'disabled' : 'high',
          })}
        >
          <div>{day}.</div>
          <div>{month}</div>
        </Stack>
        {/* address and time */}
        <Stack direction={'column'} spacing={0} sd={{ padding: 'xl' }}>
          <header>
            <Text.Title size={'md'} emphasis={isDone ? 'disabled' : 'high'}>
              {gig.title}
            </Text.Title>
          </header>
          <Text.Body
            as={'section'}
            size={'md'}
            emphasis={isDone ? 'disabled' : 'high'}
            {...propMerge(useStackProps({ direction: 'row', spacing: 'md' }), {
              style: { flexWrap: 'wrap' },
            })}
          >
            <address css={style.address}>
              {address.map((info, i) => {
                return [
                  i !== 0 ? (
                    <span key={`${info}_separator`} css={style.separator} />
                  ) : undefined,
                  <span key={info}>{info}</span>,
                ];
              })}
            </address>
            <div css={style.time}>
              <span css={style.separator} />
              <time dateTime={gig.start.toISOString()}>
                {`${gig.start.toLocaleString('de-DE', {
                  hour: 'numeric',
                  minute: 'numeric',
                })} Uhr`}
              </time>
            </div>
          </Text.Body>
          {gig.description?.length && (
            <Text.Body
              as={'footer'}
              size={'md'}
              emphasis={isDone ? 'disabled' : 'medium'}
            >
              {gig.description}
            </Text.Body>
          )}
        </Stack>
      </Stack>
    );
  }
);

export default GigCard;
