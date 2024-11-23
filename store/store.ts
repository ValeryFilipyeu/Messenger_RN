import { configureStore } from "@reduxjs/toolkit";
import authSlice, { AuthState } from "./authSlice";
import userSlice, { UserState } from "./userSlice";
import chatSlice, { ChatState } from "./chatSlice";

export interface RootState {
  auth: AuthState;
  users: UserState;
  chats: ChatState;
}

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: userSlice,
    chats: chatSlice,
  },
});
