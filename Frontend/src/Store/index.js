import { combineReducers, configureStore } from "@reduxjs/toolkit";
import customerSlice from "../Reducer/customerSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import loaderSlice from "../Reducer/loaderSlice";

const persistConfig = {
  key: "root",
  storage,
};
const rootReducer = combineReducers({
  customer: customerSlice,
  loading: loaderSlice
})
const persistedReducer = persistReducer(persistConfig, rootReducer)
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export default store;