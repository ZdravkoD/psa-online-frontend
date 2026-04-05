import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDictionary from './ProductDictionary';
import * as apiClient from '../../api/client';

jest.mock('../../api/client');
jest.mock('../ReordableList/ReordableList', () => () => 'ReorderableList');

const mockedApiGet = apiClient.apiGet as jest.MockedFunction<typeof apiClient.apiGet>;

beforeEach(() => {
  jest.useFakeTimers();
  mockedApiGet.mockResolvedValue({
    items: [],
    total_count: 0,
  });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('loads products using the search query parameter', async () => {
  render(
    <MemoryRouter initialEntries={['/product-names?search=НАТРИЕВ БЕНЗОАТ 20ГР Х']}>
      <Routes>
        <Route path="/product-names" element={<ProductDictionary />} />
      </Routes>
    </MemoryRouter>
  );

  jest.advanceTimersByTime(500);

  await waitFor(() => {
    expect(mockedApiGet).toHaveBeenCalledWith('/products', {
      filter: JSON.stringify({
        original_product_name: 'НАТРИЕВ БЕНЗОАТ 20ГР Х',
      }),
      skip: 0,
      limit: 10,
    });
  });
});
