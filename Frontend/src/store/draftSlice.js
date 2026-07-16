import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: "",
  content: "",
  regionOfArticle: "",
  newRegion: "",
};

const draftSlice = createSlice({
  name: "draft",
  initialState,
  reducers: {
    updateDraftField(state, action) {
      const { field, value } = action.payload;
      state[field] = value;
    },
    clearDraft() {
      return initialState;
    },
  },
});

export const { updateDraftField, clearDraft } = draftSlice.actions;
export default draftSlice.reducer;
