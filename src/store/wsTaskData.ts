// src/store/wsTaskData.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskData } from '../hooks/useAzurePubSubSocket';

interface TaskState {
    data: TaskData | null;
}

const initialState: TaskState = {
    data: null,
};

const wsTaskData = createSlice({
    name: 'taskData',
    initialState,
    reducers: {
        setTaskData(state, action: PayloadAction<TaskData>) {
            state.data = action.payload;
        },
    },
});

export const { setTaskData } = wsTaskData.actions;
export default wsTaskData.reducer;
