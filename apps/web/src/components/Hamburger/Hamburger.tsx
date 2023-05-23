/** @jsxImportSource @emotion/react */
import { HamburgerConfig as config } from './Hamburger.config';
import { LocalState } from '@/utils/localState';
import { useTheme } from '@emotion/react';
import { Button, propMerge } from 'next-ui';
import {
  ButtonHTMLAttributes,
  forwardRef,
  RefObject,
  useImperativeHandle,
  useRef,
} from 'react';
import { MdClose, MdMenu } from 'react-icons/md';

// prettier-ignore
export type HamburgerProps = {
  label: string;
  stateOpen: LocalState<boolean>
  size?: number;
  controls?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export type HamburgerRef = {
  readonly stateOpen: HamburgerProps['stateOpen'];
  readonly button: RefObject<HTMLButtonElement>;
};

export const Hamburger = forwardRef<HamburgerRef, HamburgerProps>(
  function HamburgerRenderer(
    { label, controls, size = config.Defaults.size, stateOpen, ...restProps },
    ref
  ) {
    const { multipliers } = useTheme().rt;
    const button = useRef<HTMLButtonElement>(null);
    const newPadding = size / config.Defaults.size;
    useImperativeHandle(ref, () => ({ button, stateOpen }), [stateOpen]);
    return (
      <Button.Text
        tight
        ref={button}
        aria-label={label}
        aria-controls={controls}
        aria-expanded={controls ? stateOpen.state : undefined}
        onClick={() => stateOpen.set((b) => !b)}
        take={{
          roundness: 'full',
          vPadding: newPadding,
          hPadding: newPadding,
        }}
        {...propMerge(restProps, {
          style: { padding: `0 ${multipliers.spacing(newPadding)}px` },
        })}
      >
        {stateOpen.state ? <MdClose size={size} /> : <MdMenu size={size} />}
      </Button.Text>
    );
  }
);

export default Hamburger;
