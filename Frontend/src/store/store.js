import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import draftReducer from "./draftSlice";

const draftPersistConfig = {
  key: "draft",
  storage,
};

const persistedDraftReducer = persistReducer(draftPersistConfig, draftReducer);

export const store = configureStore({
  reducer: {
    draft: persistedDraftReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
