import React, { useCallback, useReducer, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { UnknownAction } from "@reduxjs/toolkit";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Input from "../components/Input";
import DataItem from "../components/DataItem";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import ProfileImage from "../components/ProfileImage";
import SubmitButton from "../components/SubmitButton";

import { colors } from "../constants/colors";
import { RootState } from "../store/store";
import { State, StarredMessage, RootStackParamList } from "../types";
import { updateLoggedInUserData } from "../store/authSlice";
import {
  updateSignedInUserData,
  userLogout,
} from "../utils/actions/authActions";
import { validateInput } from "../utils/actions/formActions";
import { reducer } from "../utils/reducers/formReducers";

interface SettingsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const userData = useSelector((state: RootState) => state.auth.userData);
  const starredMessages = useSelector(
    (state: RootState) => state.messages.starredMessages ?? {},
  );

  const sortedStarredMessages = useMemo(() => {
    let result: StarredMessage[] = [];

    const chats = Object.values(starredMessages);

    chats.forEach((chat) => {
      const chatMessages = Object.values(chat);
      result = result.concat(chatMessages);
    });

    return result;
  }, [starredMessages]);

  const firstName = userData?.firstName || "";
  const lastName = userData?.lastName || "";
  const email = userData?.email || "";
  const about = userData?.about || "";

  const initialState: State = {
    inputValues: {
      firstName,
      lastName,
      email,
      about,
    },
    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      about: undefined,
    },
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
        await updateSignedInUserData(userData?.userId, updatedValues);
        dispatch(updateLoggedInUserData({ newData: updatedValues }));

        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState, dispatch]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;

    return (
      currentValues.firstName != firstName ||
      currentValues.lastName != lastName ||
      currentValues.email != email ||
      currentValues.about != about
    );
  };

  if (!userData) {
    return <PageContainer>There is no user</PageContainer>;
  }

  return (
    <PageContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <PageTitle text="Settings" />

        <ScrollView contentContainerStyle={styles.formContainer}>
          <ProfileImage
            showEditButton
            showRemoveButton={false}
            size={80}
            userId={userData.userId}
            uri={userData.profilePicture}
          />

          <Input
            id="firstName"
            label="First name"
            icon="user"
            onInputChanged={inputChangedHandler}
            autoCapitalize="none"
            errorText={formState.inputValidities["firstName"] as [string]}
            initialValue={userData.firstName}
          />

          <Input
            id="lastName"
            label="Last name"
            icon="user"
            onInputChanged={inputChangedHandler}
            autoCapitalize="none"
            errorText={formState.inputValidities["lastName"] as [string]}
            initialValue={userData.lastName}
          />

          <Input
            id="email"
            label="Email"
            icon="mail"
            onInputChanged={inputChangedHandler}
            keyboardType="email-address"
            autoCapitalize="none"
            errorText={formState.inputValidities["email"] as [string]}
            initialValue={userData.email}
          />

          <Input
            id="about"
            label="About"
            icon="user"
            onInputChanged={inputChangedHandler}
            autoCapitalize="none"
            errorText={formState.inputValidities["about"] as [string]}
            initialValue={userData.about}
          />

          <View style={{ marginTop: 20 }}>
            {showSuccessMessage && <Text>Saved!</Text>}

            {isLoading ? (
              <ActivityIndicator
                size={"small"}
                color={colors.pink}
                style={{ marginTop: 10 }}
              />
            ) : (
              hasChanges() && (
                <SubmitButton
                  title="Save"
                  onPress={saveHandler}
                  style={{ marginTop: 20 }}
                  disabled={!formState.formIsValid}
                />
              )
            )}
          </View>

          <DataItem
            type="link"
            title="Starred messages"
            hideImage
            image=""
            userId={userData.userId}
            onPress={() =>
              navigation.navigate("DataListScreen", {
                title: "Starred messages",
                data: sortedStarredMessages,
                type: "messages",
              })
            }
          />

          <SubmitButton
            title="Logout"
            onPress={() => dispatch(userLogout(userData) as unknown as UnknownAction)}
            style={{ marginTop: 20 }}
            color={colors.red}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    alignItems: "center",
  },
});

export default SettingsScreen;
