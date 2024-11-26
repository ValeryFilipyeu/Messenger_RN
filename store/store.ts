import { configureStore } from "@reduxjs/toolkit";
import authSlice, { AuthState } from "./authSlice";
import userSlice, { UserState } from "./userSlice";
import chatSlice, { ChatState } from "./chatSlice";
import messagesSlice, { MessagesState } from "./messagesSlice";

export interface RootState {
  auth: AuthState;
  users: UserState;
  chats: ChatState;
  messages: MessagesState;
}

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: userSlice,
    chats: chatSlice,
    messages: messagesSlice
  },
});
