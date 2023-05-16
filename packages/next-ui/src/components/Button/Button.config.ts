import { StackProps } from '../Stack/Stack';
import type { ButtonOptions, ButtonType } from './Button';
import { ButtonSize, buttonSizeArray } from './Button';
import type {
  ButtonRenderPropFactory,
  SizeBasedButtonOptions,
} from './Button.renderer';
import { merge } from 'lodash';
import { DeepPartial } from 'utility-types';

/** Config module for the `Button` component(s) */
export module ButtonConfig {
  export module Defaults {
    export const size = 'md' satisfies ButtonSize;
    export const alignContent = true satisfies StackProps<any>['hAlign'];
  }

  /** External button config utilities managed under the "config" */
  export namespace External {
    // <=> IMPLEMENTATION <=>

    type _OptsIn = {
      _opts: ButtonOptions;
    };

    type _SizeMap = {
      _size: Record<ButtonSize, _OptsIn>;
    };

    type _TypeMap<TType extends ButtonType> = {
      _type: Record<TType, _OptsIn & _SizeMap>;
    };

    type _Factory<TType extends ButtonType> = {
      _factory: ButtonRenderPropFactory<TType>;
    };

    // prettier-ignore
    export type ButtonAppearanceTree<TType extends ButtonType> =
      Partial<_Factory<TType>>
      & DeepPartial<_TypeMap<TType> & _SizeMap>
      & _OptsIn;

    // prettier-ignore
    export type ButtonAppearanceModule<TTypes extends ButtonType[]> =
      Partial<_Factory<TTypes[number]>>
      & Record<TTypes[number], SizeBasedButtonOptions>
      & { types: TTypes };

    export function treeToModule<TTypes extends ButtonType[]>(
      types: TTypes,
      tree: ButtonAppearanceTree<TTypes[number]>
    ): ButtonAppearanceModule<TTypes> {
      const out: DeepPartial<ButtonAppearanceModule<any>> = {};
      const _tree = tree as ButtonAppearanceTree<any>;
      for (const type of types) {
        out[type] ??= {};
        // premature optimization is evil, thus we'll keep this until issues
        const typeMerge = merge({}, tree._opts, _tree._type?.[type]?._opts);
        for (const size of buttonSizeArray) {
          out[type]![size] = merge(
            {},
            typeMerge,
            _tree._size?.[size]?._opts,
            _tree._type?.[type]?._size?.[size]
          );
        }
      }
      out.types = types;
      out._factory = tree._factory;
      return out as ButtonAppearanceModule<TTypes>;
    }
  }
}
