import React, { useLayoutEffect, useEffect, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RouteProp } from "@react-navigation/native";

import { colors } from "../constants/colors";
import CustomHeaderButton from "../components/CustomHeaderButton";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import { RootStackParamList, ChatScreenNavigationProps } from "../types";
import { RootState } from "../store/store";

interface ChatListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "ChatListScreen">;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({
  navigation,
  route,
}) => {
  const selectedUser = route.params?.selectedUserId;
  const selectedUserList = route.params?.selectedUsers;
  const chatName = route.params?.chatName;

  const userData = useSelector((state: RootState) => state.auth.userData);
  const storedUsers = useSelector(
    (state: RootState) => state.users.storedUsers,
  );
  const selectUserChats = createSelector(
    (state: RootState) => state.chats.chatsData,
    (chatsData) =>
      Object.values(chatsData).sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
  );
  const userChats = useSelector(selectUserChats);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <CustomHeaderButton
            name="create-outline"
            onPress={() => navigation.navigate("NewChatScreen")}
          />
        );
      },
    });
  }, []);

  useEffect(() => {
    if (!selectedUser && !selectedUserList) {
      return;
    }

    let chatData;
    let navigationProps: ChatScreenNavigationProps = {};

    if (selectedUser) {
      chatData = userChats.find(
        (cd) => !cd.isGroupChat && cd.users.includes(selectedUser),
      );
    }

    if (chatData) {
      navigationProps.chatId = chatData.key;
    } else {
      const chatUsers = [...(selectedUserList || [selectedUser])];

      if (userData?.userId && !chatUsers.includes(userData?.userId)) {
        chatUsers.push(userData.userId);
      }

      navigationProps.newChatData = {
        users: chatUsers.filter((user): user is string => user !== undefined),
        isGroupChat: true,
      };

      if (chatName) {
        navigationProps.newChatData.chatName = chatName;
      }
    }

    navigation.navigate("ChatScreen", navigationProps);
  }, [route.params]);

  const handleChatPress = useCallback(
    (chatId: string | null) => {
      if (chatId) {
        navigation.navigate("ChatScreen", { chatId });
      }
    },
    [navigation],
  );

  return (
    <PageContainer>
      <PageTitle text="Chats" />

      <View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("NewChatScreen", { isGroupChat: true })
          }
        >
          <Text style={styles.newGroupText}>New Group</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userChats}
        renderItem={(itemData) => {
          const chatData = itemData.item;
          const chatId = chatData.key;
          const isGroupChat = chatData.isGroupChat;

          let otherUserId;
          let title = "";
          const subTitle = chatData.latestMessageText || "New chat";
          let image: string | undefined = "";

          if (isGroupChat && chatData.chatName) {
            title = chatData.chatName;
          } else {
            otherUserId = chatData.users.find(
              (uid) => uid !== userData?.userId,
            );

            if (!otherUserId) return <></>;

            const otherUser = storedUsers[otherUserId];

            if (!otherUser) return <></>;

            title = `${otherUser.firstName} ${otherUser.lastName}`;
            image = otherUser.profilePicture;
          }

          return (
            <DataItem
              title={title}
              subTitle={subTitle}
              image={image ?? ""}
              userId={otherUserId ?? ""}
              onPress={() => handleChatPress(chatId)}
              type="item"
            />
          );
        }}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  newGroupText: {
    color: colors.blue,
    fontSize: 17,
    marginBottom: 5,
  },
});

export default ChatListScreen;
