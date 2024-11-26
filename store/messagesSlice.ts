import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessagesData, Message } from "../types";

export interface MessagesState {
  messagesData: MessagesData;
}

const initialState: MessagesState = {
  messagesData: {},
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setChatMessages: (
      state,
      action: PayloadAction<{ chatId: string; messagesData: Message }>,
    ) => {
      const existingMessages = state.messagesData;

      const { chatId, messagesData } = action.payload;

      existingMessages[chatId] = messagesData;

      state.messagesData = existingMessages;
    },
  },
});
export const { setChatMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
