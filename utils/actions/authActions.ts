import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { child, getDatabase, ref, set, update } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispatch, UnknownAction } from "@reduxjs/toolkit";

import { authenticate, logout } from "../../store/authSlice";
import { getUserData } from "./userActions";
import { getFirebaseApp, getAuth } from "../firebaseHelper";

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
) => {
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

      timer = setTimeout(() => {
        dispatch(userLogout() as unknown as UnknownAction);
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

export const signIn = (email: string, password: string) => {
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

      timer = setTimeout(() => {
        dispatch(userLogout() as unknown as UnknownAction);
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

export const userLogout = () => {
  return async (dispatch: Dispatch) => {
    await AsyncStorage.clear();
    clearTimeout(timer);
    dispatch(logout());
  };
};

export const updateSignedInUserData = async (
  userId: string,
  newData: Record<string, string>,
) => {
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
) => {
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
) => {
  await AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token,
      userId,
      expiryDate: expiryDate.toISOString(),
    }),
  );
};
