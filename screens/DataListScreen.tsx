import React, { useLayoutEffect } from "react";
import { FlatList, Text } from "react-native";
import { useSelector } from "react-redux";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import { RootStackParamList } from "../types";
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
        keyExtractor={(item) => item}
        renderItem={(itemData) => {
          let key,
            onPress = () => {},
            image = "",
            title = "",
            subTitle,
            itemType: "checkbox" | "item" | "link" | "button" = "item";

          if (type === "users") {
            const uid = itemData.item;
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

          return (
            <DataItem
              key={key}
              onPress={onPress}
              image={image}
              subTitle={subTitle}
              userId={itemData.item}
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
