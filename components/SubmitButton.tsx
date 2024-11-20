import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { colors } from "../constants/colors";

interface SubmitButtonProps {
  onPress: () => void;
  disabled?: boolean;
  title: string;
  color?: string;
  style: Record<string, number | string>;
}

const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const enabledBgColor = props.color || colors.pink;
  const disabledBgColor = colors.lightGrey;
  const bgColor = props.disabled ? disabledBgColor : enabledBgColor;

  return (
    <TouchableOpacity
      onPress={props.disabled ? () => {} : props.onPress}
      style={{
        ...styles.button,
        ...props.style,
        ...{ backgroundColor: bgColor },
      }}
    >
      <Text style={{ color: props.disabled ? colors.grey : colors.white }}>
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SubmitButton;
