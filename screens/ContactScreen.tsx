import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import { RouteProp } from "@react-navigation/native";

import { colors } from "../constants/colors";
import { RootStackParamList } from "../types";
import { RootState } from "../store/store";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";
import { getUserChats } from "../utils/actions/userActions";

interface ContactScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "ContactScreen">;
}

const ContactScreen: React.FC<ContactScreenProps> = ({ navigation, route }) => {
  const storedUsers = useSelector(
    (state: RootState) => state.users.storedUsers,
  );
  const storedChats = useSelector((state: RootState) => state.chats.chatsData);
  const currentUser = storedUsers[route.params.uid];

  const [commonChats, setCommonChats] = useState<string[]>([]);

  const chatId = route.params?.chatId;
  const chatData = chatId && storedChats[chatId];

  useEffect(() => {
    const getCommonUserChats = async () => {
      const currentUserChats = await getUserChats(currentUser.userId);
      if (currentUserChats) {
        setCommonChats(
          Object.values(currentUserChats).filter(
            (cid) => storedChats[cid] && storedChats[cid].isGroupChat,
          ),
        );
      }
    };

    getCommonUserChats().catch(() => {});
  }, []);

  return (
    <PageContainer>
      <View style={styles.topContainer}>
        <ProfileImage
          uri={currentUser.profilePicture}
          size={80}
          style={{ marginBottom: 20 }}
          showEditButton={false}
          showRemoveButton={false}
          userId={currentUser.userId}
        />

        <PageTitle text={`${currentUser.firstName} ${currentUser.lastName}`} />

        {currentUser.about && (
          <Text style={styles.about} numberOfLines={2}>
            {currentUser.about}
          </Text>
        )}
      </View>

      {commonChats.length > 0 && (
        <>
          <Text style={styles.heading}>
            {commonChats.length} {commonChats.length === 1 ? "Group" : "Groups"}{" "}
            in Common
          </Text>
          {commonChats.map((cid) => {
            const chatData = storedChats[cid];
            return (
              <DataItem
                userId={currentUser.userId}
                key={cid}
                title={String(chatData.chatName)}
                subTitle={chatData.latestMessageText}
                type="link"
                onPress={() => navigation.push("ChatScreen", { chatId: cid })}
                image=""
              />
            );
          })}
        </>
      )}

      {chatData && chatData.isGroupChat && (
        <SubmitButton
          title="Remove from chat"
          color={colors.red}
          onPress={() => {}}
          style={{}}
        />
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  about: {
    fontFamily: "medium",
    fontSize: 16,
    letterSpacing: 0.3,
    color: colors.grey,
  },
  heading: {
    fontFamily: "bold",
    letterSpacing: 0.3,
    color: colors.textColor,
    marginVertical: 8,
  },
});

export default ContactScreen;
