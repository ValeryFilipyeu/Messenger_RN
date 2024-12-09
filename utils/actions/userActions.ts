import {
  child,
  get,
  getDatabase,
  ref,
  DatabaseReference,
  DataSnapshot,
  query,
  orderByChild,
  startAt,
  endAt,
} from "firebase/database";

import { getFirebaseApp } from "../firebaseHelper";
import { UserData, Users } from "../../types";

export const getUserData = async (
  userId: string,
): Promise<UserData | undefined> => {
  try {
    const app = getFirebaseApp();
    const dbRef: DatabaseReference = ref(getDatabase(app));
    const userRef: DatabaseReference = child(dbRef, `users/${userId}`);

    const snapshot: DataSnapshot = await get(userRef);
    return snapshot.val();
  } catch (error) {
    console.log(error);
  }
};

export const getUserChats = async (
  userId: string,
): Promise<Record<string, string> | undefined> => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userRef = child(dbRef, `userChats/${userId}`);

    const snapshot = await get(userRef);
    return snapshot.val();
  } catch (error) {
    console.log(error);
  }
};

export const searchUsers = async (queryText: string): Promise<Users | null> => {
  const searchTerm = queryText.toLowerCase();

  try {
    const app = getFirebaseApp();
    const dbRef: DatabaseReference = ref(getDatabase(app));
    const userRef: DatabaseReference = child(dbRef, "users");
    const queryRef = query(
      userRef,
      orderByChild("firstLast"),
      startAt(searchTerm),
      endAt(searchTerm + "\uf8ff"),
    );

    const snapshot: DataSnapshot = await get(queryRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return null;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
