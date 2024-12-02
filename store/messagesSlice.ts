import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessagesData, StarredMessageData } from "../types";

export interface MessagesState {
  messagesData: {
    [chatId: string]: MessagesData;
  };
  starredMessages: StarredMessageData;
}

const initialState: MessagesState = {
  messagesData: {},
  starredMessages: {},
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setChatMessages: (
      state,
      action: PayloadAction<{ chatId: string; messagesData: MessagesData }>,
    ) => {
      const existingMessages = state.messagesData;

      const { chatId, messagesData } = action.payload;

      existingMessages[chatId] = messagesData;

      state.messagesData = existingMessages;
    },
    setStarredMessages: (
      state,
      action: PayloadAction<{ starredMessages: StarredMessageData }>,
    ) => {
      const { starredMessages } = action.payload;
      state.starredMessages = { ...starredMessages };
    },
  },
});
export const { setChatMessages, setStarredMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
