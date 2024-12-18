import React, { useState, useCallback, useLayoutEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { colors } from "../constants/colors";
import { RootStackParamList, Message } from "../types";
import { RootState } from "../store/store";
import PageContainer from "../components/PageContainer";
import CustomHeaderButton from "../components/CustomHeaderButton";
import ReplyTo from "../components/ReplyTo";
import Bubble from "../components/Bubble";
import {
  createChat,
  sendTextMessage,
  sendImage,
} from "../utils/actions/chatActions";
import {
  launchImagePicker,
  openCamera,
  uploadImageAsync,
} from "../utils/imagePickerHelper";

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
  const [replyingTo, setReplyingTo] = useState<Message | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const flatList = useRef<FlatList<Message> | null>(null);

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

        return Object.keys(chatMessagesData).map((key) => {
          const { key: _, ...message } = chatMessagesData[key];
          return {
            key,
            ...message,
          };
        });
      },
    );
  const chatMessages: Message[] = useSelector(selectChatMessages(chatId));

  const chatData = (chatId && storedChats[chatId]) || route.params?.newChatData;

  const getChatTitleFromName = (): string => {
    const otherUserId = chatUsers.find((uid) => uid !== userData?.userId);
    const otherUserData = storedUsers[String(otherUserId)];

    return (
      otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`
    );
  };

  const title = chatData?.chatName ?? getChatTitleFromName();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
      headerRight: () => {
        return (
          chatId && (
            <CustomHeaderButton
              name="settings-outline"
              onPress={() =>
                chatData?.isGroupChat
                  ? navigation.navigate("ChatSettingsScreen", { chatId })
                  : navigation.navigate("ContactScreen", {
                      uid:
                        chatUsers.find((uid) => uid !== userData?.userId) || "",
                    })
              }
            />
          )
        );
      },
    });
    setChatUsers(chatData?.users ?? []);
  }, [chatData, title]);

  const sendMessage = useCallback(async () => {
    try {
      let id = chatId;
      if (!id && userData?.userId && route.params.newChatData) {
        id = await createChat(userData.userId, route.params.newChatData);
        setChatId(id);
      }

      if (id && userData?.userId) {
        await sendTextMessage(
          id,
          userData,
          messageText,
          chatUsers,
          replyingTo && replyingTo.key,
        );
      }

      setMessageText("");
      setReplyingTo(undefined);
    } catch (error) {
      console.log(error);
      setErrorBannerText("Message failed to send");
      setTimeout(() => setErrorBannerText(""), 5000);
    }
  }, [messageText, chatId]);

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      await uploadImage(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();
      if (!tempUri) return;

      await uploadImage(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const uploadImage = useCallback(
    async (tempImageUri: string) => {
      setIsLoading(true);

      try {
        let id = chatId;
        if (!id && userData?.userId && route.params.newChatData) {
          id = await createChat(userData.userId, route.params.newChatData);
          setChatId(id);
        }

        const uploadUrl = await uploadImageAsync(tempImageUri, true);

        if (id && userData?.userId) {
          await sendImage(
            id,
            userData,
            uploadUrl,
            chatUsers,
            replyingTo && replyingTo.key,
          );
          setReplyingTo(undefined);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, chatId],
  );

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
                ref={(ref) => {
                  flatList.current = ref;
                }}
                onContentSizeChange={() =>
                  flatList.current?.scrollToEnd({ animated: false })
                }
                onLayout={() =>
                  flatList.current?.scrollToEnd({ animated: false })
                }
                showsVerticalScrollIndicator={false}
                data={chatMessages}
                renderItem={(itemData) => {
                  const message: Message = itemData.item;
                  const isOwnMessage = message.sentBy === userData?.userId;
                  let messageType:
                    | "system"
                    | "error"
                    | "myMessage"
                    | "theirMessage"
                    | "reply"
                    | "info";
                  if (message.type && message.type === "info") {
                    messageType = "info";
                  } else if (isOwnMessage) {
                    messageType = "myMessage";
                  } else {
                    messageType = "theirMessage";
                  }

                  const sender = message.sentBy && storedUsers[message.sentBy];
                  const name =
                    sender && `${sender.firstName} ${sender.lastName}`;

                  return (
                    <Bubble
                      type={messageType}
                      text={message.text}
                      date={message.sentAt}
                      name={
                        !chatData?.isGroupChat || isOwnMessage
                          ? undefined
                          : name
                      }
                      messageId={message.key}
                      userId={userData?.userId}
                      chatId={chatId}
                      setReply={() => setReplyingTo(message)}
                      replyingTo={
                        message.replyTo
                          ? chatMessages.find((i) => i.key === message.replyTo)
                          : undefined
                      }
                      imageUrl={message.imageUrl}
                    />
                  );
                }}
              />
            )}

            {isLoading && (
              <ActivityIndicator size="large" color={colors.pink} />
            )}
          </PageContainer>

          {replyingTo && (
            <ReplyTo
              text={replyingTo.text}
              user={storedUsers[replyingTo.sentBy]}
              onCancel={() => setReplyingTo(undefined)}
            />
          )}
        </ImageBackground>

        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={pickImage}
            disabled={isLoading}
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
              onPress={takePhoto}
              disabled={isLoading}
            >
              <Feather name="camera" size={24} color={colors.pink} />
            </TouchableOpacity>
          )}

          {messageText !== "" && (
            <TouchableOpacity
              style={{ ...styles.mediaButton, ...styles.sendButton }}
              onPress={sendMessage}
              disabled={isLoading}
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
