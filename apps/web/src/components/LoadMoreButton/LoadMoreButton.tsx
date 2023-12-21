import { useTheme } from '@emotion/react';
import { Button, RequiredChildren, Spinner } from 'next-ui';
import { ButtonProps } from 'next-ui/src/components/Button/Button';

type LoadMoreButtonPropsBase = {
  /** True if the data is currently being loaded or (re-)fetched */
  updating: boolean;
  fetchNextPage: () => any;
};

export type LoadMoreButtonProps = (
  | (LoadMoreButtonPropsBase & {
      children: RequiredChildren;
      name?: undefined;
    })
  | (LoadMoreButtonPropsBase & {
      children?: undefined;
      name: string;
    })
) &
  ButtonProps;

export default function LoadMoreButton({
  children,
  name,
  updating,
  fetchNextPage,
  ...props
}: LoadMoreButtonProps) {
  const t = useTheme();
  return (
    <Button.Text
      take={{ vPaddingMode: 'oof' }}
      onClick={() => fetchNextPage()}
      disabled={updating}
      icon={updating && <Spinner size={2 + t.sys.typescale.body.md.fontSize} />}
      {...props}
    >
      {name}
      {children}
    </Button.Text>
  );
}
