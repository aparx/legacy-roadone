/** @jsxImportSource @emotion/react */
import * as style from './GigCard.style';
import { Permission } from '@/modules/auth/utils/permission';
import { address } from '@/modules/gigs/components/GigCard/GigCard.style';
import { GigProcessedData } from '@/modules/schemas/gig';
import { Globals } from '@/utils/global/globals';
import { useMessage } from '@/utils/hooks/useMessage';
import { getGlobalMessage } from '@/utils/message';
import { InfiniteItemMutateFunction } from '@/utils/pages/infinite/infiniteItem';
import {
  Button,
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
import { MdDelete, MdEdit } from 'react-icons/md';

export type GigMutateFunction = (gig: RenderableGig) => any;

export type GigMutateFunctionMap = {
  onEdit: InfiniteItemMutateFunction<'edit', RenderableGig>;
  onDelete: InfiniteItemMutateFunction<'delete', RenderableGig>;
};

// Any `GigEvent` is renderable, but some might include extra (render) data
export type RenderableGig = GigProcessedData & {
  /** @default 'upcoming' */
  state?: 'upcoming' | 'next' | 'done';
};

export type GigProps = PropsWithoutChildren<HTMLAttributes<HTMLDivElement>> &
  PropsWithStyleable<{ gig: RenderableGig } & GigMutateFunctionMap>;

export const GigCard = forwardRef<HTMLDivElement, GigProps>(
  function GigRenderer({ gig, onEdit, onDelete, ...restProps }, ref) {
    const isDone = gig.state === 'done';
    const isNext = gig.state === 'next';
    // prettier-ignore
    const [day, month, zone] = useMemo(() => [
      // cannot use automatic locale detection, because of SSR (server locale)
      gig.start.toLocaleString(Globals.timeLocale, { day: '2-digit' }),
      gig.start.toLocaleString(Globals.timeLocale, { month: 'short' }),
      gig.start.toLocaleString(Globals.timeLocale, { timeZoneName: 'short' }),
    ], [gig.start]);
    // Renderable address information being displayed with a possible separator
    const address: string[] = [`${gig.postcode} ${gig.city}`, `${gig.street}`];
    const showEdit = Permission.useGlobalPermission('editEvents');
    const showDelete = Permission.useGlobalPermission('deleteEvents');
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
        <Stack spacing={0} sd={{ padding: 'xl', width: '100%' }}>
          <Stack
            as={'header'}
            direction={'row'}
            spacing={'lg'}
            hAlign={'space-between'}
            vAlign
            style={{ flexWrap: 'wrap' }}
          >
            <Text.Title size={'md'} emphasis={isDone ? 'disabled' : 'high'}>
              {gig.title}
            </Text.Title>
            {(showEdit || showDelete) && (
              <Stack direction={'row'}>
                {showEdit && (
                  <Button.Text
                    tight
                    aria-label={getGlobalMessage('translation.edit')}
                    onClick={() => onEdit({ item: gig })}
                    sd={{
                      color: (t) => t.sys.color.scheme.onSurface,
                      emphasis: 'medium',
                    }}
                  >
                    <MdEdit />
                  </Button.Text>
                )}
                {showDelete && (
                  <Button.Text
                    tight
                    aria-label={getGlobalMessage('translation.delete')}
                    onClick={() => onDelete({ item: gig })}
                    sd={{
                      color: (t) => t.sys.color.scheme.error,
                      emphasis: 'medium',
                    }}
                  >
                    <MdDelete />
                  </Button.Text>
                )}
              </Stack>
            )}
          </Stack>
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
                {`${gig.start.toLocaleString(Globals.timeLocale, {
                  hour: 'numeric',
                  minute: 'numeric',
                })} Uhr`}
              </time>
            </div>
          </Text.Body>
          {gig.description && (
            <Text.Body
              as={'footer'}
              size={'md'}
              emphasis={isDone ? 'disabled' : 'medium'}
              dangerouslySetInnerHTML={{
                __html: gig.htmlDescription ?? gig.description,
              }}
            />
          )}
        </Stack>
      </Stack>
    );
  }
);

export default GigCard;

function Dialog() {}
