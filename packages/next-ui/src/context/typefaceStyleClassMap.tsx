import { useTheme } from '@emotion/react';
import { createContext, ProviderProps, useContext } from 'react';
import {
  TypefaceFamily,
  typefaceFamilyArray,
  TypefaceRole,
  typefaceRoleArray,
} from 'theme-core';

/**
 * Map of all typeface families and their respective CSS classes.
 * These stylesheet classes are determined by the outside application.
 * All typeface families must be variable fonts!
 */
export type TypefaceStyleClassMap = Record<TypefaceFamily, string>;

export const typefaceStyleClassContext = createContext<TypefaceStyleClassMap>({
  roboto: '__roboto_unknown__',
});

export const TypefaceStyleClassProvider = (
  props: ProviderProps<TypefaceStyleClassMap>
) => <typefaceStyleClassContext.Provider {...props} />;

export function useTypefaceStyleClassMap(): TypefaceStyleClassMap {
  return useContext(typefaceStyleClassContext);
}

export function useTypefaceStyleClass<
  TTarget extends TypefaceFamily | TypefaceRole
>(target: TTarget): string {
  const theme = useTheme();
  const styleClassMap = useTypefaceStyleClassMap();
  if ((typefaceRoleArray as readonly any[]).includes(target))
    return styleClassMap[theme.ref.typeface[target as TypefaceRole]];
  if ((typefaceFamilyArray as readonly any[]).includes(target))
    return styleClassMap[target as TypefaceFamily];
  throw new Error('Illegal typeface style class target');
}
