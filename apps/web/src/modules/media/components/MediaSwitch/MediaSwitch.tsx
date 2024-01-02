/** @jsxImportSource @emotion/react */
import { NavbarConfig } from '@/layout/components';
import { MediaItemType, mediaItemTypeArray } from '@/modules/media/media';
import { LocalState } from '@/utils/localState';
import { getGlobalMessage } from '@/utils/message';
import { useTheme } from '@emotion/react';
import { Button, Stack, UI } from 'next-ui';
import { forwardRef } from 'react';

export type MediaSwitchProps = {
  state: LocalState<MediaItemType>;
  disabled?: boolean;
  'aria-controls'?: string;
};

export const MediaSwitch = forwardRef<HTMLOListElement, MediaSwitchProps>(
  function MediaSwitchRenderer(props, ref) {
    const { state, disabled, ...rest } = props;
    const theme = useTheme();
    return (
      <Stack
        ref={ref}
        aria-label={'content type selection'}
        direction={'row'}
        as={'ol'}
        aria-disabled={disabled}
        spacing={0.75}
        {...rest} // Maybe apply aria-controls etc. onto each button?
        sd={{
          fit: true,
          position: 'sticky',
          top: NavbarConfig.height + (theme.rt.multipliers.spacing('xl') ?? 0),
          padding: 0.75,
          zIndex: 99,
          boxShadow: `0 0 7px 3px ${theme.sys.color.elevation[0]}`,
          roundness: 1.5 * UI.generalRoundness,
          background: (t) => t.sys.color.surface[3],
        }}
      >
        {mediaItemTypeArray.map((x) => {
          return state.state === x ? (
            <li key={x}>
              <Button.Primary
                aria-controls={rest['aria-controls']}
                aria-pressed={true}
                disabled={disabled}
              >
                {getGlobalMessage(`media.filter.type.${x}`)}
              </Button.Primary>
            </li>
          ) : (
            <li key={x}>
              <Button.Surface
                aria-controls={rest['aria-controls']}
                onClick={() => state.set(x)}
                disabled={disabled}
                sd={{
                  background: (t) => t.sys.color.surface[3],
                  color: (t) => t.sys.color.scheme.onSurface,
                  emphasis: 'medium',
                }}
              >
                {getGlobalMessage(`media.filter.type.${x}`)}
              </Button.Surface>
            </li>
          );
        })}
      </Stack>
    );
  }
);

export default MediaSwitch;
