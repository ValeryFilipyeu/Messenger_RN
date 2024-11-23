import React, { useLayoutEffect, useEffect, useCallback } from "react";
import { FlatList } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RouteProp } from "@react-navigation/native";

import CustomHeaderButton from "../components/CustomHeaderButton";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import { RootStackParamList } from "../types";
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
    if (!userData?.userId || !selectedUser) {
      return;
    }

    const chatUsers = [selectedUser, userData.userId];
    const navigationProps = {
      newChatData: { users: chatUsers },
    };

    navigation.navigate("ChatScreen", navigationProps);
  }, [route.params]);

  const handleChatPress = useCallback(
    (chatId: string | undefined) => {
      navigation.navigate("ChatScreen", { chatId });
    },
    [navigation],
  );

  return (
    <PageContainer>
      <PageTitle text="Chats" />

      <FlatList
        data={userChats}
        renderItem={(itemData) => {
          const chatData = itemData.item;
          const chatId = chatData.key;

          const otherUserId = chatData.users.find(
            (uid) => uid !== userData?.userId,
          );

          if (!otherUserId) return <></>;

          const otherUser = storedUsers[otherUserId];

          if (!otherUser) return <></>;

          const title = `${otherUser.firstName} ${otherUser.lastName}`;
          const subTitle = "This will be a message..";
          const image = otherUser.profilePicture;

          return (
            <DataItem
              title={title}
              subTitle={subTitle}
              image={image ?? ""}
              userId={otherUserId}
              onPress={() => handleChatPress(chatId)}
            />
          );
        }}
      />
    </PageContainer>
  );
};

export default ChatListScreen;
