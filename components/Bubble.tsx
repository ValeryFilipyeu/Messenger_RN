import React, { useRef } from "react";
import { StyleSheet, Text, View, TouchableWithoutFeedback } from "react-native";
import uuid from "react-native-uuid";
import * as Clipboard from "expo-clipboard";
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuContextProps,
  withMenuContext,
} from "react-native-popup-menu";

import { colors } from "../constants/colors";
import MenuItem from "./MenuItem";

interface BubbleProps {
  text: string;
  type: "system" | "error" | "myMessage" | "theirMessage";
}

const Bubble: React.FC<BubbleProps & MenuContextProps> = ({
  text,
  type,
  ctx,
}) => {
  const style = styles({ text, type });

  const id = useRef(uuid.v4());

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      console.log(error);
    }
  };

  const onLongPress = async () => {
    await ctx.menuActions.openMenu(id.current);
  };

  return (
    <View style={style.wrapperStyle}>
      <TouchableWithoutFeedback
        style={{ width: "100%" }}
        onLongPress={
          type === "myMessage" || type === "theirMessage"
            ? onLongPress
            : () => {}
        }
      >
        <View style={style.bubbleStyle}>
          <Text style={style.textStyle}>{text}</Text>

          <Menu name={id.current}>
            <MenuTrigger />

            <MenuOptions>
              <MenuItem
                text="Copy to clipboard"
                icon="copy"
                onSelect={() => copyToClipboard(text)}
              />
              <MenuItem
                text="Star message"
                icon="star"
                onSelect={() => copyToClipboard(text)}
              />
            </MenuOptions>
          </Menu>
        </View>
      </TouchableWithoutFeedback>
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

export default withMenuContext(Bubble);
