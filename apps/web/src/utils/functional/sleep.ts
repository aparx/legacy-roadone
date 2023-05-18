export const sleepUnitMap = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
} as const;

export type SleepDurationUnit = keyof typeof sleepUnitMap;

export function sleep(duration: number, unit: SleepDurationUnit = 'ms') {
  return new Promise((r) => setTimeout(r, duration * sleepUnitMap[unit]));
}
