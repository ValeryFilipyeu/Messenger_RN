import React, { useRef } from "react";
import { StyleSheet, Text, View, TouchableWithoutFeedback } from "react-native";
import { useSelector } from "react-redux";
import uuid from "react-native-uuid";
import * as Clipboard from "expo-clipboard";
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuContextProps,
  withMenuContext,
} from "react-native-popup-menu";
import { FontAwesome } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { Message } from "../types";
import { RootState } from "../store/store";
import { formatAmPm } from "../utils/formatAmPm";
import { starMessage } from "../utils/actions/chatActions";
import MenuItem from "./MenuItem";

interface BubbleProps {
  text: string;
  type: "system" | "error" | "myMessage" | "theirMessage" | "reply";
  date?: string;
  messageId?: string;
  chatId?: string;
  userId?: string;
  name?: string;
  setReply?: () => void;
  replyingTo?: Message;
}

const Bubble: React.FC<BubbleProps & MenuContextProps> = ({
  text,
  type,
  date,
  messageId,
  chatId,
  userId,
  name,
  setReply,
  replyingTo,
  ctx,
}) => {
  const style = styles(type);

  const starredMessages = useSelector(
    (state: RootState) => state.messages.starredMessages[String(chatId)] ?? {},
  );
  const storedUsers = useSelector(
    (state: RootState) => state.users.storedUsers,
  );

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

  let isUserMessage = false;
  const dateString = date ? formatAmPm(date) : null;

  if (type === "myMessage" || type === "theirMessage") {
    isUserMessage = true;
  }

  const isStarred =
    isUserMessage && starredMessages[String(messageId)] !== undefined;
  const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];

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
          {name && <Text style={style.name}>{name}</Text>}

          {replyingToUser && (
            <Bubble
              type="reply"
              text={replyingTo.text}
              name={`${replyingToUser.firstName} ${replyingToUser.lastName}`}
              ctx={ctx}
            />
          )}

          <Text style={style.textStyle}>{text}</Text>

          {dateString && (
            <View style={style.timeContainer}>
              {isStarred && (
                <FontAwesome
                  name="star"
                  size={14}
                  color={colors.textColor}
                  style={{ marginRight: 5 }}
                />
              )}
              <Text style={style.time}>{dateString}</Text>
            </View>
          )}

          <Menu name={id.current}>
            <MenuTrigger />

            <MenuOptions>
              <MenuItem
                text="Copy to clipboard"
                icon="copy"
                onSelect={() => copyToClipboard(text)}
              />
              <MenuItem
                text={`${isStarred ? "Unstar" : "Star"} message`}
                icon={isStarred ? "star-o" : "star"}
                onSelect={() =>
                  starMessage(String(messageId), String(chatId), String(userId))
                }
              />
              {setReply && (
                <MenuItem text="Reply" icon="arrow-left" onSelect={setReply} />
              )}
            </MenuOptions>
          </Menu>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = (
  type: "system" | "error" | "myMessage" | "theirMessage" | "reply",
) => {
  const bubbleMaxWidth =
    type === "system" || type === "theirMessage" ? "90%" : "auto";
  const bubbleMarginTop = type === "system" || type === "error" ? 10 : 0;
  const wrapperJustifyContent =
    (type === "myMessage" && "flex-end") ||
    (type === "theirMessage" && "flex-start") ||
    "center";
  const bubbleBgColor =
    (type === "system" && colors.beige) ||
    (type === "error" && colors.red) ||
    (type === "myMessage" && "#E7FED6") ||
    (type === "reply" && "#F2F2F2") ||
    "white";
  const textColor =
    (type === "system" && "#65644A") ||
    (type === "myMessage" && "#65644A") ||
    (type === "theirMessage" && colors.pink) ||
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
    timeContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    time: {
      fontFamily: "regular",
      letterSpacing: 0.3,
      color: colors.grey,
      fontSize: 12,
    },
    name: {
      fontFamily: "medium",
      letterSpacing: 0.3,
    },
  });
};

export default withMenuContext(Bubble);
