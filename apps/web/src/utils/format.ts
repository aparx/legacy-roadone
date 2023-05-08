export function formatMessage(message: string, ...args: string[]) {
  if (!args.length) return message;
  let i = 0;
  return message.replaceAll(/%s/g, () => args[i++]);
}
