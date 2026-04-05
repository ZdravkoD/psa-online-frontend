import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AlternativeNames from './AlternativeNames';
import * as apiClient from '../../api/client';

jest.mock('../../api/client');

const mockedApiGet = apiClient.apiGet as jest.MockedFunction<typeof apiClient.apiGet>;

beforeEach(() => {
  mockedApiGet.mockResolvedValue({
    items: [
      {
        id: 'product-1',
        original_product_name: 'НАТРИЕВ БЕНЗОАТ 20ГР Х',
        generated_product_variations: ['натриев бензоат 20гр'],
        custom_product_name_variations: ['натриев бензоат 20гр x'],
      },
    ],
  });
  jest.spyOn(window, 'open').mockImplementation(() => null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('opens the product dictionary with a search query parameter', async () => {
  render(
    <AlternativeNames
      open
      productName="НАТРИЕВ БЕНЗОАТ 20ГР Х"
      alternativeNames={['НАТРИЕВ БЕНЗОАТ 20Г']}
      onClose={jest.fn()}
    />
  );

  await screen.findByText('НАТРИЕВ БЕНЗОАТ 20ГР Х');

  fireEvent.click(screen.getByRole('button', { name: 'Отвори продуктовия речник' }));

  await waitFor(() => {
    expect(window.open).toHaveBeenCalledWith(
      'http://localhost/product-names?search=%D0%9D%D0%90%D0%A2%D0%A0%D0%98%D0%95%D0%92+%D0%91%D0%95%D0%9D%D0%97%D0%9E%D0%90%D0%A2+20%D0%93%D0%A0+%D0%A5',
      '_blank'
    );
  });
});
