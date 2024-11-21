import { configureStore } from "@reduxjs/toolkit";
import authSlice, { AuthState } from "./authSlice";
import userSlice, { UserState } from "./userSlice";

export interface RootState {
  auth: AuthState;
  users: UserState;
}

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: userSlice,
  },
});
