import { initializeApp, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

import {
  API_KEY,
  AUTH_DOMAIN,
  DATABASE_URL,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  MEASUREMENT_ID,
  // @ts-ignore
} from "@env";

const apiKey = API_KEY;
const authDomain = AUTH_DOMAIN;
const databaseURL = DATABASE_URL;
const projectId = PROJECT_ID;
const storageBucket = STORAGE_BUCKET;
const messagingSenderId = MESSAGING_SENDER_ID;
const appId = APP_ID;
const measurementId = MEASUREMENT_ID;

const getFirebaseApp = () => {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey,
    authDomain,
    databaseURL,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };

  // Initialize Firebase
  return initializeApp(firebaseConfig);
};

const auth = initializeAuth(getFirebaseApp(), {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { getFirebaseApp, auth, getApp, getAuth };
