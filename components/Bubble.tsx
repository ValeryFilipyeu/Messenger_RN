import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

interface BubbleProps {
  text: string;
  type: "system" | "error" | "myMessage" | "theirMessage";
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

const styles = (props: BubbleProps) => {
  const bubbleMaxWidth =
    props.type === "system" || props.type === "theirMessage" ? "90%" : "auto";
  const bubbleMarginTop =
    props.type === "system" || props.type === "error" ? 10 : 0;
  const wrapperJustifyContent =
    (props.type === "myMessage" && "flex-end") ||
    (props.type === "theirMessage" && "flex-start") ||
    "center";
  const bubbleBgColor =
    (props.type === "system" && colors.beige) ||
    (props.type === "error" && colors.red) ||
    (props.type === "myMessage" && "#E7FED6") ||
    "white";
  const textColor =
    (props.type === "system" && "#65644A") ||
    (props.type === "myMessage" && "#65644A") ||
    (props.type === "theirMessage" && colors.pink) ||
    "white";

  return StyleSheet.create({
    wrapperStyle: {
      flexDirection: "row",
      justifyContent: wrapperJustifyContent,
    },
    bubbleStyle: {
      backgroundColor: bubbleBgColor,
      alignItems: "center",
      marginTop: bubbleMarginTop,
      borderRadius: 6,
      padding: 5,
      marginBottom: 10,
      borderColor: "#E2DACC",
      borderWidth: 1,
      maxWidth: bubbleMaxWidth,
    },
    textStyle: {
      color: textColor,
      fontFamily: "regular",
      letterSpacing: 0.3,
    },
  });
};

export default Bubble;
