import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import config from '../config/config';

export interface Pharmacy {
  pharmacy_id: string;
  display_name: string;
}

export interface Distributor {
  name: string;
  display_name: string;
}

interface InitDataState {
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
    const [pharmacyResponse, distributorResponse] = await Promise.all([
      fetch(`${config.apiBaseUrl}/pharmacies`),
      fetch(`${config.apiBaseUrl}/distributors`),
    ]);

    if (!pharmacyResponse.ok) {
      throw new Error('Failed to fetch pharmacies');
    }

    if (!distributorResponse.ok) {
      throw new Error('Failed to fetch distributors');
    }

    const [pharmacies, distributors] = await Promise.all([
      pharmacyResponse.json(),
      distributorResponse.json(),
    ]);

    return {
      pharmacies: pharmacies as Pharmacy[],
      distributors: distributors as Distributor[],
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
