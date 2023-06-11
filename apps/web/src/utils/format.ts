export function formatString(string: string, ...args: any[]) {
  if (!args.length) return string;
  let i = 0;
  return string.replaceAll(/%s/g, () => args[i++]);
}
