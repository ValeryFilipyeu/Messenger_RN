export type RootStackParamList = {
  Home: undefined;
  AuthScreen: undefined;
  ChatListScreen: { selectedUserId?: string } | undefined;
  ChatScreen:
    | {
        newChatData: { users: (string | undefined)[] };
        chatId?: string | null | undefined;
      }
    | undefined;
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
