// src/store/tasks.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types/task';

interface TaskState {
    data: { [id: string]: Task };
}

const initialState: TaskState = {
    data: {},
};

const tasks = createSlice({
    name: 'taskData',
    initialState,
    reducers: {
        setTaskData(state, action: PayloadAction<Task>) {
            state.data[action.payload.id] = action.payload;
        },
    },
});

export const { setTaskData } = tasks.actions;
export default tasks.reducer;
