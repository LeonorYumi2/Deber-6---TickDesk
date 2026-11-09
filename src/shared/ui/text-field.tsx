import { type ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  rightElement?: ReactNode;
} & Omit<TextInputProps, 'value' | 'onChangeText'>;

export function TextField({ label, rightElement, className, ...inputProps }: TextFieldProps) {
  return (
    <View>
      {label ? (
        <Text className="mb-2 text-sm font-medium text-petrol">{label}</Text>
      ) : null}
      <View className="relative justify-center">
        <TextInput
          className={`h-14 rounded-2xl border border-sky bg-white pl-4 ${
            rightElement ? 'pr-12' : 'pr-4'
          } text-[15px] text-petrol ${className || ''}`}
          placeholderTextColor="#7B969F"
          {...inputProps}
        />
        {rightElement ? (
          <View className="absolute bottom-0 right-4 top-0 justify-center">
            {rightElement}
          </View>
        ) : null}
      </View>
    </View>
  );
}
