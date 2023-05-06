const messageMap = {
  baseName: 'roadone',
  signIn: 'Einloggen',
} as const satisfies Readonly<Record<string, string>>;

export function getMessage(key: keyof typeof messageMap) {
  return messageMap[key];
}
