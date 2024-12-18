export type RootStackParamList = {
  Home: undefined;
  AuthScreen: undefined;
  ChatListScreen: {
    selectedUserId?: string;
    chatName?: string;
    selectedUsers?: string[];
  };
  ChatScreen: ChatScreenNavigationProps;
  ChatSettingsScreen: {
    chatId: string;
    selectedUsers?: string[];
  };
  NewChatScreen:
    | {
        isGroupChat: boolean;
        chatId?: string;
        existingUsers?: string[];
      }
    | undefined;
  SettingsScreen: undefined;
  StartUpScreen: undefined;
  ContactScreen: {
    uid: string;
    chatId?: string;
  };
  DataListScreen: {
    title: string;
    data: string[] | StarredMessage[];
    type: "users" | "messages";
    chatId?: string;
  };
};

export interface ChatScreenNavigationProps {
  chatId?: string | null;
  newChatData?: {
    users: string[];
    isGroupChat?: boolean;
    chatName?: string;
  };
}

export interface State {
  inputValidities: Record<string, boolean | [string] | undefined>;
  inputValues: Record<string, string>;
  formIsValid: boolean;
}

export interface Action {
  inputId: string;
  validationResult: [string] | undefined;
  inputValue: string;
}

export interface UserData {
  firstName: string;
  lastName: string;
  firstLast: string;
  email: string;
  userId: string;
  signUpDate: string;
  about?: string;
  profilePicture?: string;
  pushTokens?: { [key: string]: string };
}

export interface Users {
  [userId: string]: UserData;
}

export interface ChatData {
  key: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  users: string[];
  latestMessageText: string;
  isGroupChat?: boolean;
  chatName?: string;
  chatImage?: string;
}

export interface Message {
  key: string;
  sentBy: string;
  sentAt: string;
  updatedBy: string;
  updatedAt: string;
  text: string;
  replyTo?: string;
  imageUrl?: string | null;
  type?: "system" | "error" | "myMessage" | "theirMessage" | "reply" | "info";
}

export interface StarredMessage {
  chatId: string;
  messageId: string;
  starredAt: string;
}

export interface StarredMessageData {
  [chatId: string]: {
    [messageId: string]: StarredMessage;
  };
}

export interface MessagesData {
  [key: string]: Message;
}
