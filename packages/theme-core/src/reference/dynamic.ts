export interface DynamicSection {
  breakpoints: BreakpointSection;
  multipliers: MultiplierSection;
  /** Named emphasis of colors in opacity levels. */
  emphasis: OpacityEmphasisSection;
}

// <===================>
//      Breakpoints
// <===================>

export type BreakpointSection = Record<BreakpointName, number>;

export type BreakpointName = (typeof dynamicBreakpoints)[number];

// ORDER MATTERS !! (from lowest to highest!)
export const dynamicBreakpoints = ['sm', 'md', 'lg', 'xl'] as const;

// <===================>
//      Multipliers
// <===================>

export type MultiplierSection = Record<MultiplierName, number>;

export type MultiplierName = (typeof dynamicMultipliers)[number];

export const dynamicMultipliers = ['spacing', 'roundness'] as const;

// <===================>
//       Emphasis
// <===================>

export type OpacityEmphasisSection = Record<OpacityEmphasis, number>;

export type OpacityEmphasis = (typeof dynamicOpacityEmphasis)[number];

// prettier-ignore
export const dynamicOpacityEmphasis = [
  'disabled', 'low', 'medium', 'high'
]  as const;
