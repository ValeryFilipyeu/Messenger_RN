import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

interface BubbleProps {
  text: string;
  type: "system";
}

const Bubble: React.FC<BubbleProps> = ({ text, type }) => {
  const style = styles({ text, type });

  return (
    <View style={style.wrapperStyle}>
      <View style={style.bubbleStyle}>
        <Text style={style.textStyle}>{text}</Text>
      </View>
    </View>
  );
};

const styles = (props: BubbleProps) =>
  StyleSheet.create({
    wrapperStyle: {
      flexDirection: "row",
      justifyContent: "center",
    },
    bubbleStyle: {
      backgroundColor: props.type === "system" ? colors.beige : "white",
      alignItems: "center",
      marginTop: props.type === "system" ? 10 : 0,
      borderRadius: 6,
      padding: 5,
      marginBottom: 10,
      borderColor: "#E2DACC",
      borderWidth: 1,
    },
    textStyle: {
      color: props.type === "system" ? "#65644A" : "transparent",
      fontFamily: "regular",
      letterSpacing: 0.3,
    },
  });

export default Bubble;
