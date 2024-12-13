import React, { useLayoutEffect } from "react";
import { FlatList } from "react-native";
import { useSelector } from "react-redux";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import { RootStackParamList, StarredMessage } from "../types";
import { RootState } from "../store/store";

interface DataListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "DataListScreen">;
}

const DataListScreen: React.FC<DataListScreenProps> = ({
  navigation,
  route,
}) => {
  const storedUsers = useSelector(
    (state: RootState) => state.users.storedUsers,
  );
  const userData = useSelector((state: RootState) => state.auth.userData);
  const messagesData = useSelector(
    (state: RootState) => state.messages.messagesData,
  );

  const { title, data, type, chatId } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: title });
  }, [title]);

  if (!userData) {
    return null;
  }

  return (
    <PageContainer>
      <FlatList
        data={data}
        keyExtractor={(item: string | StarredMessage) => {
          if (typeof item === "string") {
            return item;
          } else {
            return item.messageId;
          }
        }}
        renderItem={(itemData) => {
          let key,
            dataItemUID,
            onPress = () => {},
            image = "",
            title = "",
            subTitle,
            itemType: "checkbox" | "item" | "link" | "button" = "item";

          if (type === "users") {
            const uid = itemData.item;
            dataItemUID = uid;

            if (typeof uid === "string" && uid in storedUsers) {
              const currentUser = storedUsers[uid];

              if (!currentUser) return null;

              const isLoggedInUser = uid === userData.userId;

              key = uid;
              image = currentUser.profilePicture ?? "";
              title = `${currentUser.firstName} ${currentUser.lastName}`;
              subTitle = currentUser.about;
              itemType = isLoggedInUser ? "item" : "link";
              onPress = isLoggedInUser
                ? () => {}
                : () => navigation.navigate("ContactScreen", { uid, chatId });
            }
          } else if (type === "messages") {
            const starData = itemData.item as StarredMessage;
            const { chatId, messageId } = starData;
            const messagesForChat = messagesData[chatId];

            if (!messagesForChat) {
              return null;
            }

            const messageData = messagesForChat[messageId];
            const sender =
              messageData.sentBy && storedUsers[messageData.sentBy];
            const name = sender && `${sender.firstName} ${sender.lastName}`;

            if (sender) {
              dataItemUID = sender.userId;
            }

            key = messageId;
            title = name;
            subTitle = messageData.text;
            itemType = "item";
            onPress = () => {};
          }

          return (
            <DataItem
              key={key}
              onPress={onPress}
              image={image}
              subTitle={subTitle}
              userId={String(dataItemUID)}
              title={title}
              type={itemType}
            />
          );
        }}
      />
    </PageContainer>
  );
};

export default DataListScreen;
