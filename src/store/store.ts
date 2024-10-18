// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import outputReducer from './wsTaskData';

const store = configureStore({
  reducer: {
    output: outputReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
