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
import { Message, ChatData, UserData } from "../../types";
import { getUserPushTokens } from "./authActions";
import { getUserChats, deleteUserChat, addUserChat } from "./userActions";

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
  senderData: UserData,
  messageText: string,
  chatUsers: string[],
  replyTo?: string,
): Promise<void> => {
  await sendMessage(
    chatId,
    senderData.userId,
    messageText,
    null,
    replyTo,
    undefined,
  );

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
  sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    messageText,
    chatId,
  );
};

export const sendImage = async (
  chatId: string,
  senderData: UserData,
  imageUrl: string,
  chatUsers: string[],
  replyTo?: string,
): Promise<void> => {
  await sendMessage(
    chatId,
    senderData.userId,
    "Image",
    imageUrl,
    replyTo,
    undefined,
  );

  const otherUsers = chatUsers.filter((uid) => uid !== senderData.userId);
  sendPushNotificationForUsers(
    otherUsers,
    `${senderData.firstName} ${senderData.lastName}`,
    `${senderData.firstName} sent an image`,
    chatId,
  );
};

export const sendInfoMessage = async (
  chatId: string,
  senderId: string,
  messageText: string,
) => {
  await sendMessage(chatId, senderId, messageText, null, undefined, "info");
};

const sendMessage = async (
  chatId: string,
  senderId: string,
  messageText: string,
  imageUrl?: string | null,
  replyTo?: string,
  type?: "info",
): Promise<void> => {
  const dbRef = ref(getDatabase());
  const messagesRef = child(dbRef, `messages/${chatId}`);

  const messageData: Partial<Message> = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
  };

  if (replyTo) {
    messageData.replyTo = replyTo;
  }

  if (imageUrl) {
    messageData.imageUrl = imageUrl;
  }

  if (type) {
    messageData.type = type;
  }

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

export const updateChatData = async (
  chatId: string,
  userId: string,
  chatData: Partial<ChatData>,
): Promise<void> => {
  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));
  const chatRef = child(dbRef, `chats/${chatId}`);

  await update(chatRef, {
    ...chatData,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  });
};

export const removeUserFromChat = async (
  userLoggedInData: UserData,
  userToRemoveData: UserData,
  chatData: ChatData,
): Promise<void> => {
  const userToRemoveId = userToRemoveData.userId;
  const newUsers = chatData.users.filter((uid) => uid !== userToRemoveId);
  await updateChatData(String(chatData.key), userLoggedInData.userId, {
    users: newUsers,
  });

  const userChats = await getUserChats(userToRemoveId);

  for (const key in userChats) {
    const currentChatId = userChats[key];

    if (currentChatId === chatData.key) {
      await deleteUserChat(userToRemoveId, key);
      break;
    }
  }

  const messageText =
    userLoggedInData.userId === userToRemoveData.userId
      ? `${userLoggedInData.firstName} left the chat`
      : `${userLoggedInData.firstName} removed ${userToRemoveData.firstName} from the chat`;

  await sendInfoMessage(
    String(chatData.key),
    userLoggedInData.userId,
    messageText,
  );
};

export const addUsersToChat = async (
  userLoggedInData: UserData,
  usersToAddData: UserData[],
  chatData: ChatData,
): Promise<void> => {
  const existingUsers = Object.values(chatData.users);
  const newUsers: string[] = [];
  const chatDataKey = String(chatData.key);

  let userAddedName = "";

  for (const userToAdd of usersToAddData) {
    const userToAddId = userToAdd.userId;

    if (existingUsers.includes(userToAddId)) continue;

    newUsers.push(userToAddId);

    await addUserChat(userToAddId, chatDataKey);

    userAddedName = `${userToAdd.firstName} ${userToAdd.lastName}`;
  }

  if (newUsers.length === 0) {
    return;
  }

  await updateChatData(chatDataKey, userLoggedInData.userId, {
    users: existingUsers.concat(newUsers),
  });

  const moreUsersMessage =
    newUsers.length > 1 ? `and ${newUsers.length - 1} others ` : "";
  const messageText = `${userLoggedInData.firstName} ${userLoggedInData.lastName} added ${userAddedName} ${moreUsersMessage}to the chat`;
  await sendInfoMessage(chatDataKey, userLoggedInData.userId, messageText);
};

const sendPushNotificationForUsers = (
  chatUsers: string[],
  title: string,
  body: string,
  chatId: string,
): void => {
  chatUsers.forEach(async (uid) => {
    const tokens = await getUserPushTokens(uid);

    for (const key in tokens) {
      const token = tokens[key];

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          title,
          body,
          data: { chatId },
        }),
      });
    }
  });
};
