import type { OptionalChildren } from 'next-ui';

export default function Repeat({
  amount,
  children,
}: {
  children: OptionalChildren;
  amount: number;
}) {
  const content: OptionalChildren[] = new Array(amount);
  for (let i = 0; i < amount; ++i) content[i] = children;
  return <>{content}</>;
}
