import {
  child,
  getDatabase,
  push,
  ref,
  update,
  get,
  remove,
  set,
} from "firebase/database";
import { getFirebaseApp } from "../firebaseHelper";

export const createChat = async (
  loggedInUserId: string,
  chatData: { users: string[] },
): Promise<string | null> => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const newChat = await push(child(dbRef, "chats"), newChatData);

  const chatUsers = newChatData.users;
  for (let i = 0; i < chatUsers.length; i++) {
    const userId = chatUsers[i];
    await push(child(dbRef, `userChats/${userId}`), newChat.key);
  }

  return newChat.key;
};

export const sendTextMessage = async (
  chatId: string,
  senderId: string,
  messageText: string,
  replyTo?: string,
): Promise<void> => {
  const dbRef = ref(getDatabase());
  const messagesRef = child(dbRef, `messages/${chatId}`);

  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
    replyTo,
  };

  await push(messagesRef, messageData);

  const chatRef = child(dbRef, `chats/${chatId}`);
  await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessageText: messageText,
  });
};

export const starMessage = async (
  messageId: string,
  chatId: string,
  userId: string,
): Promise<void> => {
  try {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const childRef = child(
      dbRef,
      `userStarredMessages/${userId}/${chatId}/${messageId}`,
    );

    const snapshot = await get(childRef);

    if (snapshot.exists()) {
      await remove(childRef);
    } else {
      const starredMessageData = {
        messageId,
        chatId,
        starredAt: new Date().toISOString(),
      };

      await set(childRef, starredMessageData);
    }
  } catch (error) {
    console.log(error);
  }
};
