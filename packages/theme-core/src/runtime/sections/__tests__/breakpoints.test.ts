import type {
  BreakpointName,
  DynamicBreakpointSection,
} from '../../../reference';
import { RuntimeBreakpoints } from '../breakpoints';

describe('runtime breakpoints', () => {
  const bpMap: DynamicBreakpointSection = {
    xl: 1400,
    lg: 900,
    md: 500,
    sm: 350,
  };
  const rt = new RuntimeBreakpoints(bpMap);
  for (const _e in bpMap) {
    const bp = _e as BreakpointName;
    test(`'gte' and 'lte' and inverse - ${bp}`, () => {
      expect(rt.gte(bp)).toBe(`@media(min-width: ${bpMap[bp]}px)`);
      expect(rt.lte(bp)).toBe(`@media(max-width: ${bpMap[bp]}px)`);
      expect(rt.gte(bp, 'not')).toBe(`@media not (min-width: ${bpMap[bp]}px)`);
      expect(rt.lte(bp, 'not')).toBe(`@media not (max-width: ${bpMap[bp]}px)`);
    });
  }
  test("'only' - all breakpoints", () => {
    expect(rt.only('sm')).toBe(
      `@media(min-width: ${bpMap.sm}px) and (max-width: ${bpMap.md}px)`
    );
    expect(rt.only('md')).toBe(
      `@media(min-width: ${bpMap.md}px) and (max-width: ${bpMap.lg}px)`
    );
    expect(rt.only('lg')).toBe(
      `@media(min-width: ${bpMap.lg}px) and (max-width: ${bpMap.xl}px)`
    );
    expect(rt.only('xl')).toBe(`@media(min-width: ${bpMap.xl}px)`);
  });

  test("'only' inverse - all breakpoints", () => {
    expect(rt.only('sm', 'not')).toBe(
      `@media not (min-width: ${bpMap.sm}px) and  not (max-width: ${bpMap.md}px)`
    );
    expect(rt.only('md', 'not')).toBe(
      `@media not (min-width: ${bpMap.md}px) and  not (max-width: ${bpMap.lg}px)`
    );
    expect(rt.only('lg', 'not')).toBe(
      `@media not (min-width: ${bpMap.lg}px) and  not (max-width: ${bpMap.xl}px)`
    );
    expect(rt.only('xl', 'not')).toBe(`@media not (min-width: ${bpMap.xl}px)`);
  });
});
