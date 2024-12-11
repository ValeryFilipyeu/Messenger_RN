import React, { useCallback, useReducer, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import DataItem from "../components/DataItem";
import Input from "../components/Input";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";

import { colors } from "../constants/colors";
import { RootState } from "../store/store";
import { RootStackParamList, State } from "../types";
import {
  removeUserFromChat,
  updateChatData,
} from "../utils/actions/chatActions";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducers";

interface ChatSettingsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "ChatSettingsScreen">;
}

const ChatSettingsScreen: React.FC<ChatSettingsScreenProps> = ({
  navigation,
  route,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const chatId = route.params.chatId;
  const chatData = useSelector(
    (state: RootState) => state.chats.chatsData[chatId],
  );
  const userData = useSelector((state: RootState) => state.auth.userData);
  const storedUsers = useSelector(
    (state: RootState) => state.users.storedUsers,
  );

  const initialState: State = {
    inputValues: { chatName: chatData?.chatName ?? "" },
    inputValidities: { chatName: undefined },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState],
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;

    try {
      if (userData?.userId) {
        setIsLoading(true);
        await updateChatData(chatId, userData.userId, updatedValues);

        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 1500);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;
    return currentValues.chatName !== chatData?.chatName;
  };

  const leaveChat = useCallback(async () => {
    try {
      setIsLoading(true);

      if (userData) {
        await removeUserFromChat(userData, userData, chatData);
      }

      navigation.popToTop();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [navigation, isLoading]);

  if (!userData) {
    return <PageContainer>There is no user</PageContainer>;
  }

  if (!chatData?.users) return null;

  return (
    <PageContainer>
      <PageTitle text="Chat Settings" />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <ProfileImage
          showEditButton={true}
          showRemoveButton={false}
          size={80}
          chatId={chatId}
          userId={userData.userId}
          uri={chatData?.chatImage}
        />

        <Input
          id="chatName"
          label="Chat name"
          autoCapitalize="none"
          initialValue={chatData?.chatName}
          allowEmpty={false}
          onInputChanged={inputChangedHandler}
          errorText={formState.inputValidities["chatName"] as [string]}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.heading}>
            {chatData?.users.length} Participants
          </Text>

          <DataItem
            onPress={() => {}}
            image=""
            userId={userData.userId}
            title="Add users"
            icon="plus"
            type="button"
          />

          {chatData?.users.slice(0, 4).map((uid) => {
            const currentUser = storedUsers[uid];
            return (
              <DataItem
                userId={uid}
                key={uid}
                image={String(currentUser.profilePicture)}
                title={`${currentUser.firstName} ${currentUser.lastName}`}
                subTitle={currentUser.about}
                type={uid !== userData.userId ? "link" : "item"}
                onPress={() =>
                  uid !== userData.userId &&
                  navigation.navigate("ContactScreen", { uid, chatId })
                }
              />
            );
          })}

          {chatData.users.length > 4 && (
            <DataItem
              userId={userData.userId}
              image=""
              type="link"
              title="View all"
              hideImage
              onPress={() =>
                navigation.navigate("DataListScreen", {
                  title: "Participants",
                  data: chatData.users,
                  type: "users",
                  chatId,
                })
              }
            />
          )}
        </View>

        {showSuccessMessage && <Text>Saved!</Text>}

        {isLoading ? (
          <ActivityIndicator size={"small"} color={colors.pink} />
        ) : (
          hasChanges() && (
            <SubmitButton
              title="Save changes"
              color={colors.pink}
              onPress={saveHandler}
              disabled={!formState.formIsValid}
              style={{}}
            />
          )
        )}
      </ScrollView>

      <SubmitButton
        title="Leave chat"
        color={colors.red}
        onPress={leaveChat}
        style={{ marginBottom: 20 }}
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    justifyContent: "center",
    alignItems: "center",
  },
  sectionContainer: {
    width: "100%",
    marginTop: 10,
  },
  heading: {
    marginVertical: 8,
    color: colors.textColor,
    fontFamily: "bold",
    letterSpacing: 0.3,
  },
});

export default ChatSettingsScreen;
