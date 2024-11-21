import React, { useLayoutEffect, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RouteProp } from "@react-navigation/native";

import CustomHeaderButton from "../components/CustomHeaderButton";
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
    if (!selectedUser) {
      return;
    }

    const chatUsers = [selectedUser, userData?.userId];
    const navigationProps = {
      newChatData: { users: chatUsers }
    }

    navigation.navigate("ChatScreen", navigationProps);
  }, [route.params]);

  return (
    <View style={styles.container}>
      <Text>Chat List Screen</Text>

      <Button
        title="Go to Chat Screen"
        onPress={() => {
          navigation.navigate("ChatScreen");
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatListScreen;
