import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { apiGet } from '../api/client';

export interface Pharmacy {
  pharmacy_id: string;
  display_name: string;
}

export interface Distributor {
  name: string;
  display_name: string;
}

export interface InitDataState {
  pharmacies: Pharmacy[];
  distributors: Distributor[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InitDataState = {
  pharmacies: [],
  distributors: [],
  status: 'idle',
  error: null,
};

export const fetchInitData = createAsyncThunk(
  'initData/fetchInitData',
  async () => {
    const [pharmacies, distributors] = await Promise.all([
      apiGet<Pharmacy[]>('/pharmacies'),
      apiGet<Distributor[]>('/distributors'),
    ]);

    return {
      pharmacies,
      distributors,
    };
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { initData: InitDataState };
      return state.initData.status === 'idle';
    },
  }
);

const initData = createSlice({
  name: 'initData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInitData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.pharmacies = action.payload.pharmacies;
        state.distributors = action.payload.distributors;
      })
      .addCase(fetchInitData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'An unknown error occurred';
      });
  },
});

export default initData.reducer;
