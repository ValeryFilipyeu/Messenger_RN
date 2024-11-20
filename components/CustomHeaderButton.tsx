import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = keyof typeof Ionicons.glyphMap;

interface CustomHeaderButtonProps {
  color?: string;
  name: IoniconName;
  onPress: () => void;
}

const CustomHeaderButton: React.FC<CustomHeaderButtonProps> = ({
  color,
  name,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Ionicons name={name} size={23} color={color ?? colors.blue} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginEnd: 10,
    marginStart: 15,
  },
});

export default CustomHeaderButton;
