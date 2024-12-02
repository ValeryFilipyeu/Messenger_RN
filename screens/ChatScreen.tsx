import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { RootStackParamList } from "../types";
import { RootState } from "../store/store";
import PageContainer from "../components/PageContainer";
import Bubble from "../components/Bubble";
import { createChat, sendTextMessage } from "../utils/actions/chatActions";

const backgroundImage = require("../assets/images/droplet.jpeg");

interface ChatListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "ChatScreen">;
}

const ChatScreen: React.FC<ChatListScreenProps> = ({ navigation, route }) => {
  const [messageText, setMessageText] = useState("");
  const [chatUsers, setChatUsers] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null | undefined>(
    route.params?.chatId,
  );
  const [errorBannerText, setErrorBannerText] = useState("");

  const userData = useSelector((state: RootState) => state.auth.userData);
  const storedUsers = useSelector(
    (state: RootState) => state.users.storedUsers,
  );
  const storedChats = useSelector((state: RootState) => state.chats.chatsData);
  const selectChatMessages = (chatId: string | null | undefined) =>
    createSelector(
      (state: RootState) => state.messages.messagesData,
      (messagesData) => {
        if (!chatId) return [];

        const chatMessagesData = messagesData[chatId];

        if (!chatMessagesData) return [];

        return Object.keys(chatMessagesData).map((key) => ({
          key,
          ...chatMessagesData[key],
        }));
      },
    );
  const chatMessages = useSelector(selectChatMessages(chatId));

  const chatData = (chatId && storedChats[chatId]) || route.params?.newChatData;

  const getChatTitleFromName = (): string => {
    const otherUserId = chatUsers.find((uid) => uid !== userData?.userId);
    const otherUserData = storedUsers[String(otherUserId)];

    return (
      otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: getChatTitleFromName(),
    });
    setChatUsers(chatData?.users ?? []);
  }, [chatData, getChatTitleFromName()]);

  const sendMessage = useCallback(async () => {
    try {
      let id = chatId;
      if (!id && userData?.userId && route.params.newChatData) {
        id = await createChat(userData.userId, route.params.newChatData);
        setChatId(id);
      }

      if (chatId && userData?.userId) {
        await sendTextMessage(chatId, userData?.userId, messageText);
      }

      setMessageText("");
    } catch (error) {
      console.log(error);
      setErrorBannerText("Message failed to send");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          <PageContainer style={{ backgroundColor: "transparent" }}>
            {!chatId && (
              <Bubble text="This is a new chat. Say hi!" type="system" />
            )}

            {errorBannerText !== "" && (
              <Bubble text={errorBannerText} type="error" />
            )}

            {chatId && (
              <FlatList
                data={chatMessages}
                renderItem={(itemData) => {
                  const message = itemData.item;
                  const isOwnMessage = message.sentBy === userData?.userId;
                  const messageType = isOwnMessage
                    ? "myMessage"
                    : "theirMessage";

                  return (
                    <Bubble
                      type={messageType}
                      key={itemData.index}
                      text={message.text}
                      date={message.sentAt}
                      messageId={message.key}
                      userId={userData?.userId}
                      chatId={chatId}
                    />
                  );
                }}
              />
            )}
          </PageContainer>
        </ImageBackground>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={() => console.log("Pressed!")}
          >
            <Feather name="plus" size={24} color={colors.pink} />
          </TouchableOpacity>

          <TextInput
            style={styles.textBox}
            value={messageText}
            onChangeText={(text) => setMessageText(text)}
            onSubmitEditing={sendMessage}
          />

          {messageText === "" && (
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={() => console.log("Pressed!")}
            >
              <Feather name="camera" size={24} color={colors.pink} />
            </TouchableOpacity>
          )}

          {messageText !== "" && (
            <TouchableOpacity
              style={{ ...styles.mediaButton, ...styles.sendButton }}
              onPress={sendMessage}
            >
              <Feather name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  screen: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
  },
  textBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.violet,
    marginHorizontal: 15,
    paddingHorizontal: 12,
  },
  mediaButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
  },
  sendButton: {
    backgroundColor: colors.pink,
    borderRadius: 50,
    padding: 8,
    width: 35,
  },
});

export default ChatScreen;
