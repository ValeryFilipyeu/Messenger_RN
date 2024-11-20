import { configureStore } from "@reduxjs/toolkit";
import authSlice, { AuthState } from "./authSlice";

export interface RootState {
  auth: AuthState;
}

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
});
