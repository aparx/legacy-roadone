/** @jsxImportSource @emotion/react */
import { NavbarConfig } from '@/components';
import { GigEvent } from '@/modules/schemas/gig';
import { useWindowBreakpoint } from '@/utils/context/windowBreakpoint';
import { useMessage } from '@/utils/hooks/useMessage';
import { css, Theme } from '@emotion/react';
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
import { forwardRef, HTMLAttributes } from 'react';

import drawerBreakpoint = NavbarConfig.drawerBreakpoint;

// Every GigEvent is renderable, but some might include extra (render) data
export type RenderableGig = GigEvent &
  Partial<{
    /** @default 'upcoming' */
    state: 'upcoming' | 'next' | 'done';
  }>;

export type GigProps = PropsWithoutChildren<HTMLAttributes<HTMLDivElement>> &
  PropsWithStyleable<{ gig: RenderableGig }>;

export const GigCard = forwardRef<HTMLDivElement, GigProps>(
  function GigRenderer({ gig, ...restProps }, ref) {
    const isDone = gig.state === 'done';
    const isNext = gig.state === 'next';
    const day = gig.start.toLocaleString('de-DE', { day: '2-digit' });
    const month = gig.start.toLocaleString('de-DE', { month: 'short' });
    // const isDone = Date.now() - 2.16e7 /* 6h */ >= gig.start.getTime();
    const bp = useWindowBreakpoint();
    let addressInfo: string[] = [
      `${gig.postcode} ${gig.city}`,
      `${gig.street}`,
    ];
    const renderTight = !!bp?.to?.lte(drawerBreakpoint);
    const addressSeparator = !renderTight ? '-' : undefined;
    return (
      <Stack
        ref={ref}
        as={'article'}
        direction={'row'}
        spacing={0}
        aria-label={useMessage('aria.gig.cardLabel', 'f')}
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
        <Stack
          direction={'column'}
          spacing={0}
          vCenter
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
        <Stack direction={'column'} spacing={0} sd={{ padding: 'xl' }}>
          <Text.Title
            as={'header'}
            size={'md'}
            emphasis={isDone ? 'disabled' : 'high'}
          >
            {gig.title}
          </Text.Title>
          <Text.Body
            size={'md'}
            emphasis={isDone ? 'disabled' : 'high'}
            {...propMerge(useStackProps({ direction: 'row', spacing: 'md' }), {
              style: { flexWrap: 'wrap' },
            })}
          >
            <address
              {...propMerge(
                useStackProps({
                  direction: renderTight ? 'column' : 'row',
                  spacing: renderTight ? 0 : 'md',
                }),
                {
                  css: renderTight
                    ? (t: Theme) =>
                        css({ paddingRight: t.rt.multipliers.spacing('xl') })
                    : undefined,
                }
              )}
            >
              {addressInfo.map((info, i) => {
                let del = i !== 0 ? addressSeparator : undefined;
                return [
                  del && <div key={i}>{del}</div>,
                  <div key={i}>{info}</div>,
                ];
              })}
            </address>
            {addressSeparator && <div>{addressSeparator}</div>}
            <time dateTime={gig.start.toISOString()}>
              {`${gig.start.toLocaleString('de-DE', {
                hour: 'numeric',
                minute: 'numeric',
              })} Uhr`}
            </time>
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
