// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import initDataReducer from './initData';
import outputReducer from './tasks';

const store = configureStore({
  reducer: {
    initData: initDataReducer,
    output: outputReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
