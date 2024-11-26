import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatData } from "../types";

export interface ChatState {
  chatsData: Record<string, ChatData>;
}

const initialState: ChatState = {
  chatsData: {},
};

const chatSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setChatsData: (
      state,
      action: PayloadAction<{ chatsData: Record<string, ChatData> }>,
    ) => {
      state.chatsData = { ...action.payload.chatsData };
    },
  },
});
export const { setChatsData } = chatSlice.actions;
export default chatSlice.reducer;
