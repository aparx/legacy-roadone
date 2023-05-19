/** @jsxImportSource @emotion/react */
import {
  propMerge,
  PropsWithoutChildren,
  PropsWithStyleable,
  useStyleableMerge,
} from '../../utils';
import { Icon } from '../Icon';
import { Stack } from '../Stack';
import { Text } from '../Text';
import { useDataTextProps, useFontData } from '../Text/Text';
import { TextFieldConfig as config } from './TextField.config';
import * as style from './TextField.style';
import { jsx, useTheme } from '@emotion/react';
import { capitalize } from 'lodash';
import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  RefAttributes,
  RefObject,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import { FieldErrors, UseFormReturn } from 'react-hook-form';
import { FieldValues } from 'react-hook-form/dist/types/fields';
import { FieldPath } from 'react-hook-form/dist/types/path';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';
import type { IconBaseProps } from 'react-icons';
import {
  MdAlarm,
  MdCalendarMonth,
  MdCalendarViewWeek,
  MdEmail,
  MdLink,
  MdNumbers,
  MdPassword,
  MdPhone,
  MdSearch,
  MdTextFields,
} from 'react-icons/md';
import { ObjectConjunction, UnionExtract } from 'shared-utils';
import { OpacityEmphasis } from 'theme-core';

export type TextFieldType =
  | UnionExtract<
      InputHTMLAttributes<HTMLInputElement>['type'],
      | 'text'
      | 'time'
      | 'date'
      | 'datetime-local'
      | 'tel'
      | 'password'
      | 'search'
      | 'email'
      | 'url'
      | 'number'
      | 'month'
      | 'week'
    >
  | 'textarea';

type BaseTextFieldProps<
  TName extends FieldPath<TFields> | string,
  TFields extends FieldValues
> = {
  /** @default 'text' */
  type?: TextFieldType;
  name: TName;
  /** @default 'name' but capitalized */
  placeholder?: string;
  required?: boolean | undefined;
  disabled?: boolean;
  /** If true, placeholder is invisible when content is contained within a field. */
  tight?: boolean;
  /** Leading icon is not displayed solo, a background is added for higher emphasis. */
  leading?: ReactNode;
  tailing?: ReactNode;
  /** Error message; none if undefined (overridden by `methods`) */
  error?: string;
};

export type TextFieldName<TFields extends FieldValues> = FieldPath<TFields>;

export type InternalTextFieldProps<
  TName extends TextFieldName<TFields>,
  TFields extends FieldValues
> = {
  hookform?: TName extends FieldPath<TFields>
    ? {
        /** (Optionally) apply react-hook-form data automatically.
         * This might override some manual props (e.g. `error`) */
        methods?: UseFormReturn<TFields>;
        errors?: FieldErrors<TFields>;
        options?: TName extends FieldPath<TFields>
          ? RegisterOptions<TFields, TName>
          : undefined;
      }
    : undefined;
} & BaseTextFieldProps<TName, TFields>;

export type TextFieldProps<
  TName extends TextFieldName<TFields>,
  TFields extends FieldValues
> = PropsWithStyleable<
  InternalTextFieldProps<TName, TFields> &
    PropsWithoutChildren<{
      field?: Omit<
        InputHTMLAttributes<HTMLInputElement>,
        keyof InternalTextFieldProps<TName, TFields>
      >;
    }> &
    PropsWithoutChildren<
      ObjectConjunction<
        HTMLAttributes<HTMLDivElement>,
        InternalTextFieldProps<TName, TFields>
      >
    >
>;

export type TextFieldRef = {
  name: string;
  /** The outer "shell" (i.e. wrapper) reference */
  shell: RefObject<HTMLDivElement>;
  /** The inner actual input field reference */
  field: RefObject<HTMLInputElement>;
};

export const typeToIconMap = {
  text: () => <MdTextFields />,
  time: () => <MdAlarm />,
  email: () => <MdEmail />,
  month: () => <MdCalendarMonth />,
  week: () => <MdCalendarViewWeek />,
  tel: () => <MdPhone />,
  url: () => <MdLink />,
  date: () => <MdCalendarMonth />,
  number: () => <MdNumbers />,
  search: () => <MdSearch />,
  password: () => <MdPassword />,
  'datetime-local': () => <MdCalendarMonth />,
} satisfies Partial<Record<TextFieldType, () => ReactElement<IconBaseProps>>>;

export const TextField = forwardRef(function TextFieldRenderer<
  TName extends TextFieldName<TFields>,
  TFields extends FieldValues
>(
  {
    type = config.Defaults.type,
    tight,
    placeholder,
    leading,
    tailing,
    disabled,
    name,
    field,
    hookform,
    error,
    required,
    ...rest
  }: TextFieldProps<TName, TFields>,
  ref: ForwardedRef<TextFieldRef>
) {
  placeholder ??= capitalize(name);
  const fieldRef = useRef<HTMLInputElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  // prettier-ignore
  useImperativeHandle(ref, () => ({
    field: fieldRef, shell: shellRef, name,
  }), [name]);
  const leadingIconId = useId();
  const tailingIconId = useId();
  // Font data used for the field itself
  const fontData = useFontData({ role: 'body', size: 'md' });
  const emphasis = disabled
    ? ('disabled' satisfies OpacityEmphasis)
    : undefined;
  let regProps = hookform?.methods?.register?.(name as any, {
    required,
    valueAsNumber: type === 'number' ? (true as any) : undefined,
    ...hookform.options,
  });
  let fieldState = hookform?.methods?.getFieldState?.(name as any);
  const isInvalid = Boolean(error || fieldState?.invalid);
  error ??= fieldState?.error?.message;
  if (
    hookform?.errors &&
    name in hookform?.errors &&
    typeof hookform?.errors[name] === 'string'
  ) {
    error ??= hookform.errors[name]!.message as string;
  }
  return (
    <Stack
      spacing={0.5}
      aria-disabled={disabled}
      {...propMerge(
        {
          css: style.shell(useTheme(), {
            error: isInvalid,
            showLeading: !!leading,
            disabled,
            fontData,
            leadingIconId,
            tailingIconId,
          }),
        },
        useStyleableMerge(rest)
      )}
    >
      {!tight && (
        <Text.Label size={'lg'} aria-hidden emphasis={emphasis}>
          {placeholder} {required && <sup css={style.asterisk}>*</sup>}
        </Text.Label>
      )}
      <Stack
        as={'label'}
        id={useId()}
        aria-label={placeholder}
        aria-disabled={disabled}
        spacing={0.5}
        {...useDataTextProps({ fontData, emphasis })}
      >
        {/* Field start */}
        <Stack direction={'row'} vAlign spacing={0}>
          {/* state-layer */}
          {leading && (
            <Icon identify={leadingIconId} fontData={fontData}>
              {leading === true && type in typeToIconMap
                ? typeToIconMap[type]()
                : leading}
            </Icon>
          )}
          {jsx(type === 'textarea' ? 'textarea' : 'input', {
            type: type === 'textarea' ? undefined : type,
            disabled,
            placeholder: tight ? placeholder : undefined,
            'aria-invalid': error ? true : undefined,
            'aria-errormessage': error,
            ...propMerge({ required }, field, regProps),
          })}
          {tailing && (
            <Icon identify={tailingIconId} fontData={fontData}>
              {tailing === true && type in typeToIconMap
                ? typeToIconMap[type]()
                : tailing}
            </Icon>
          )}
        </Stack>
      </Stack>
      {error && (
        <Text.Label
          size={'md'}
          color={(t) => t.sys.color.scheme.error}
          emphasis={emphasis}
          aria-hidden
        >
          {error}
        </Text.Label>
      )}
    </Stack>
  );
}) as <TName extends TextFieldName<TFields>, TFields extends FieldValues>(
  props: TextFieldProps<TName, TFields> & RefAttributes<TextFieldRef>
) => ReactElement;

export default TextField;
