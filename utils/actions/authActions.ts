import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { child, get, getDatabase, ref, set, update } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { authenticate, logout } from "../../store/authSlice";
import { getUserData } from "./userActions";
import { getAuth, getFirebaseApp } from "../firebaseHelper";
import { UserData } from "../../types";

let timer: NodeJS.Timeout;

interface User extends FirebaseUser {
  stsTokenManager: {
    accessToken: string;
    expirationTime: number;
    refreshToken: string;
  };
}

export const signUp = (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): ((dispatch: Dispatch) => Promise<void>) => {
  return async (dispatch: Dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const { uid } = result.user;
      const user = result.user as User;
      const stsTokenManager = user.stsTokenManager;
      const { accessToken, expirationTime } = stsTokenManager;

      const expiryDate = new Date(expirationTime);
      const timeNow = new Date();
      const millisecondsUntilExpiry = expiryDate.getTime() - timeNow.getTime();

      const userData = await createUser(firstName, lastName, email, uid);

      if (!userData) {
        throw new Error("User data is not found in authActions file");
      }

      dispatch(authenticate({ token: accessToken, userData }));
      await saveDataToStorage(accessToken, uid, expiryDate);
      await storePushToken(userData);

      timer = setTimeout(() => {
        dispatch(userLogout(userData) as unknown as UnknownAction);
      }, millisecondsUntilExpiry);
    } catch (error) {
      console.log(error);
      const errorCode = (error as FirebaseError).code;

      let message = "Something went wrong.";

      if (errorCode === "auth/email-already-in-use") {
        message = "This email is already in use";
      }

      throw new Error(message);
    }
  };
};

export const signIn = (
  email: string,
  password: string,
): ((dispatch: Dispatch) => Promise<void>) => {
  return async (dispatch: Dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const { uid } = result.user;
      const user = result.user as User;
      const stsTokenManager = user.stsTokenManager;
      const { accessToken, expirationTime } = stsTokenManager;

      const expiryDate = new Date(expirationTime);
      const timeNow = new Date();
      const millisecondsUntilExpiry = expiryDate.getTime() - timeNow.getTime();

      const userData = await getUserData(uid);

      if (!userData) {
        throw new Error("User data is not found in authActions file");
      }

      dispatch(authenticate({ token: accessToken, userData }));
      await saveDataToStorage(accessToken, uid, expiryDate);
      await storePushToken(userData);

      timer = setTimeout(() => {
        dispatch(userLogout(userData) as unknown as UnknownAction);
      }, millisecondsUntilExpiry);
    } catch (error) {
      const errorCode = (error as FirebaseError).code;

      let message = "Something went wrong.";

      if (
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/user-not-found"
      ) {
        message = "The username or password was incorrect";
      }

      throw new Error(message);
    }
  };
};

export const userLogout = (
  userData: UserData,
): ((dispatch: Dispatch) => Promise<void>) => {
  return async (dispatch: Dispatch) => {
    try {
      await removePushToken(userData);
    } catch (error) {
      console.log(error);
    }

    await AsyncStorage.clear();
    clearTimeout(timer);
    dispatch(logout());
  };
};

export const updateSignedInUserData = async (
  userId: string,
  newData: Record<string, string>,
): Promise<void> => {
  if (newData.firstName && newData.lastName) {
    newData.firstLast =
      `${newData.firstName} ${newData.lastName}`.toLowerCase();
  }

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`);
  await update(childRef, newData);
};

const createUser = async (
  firstName: string,
  lastName: string,
  email: string,
  userId: string,
): Promise<UserData> => {
  const firstLast = `${firstName} ${lastName}`.toLowerCase();
  const userData = {
    firstName,
    lastName,
    firstLast,
    email,
    userId,
    signUpDate: new Date().toISOString(),
  };

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`);
  await set(childRef, userData);
  return userData;
};

const saveDataToStorage = async (
  token: string,
  userId: string,
  expiryDate: Date,
): Promise<void> => {
  await AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token,
      userId,
      expiryDate: expiryDate.toISOString(),
    }),
  );
};

const storePushToken = async (userData: UserData): Promise<void> => {
  if (!Device.isDevice) {
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  const tokenData = { ...userData.pushTokens };
  const tokenArray = Object.values(tokenData);
  if (tokenArray.includes(token)) {
    return;
  }

  tokenArray.push(token);

  for (let i = 0; i < tokenArray.length; i++) {
    tokenData[i] = tokenArray[i];
  }

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const userRef = child(dbRef, `users/${userData.userId}/pushTokens`);
  await set(userRef, tokenData);
};

const removePushToken = async (userData: UserData): Promise<void> => {
  if (!Device.isDevice) {
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  const tokenData = await getUserPushTokens(userData.userId);

  for (const key in tokenData) {
    if (tokenData[key] === token) {
      delete tokenData[key];
      break;
    }
  }

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const userRef = child(dbRef, `users/${userData.userId}/pushTokens`);
  await set(userRef, tokenData);
};

export const getUserPushTokens = async (
  userId: string,
): Promise<{ [key: string]: string } | undefined> => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `users/${userId}/pushTokens`);

    const snapshot = await get(userRef);

    if (!snapshot || !snapshot.exists()) {
      return {};
    }

    return snapshot.val() || {};
  } catch (error) {
    console.log(error);
  }
};
