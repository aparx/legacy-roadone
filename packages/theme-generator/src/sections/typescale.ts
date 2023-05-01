import { SectionBuilderParent, SectionGenerator } from '../builder';
import { Theme, TypescaleSection } from 'theme-core';

export class TypescaleGenerator extends SectionGenerator<
  TypescaleSection,
  Theme
> {
  constructor(parent: SectionBuilderParent<TypescaleSection, Theme>) {
    super(parent, undefined);
  }

  generate(): Promise<this> {
    return this.merge({
      display: {
        lg: {
          fontFamily: 'brand',
          fontWeight: 'heavy',
          fontSize: 57,
          lineHeight: 64,
          letterSpacing: -0.25,
        },
        md: {
          fontFamily: 'brand',
          fontWeight: 'heavy',
          fontSize: 45,
          lineHeight: 52,
          letterSpacing: 0,
        },
        sm: {
          fontFamily: 'brand',
          fontWeight: 'heavy',
          fontSize: 36,
          lineHeight: 44,
          letterSpacing: 0,
        },
      },
      headline: {
        lg: {
          fontFamily: 'plain',
          fontWeight: 'strong',
          fontSize: 32,
          lineHeight: 40,
          letterSpacing: 0,
        },
        md: {
          fontFamily: 'plain',
          fontWeight: 'strong',
          fontSize: 28,
          lineHeight: 36,
          letterSpacing: 0,
        },
        sm: {
          fontFamily: 'plain',
          fontWeight: 'strong',
          fontSize: 24,
          lineHeight: 32,
          letterSpacing: 0,
        },
      },
      title: {
        lg: {
          fontFamily: 'plain',
          fontWeight: 'strong',
          fontSize: 22,
          lineHeight: 28,
          letterSpacing: 0,
        },
        md: {
          fontFamily: 'plain',
          fontWeight: 'strong',
          fontSize: 16,
          lineHeight: 24,
          letterSpacing: 0.15,
        },
        sm: {
          fontFamily: 'plain',
          fontWeight: 'medium',
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.1,
        },
      },
      body: {
        lg: {
          fontFamily: 'plain',
          fontWeight: 'regular',
          fontSize: 16,
          lineHeight: 24,
          letterSpacing: 0.5,
        },
        md: {
          fontFamily: 'plain',
          fontWeight: 'regular',
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.25,
        },
        sm: {
          fontFamily: 'plain',
          fontWeight: 'regular',
          fontSize: 12,
          lineHeight: 16,
          letterSpacing: 0.4,
        },
      },
      label: {
        lg: {
          fontFamily: 'plain',
          fontWeight: 'medium',
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.1,
        },
        md: {
          fontFamily: 'plain',
          fontWeight: 'medium',
          fontSize: 12,
          lineHeight: 16,
          letterSpacing: 0.5,
        },
        sm: {
          fontFamily: 'plain',
          fontWeight: 'medium',
          fontSize: 11,
          lineHeight: 16,
          letterSpacing: 0.5,
        },
      },
    });
  }
}
