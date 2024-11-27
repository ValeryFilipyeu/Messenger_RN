import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Users } from "../types";

export interface UserState {
  storedUsers: Users;
}

const initialState: UserState = {
  storedUsers: {},
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setStoredUsers: (state, action: PayloadAction<{ newUsers: Users }>) => {
      const newUsers = action.payload.newUsers;
      const existingUsers = state.storedUsers;

      const usersArray = Object.values(newUsers);
      for (let i = 0; i < usersArray.length; i++) {
        const userData = usersArray[i];
        existingUsers[userData.userId] = userData;
      }

      state.storedUsers = existingUsers;
    },
  },
});
export const { setStoredUsers } = userSlice.actions;
export default userSlice.reducer;
