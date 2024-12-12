import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";

import PageContainer from "../components/PageContainer";
import ProfileImage from "../components/ProfileImage";
import CustomHeaderButton from "../components/CustomHeaderButton";
import DataItem from "../components/DataItem";
import { RootStackParamList } from "../types";
import { colors } from "../constants/colors";
import commonStyles from "../constants/commonStyles";
import { searchUsers } from "../utils/actions/userActions";
import { setStoredUsers } from "../store/userSlice";
import { Users } from "../types";
import { RootState } from "../store/store";

interface NewChatScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "NewChatScreen">;
}

const NewChatScreen: React.FC<NewChatScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<Users | null>(null);
  const [chatName, setChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const userData = useSelector((state: RootState) => state.auth.userData);
  const storedUsers = useSelector(
    (state: RootState) => state.users.storedUsers,
  );

  const selectedUsersFlatList = useRef<FlatList<string> | null>(null);

  const isGroupChat = route.params?.isGroupChat;
  const chatId = route.params?.chatId;
  const existingUsers = route.params?.existingUsers;
  const isNewChat = !chatId;

  const isGroupChatDisabled =
    selectedUsers.length === 0 || (isNewChat && chatName === "");

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <CustomHeaderButton
            name="close"
            onPress={() => navigation.goBack()}
          />
        );
      },
      headerRight: () => {
        return (
          isGroupChat && (
            <CustomHeaderButton
              color={isGroupChatDisabled ? colors.lightGrey : undefined}
              name={isNewChat ? "create-outline" : "add-outline"}
              isDisabled={isGroupChatDisabled}
              onPress={() => {
                if (isNewChat) {
                  navigation.navigate("ChatListScreen", {
                    selectedUsers,
                    chatName,
                  });
                } else {
                  navigation.navigate("ChatSettingsScreen", {
                    chatId,
                    selectedUsers,
                  });
                }
              }}
            />
          )
        );
      },
      headerTitle: isGroupChat ? "Add participants" : "New chat",
    });
  }, [chatName, selectedUsers]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm || searchTerm === "") {
        setUsers(null);
        setNoResultsFound(false);
        return;
      }

      setIsLoading(true);

      const usersResult = (await searchUsers(searchTerm)) ?? {};
      delete usersResult[String(userData?.userId)];
      setUsers(usersResult);

      if (usersResult) {
        setNoResultsFound(false);
        dispatch(setStoredUsers({ newUsers: usersResult }));
      } else {
        setNoResultsFound(true);
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const userPressed = (userId: string) => {
    if (isGroupChat) {
      const newSelectedUsers = selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : selectedUsers.concat(userId);

      setSelectedUsers(newSelectedUsers);
    } else {
      navigation.navigate("ChatListScreen", { selectedUserId: userId });
    }
  };

  return (
    <PageContainer>
      {isNewChat && isGroupChat && (
        <View style={styles.chatNameContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textbox}
              placeholder="Enter a name for your chat"
              autoCorrect={false}
              autoComplete="off"
              onChangeText={(text) => setChatName(text)}
            />
          </View>
        </View>
      )}

      {isGroupChat && (
        <View style={styles.selectedUsersContainer}>
          <FlatList
            data={selectedUsers}
            style={styles.selectedUsersList}
            horizontal={true}
            keyExtractor={(item) => item}
            contentContainerStyle={{ alignItems: "center" }}
            ref={(ref) => (selectedUsersFlatList.current = ref)}
            onContentSizeChange={() =>
              selectedUsersFlatList.current?.scrollToEnd()
            }
            renderItem={(itemData) => {
              const userId = itemData.item;
              const userData = storedUsers[userId];

              return (
                <ProfileImage
                  userId={userData.userId}
                  style={styles.selectedUserStyle}
                  size={40}
                  uri={userData.profilePicture}
                  onPress={() => userPressed(userId)}
                  showRemoveButton
                  showEditButton={false}
                />
              );
            }}
          />
        </View>
      )}

      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={15} color={colors.lightGrey} />

        <TextInput
          placeholder="Search"
          style={styles.searchBox}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>

      {isLoading && (
        <View style={commonStyles.center}>
          <ActivityIndicator size={"large"} color={colors.pink} />
        </View>
      )}

      {!isLoading && !noResultsFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={(itemData) => {
            const userId = itemData.item;
            const userData = users[userId];

            if (existingUsers && existingUsers.includes(userId)) {
              return null;
            }

            return (
              <DataItem
                userId={userData.userId}
                title={`${userData.firstName} ${userData.lastName}`}
                subTitle={userData.about}
                image={userData.profilePicture ?? ""}
                onPress={() => userPressed(userId)}
                isChecked={selectedUsers.includes(userId)}
                type={isGroupChat ? "checkbox" : "item"}
              />
            );
          }}
        />
      )}

      {!isLoading && noResultsFound && (
        <View style={commonStyles.center}>
          <FontAwesome
            name="question"
            size={55}
            color={colors.lightGrey}
            style={styles.noResultsIcon}
          />
          <Text style={styles.noResultsText}>No users found!</Text>
        </View>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.extraLightGrey,
    height: 30,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  searchBox: {
    marginLeft: 8,
    fontSize: 15,
    width: "100%",
  },
  noResultsIcon: {
    marginBottom: 20,
  },
  noResultsText: {
    color: colors.textColor,
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  chatNameContainer: {
    paddingVertical: 10,
  },
  inputContainer: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: colors.nearlyWhite,
    flexDirection: "row",
    borderRadius: 2,
  },
  textbox: {
    color: colors.textColor,
    width: "100%",
    fontFamily: "regular",
    letterSpacing: 0.3,
  },
  selectedUsersContainer: {
    height: 50,
    justifyContent: "center",
  },
  selectedUsersList: {
    height: "100%",
    paddingTop: 10,
  },
  selectedUserStyle: {
    marginRight: 10,
    marginBottom: 10,
  },
});

export default NewChatScreen;
