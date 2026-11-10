import { useState, type ReactNode } from 'react';
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { COLORS } from '@/shared/theme';

export type TextFieldVariant = 'default' | 'compact';

export type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  rightElement?: ReactNode;
  leftElement?: ReactNode;
  variant?: TextFieldVariant;
  error?: string | null;
  helperText?: string;
} & Omit<TextInputProps, 'value' | 'onChangeText'>;

export function TextField({
  label,
  rightElement,
  leftElement,
  variant = 'default',
  error,
  helperText,
  className,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus: TextInputProps['onFocus'] = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur: TextInputProps['onBlur'] = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const isCompact = variant === 'compact';
  const heightClass = isCompact ? 'h-11' : 'h-14';
  const textClass = isCompact ? 'text-xs' : 'text-[15px]';
  const paddingLeftClass = leftElement ? (isCompact ? 'pl-9' : 'pl-11') : 'pl-4';
  const paddingRightClass = rightElement ? (isCompact ? 'pr-9' : 'pr-12') : 'pr-4';

  const borderClass = error
    ? 'border-coral'
    : isFocused
      ? 'border-petrol'
      : 'border-sky';

  return (
    <View className="w-full">
      {label ? (
        <Text
          className={`mb-1.5 font-medium text-petrol ${
            isCompact ? 'text-xs' : 'text-sm'
          }`}>
          {label}
        </Text>
      ) : null}

      <View className="relative justify-center">
        {leftElement ? (
          <View
            className={`absolute bottom-0 top-0 justify-center z-10 ${
              isCompact ? 'left-3' : 'left-3.5'
            }`}>
            {leftElement}
          </View>
        ) : null}

        <TextInput
          className={`rounded-2xl border bg-white ${heightClass} ${textClass} ${paddingLeftClass} ${paddingRightClass} text-petrol ${borderClass} ${
            className || ''
          }`}
          placeholderTextColor={COLORS.STEEL}
          onBlur={handleBlur}
          onFocus={handleFocus}
          {...inputProps}
        />

        {rightElement ? (
          <View
            className={`absolute bottom-0 top-0 justify-center z-10 ${
              isCompact ? 'right-3' : 'right-4'
            }`}>
            {rightElement}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text className="mt-1 text-xs text-coral font-medium">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-xs text-steel">{helperText}</Text>
      ) : null}
    </View>
  );
}
