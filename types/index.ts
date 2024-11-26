export type RootStackParamList = {
  Home: undefined;
  AuthScreen: undefined;
  ChatListScreen: { selectedUserId?: string };
  ChatScreen: {
    newChatData?: { users: string[] };
    chatId?: string;
  };
  ChatSettingsScreen: undefined;
  NewChatScreen: undefined;
  SettingsScreen: undefined;
  StartUpScreen: undefined;
};

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
}

export interface Message {
  sentBy: string;
  sentAt: string;
  updatedBy: string;
  updatedAt: string;
  text: string;
}

export interface MessagesData {
  [chatId: string]: Message;
}
