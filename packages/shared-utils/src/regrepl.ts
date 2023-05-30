export type RegreplDecorator<TDecoratorOutput> = (
  match: string,
  index: number,
  result?: RegExpExecArray
) => TDecoratorOutput;

export type RegreplConfig<TDecoratorOutput> = {
  pattern: RegExp;
  decorator: RegreplDecorator<TDecoratorOutput>;
};

export function regrepl<TDecoratorOutput>(
  config: RegreplConfig<TDecoratorOutput>,
  input: string
): (TDecoratorOutput | string)[] {
  // By regexify-string, but modified
  const { pattern, decorator } = config;
  const output: (TDecoratorOutput | string)[] = [];
  let matchIndex = 0;
  let builder = input;
  for (let result; (result = pattern.exec(builder)) !== null; ) {
    const startAt = result.index;
    const match = result[0];

    const contentBeforeMatch: string = builder.substring(0, startAt);
    const decoratedMatch = decorator(match, matchIndex, result);

    output.push(contentBeforeMatch);
    output.push(decoratedMatch);

    builder = builder.substring(startAt + match.length, builder.length + 1);
    pattern.lastIndex = 0;
    ++matchIndex;
  }
  if (builder) output.push(builder);
  return output;
}
