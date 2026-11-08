import { Text, TextInput, View, type TextInputProps } from 'react-native';

type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
} & Omit<TextInputProps, 'value' | 'onChangeText'>;

export function TextField({ label, ...inputProps }: TextFieldProps) {
  return (
    <View>
      {label ? (
        <Text className="mb-2 text-sm font-medium text-petrol">{label}</Text>
      ) : null}
      <TextInput
        className="h-14 rounded-2xl border border-sky bg-white px-4 text-[15px] text-petrol"
        placeholderTextColor="#7B969F"
        {...inputProps}
      />
    </View>
  );
}
