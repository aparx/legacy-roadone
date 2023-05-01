export interface DynamicSection {
  breakpoints: DynamicBreakpointSection;
  multipliers: DynamicMultiplierSection;
}

// <===================>
//      Breakpoints
// <===================>

export type DynamicBreakpointSection = Record<DynamicBreakpointName, number>;

export type DynamicBreakpointName = (typeof dynamicBreakpoints)[number];

// order matters (!)
export const dynamicBreakpoints = ['sm', 'md', 'lg', 'xl'] as const;

// <===================>
//      Multipliers
// <===================>

export type DynamicMultiplierSection = Record<DynamicMultiplierName, number>;

export type DynamicMultiplierName = (typeof dynamicMultipliers)[number];

export const dynamicMultipliers = ['spacing', 'roundness'] as const;
