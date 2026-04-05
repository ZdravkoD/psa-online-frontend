import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import BoughtProductsTable from './BoughtProductsTable';

jest.mock('../AlternativeNames/AlternativeNames', () => () => 'AlternativeNames');

const products = [
  {
    original_product_name: 'магн сулфат',
    bought_from_distributor: 'Sting',
    all_pharmacy_product_infos: [
      {
        distributor: 'Sting',
        name: 'МАГНЕЗИЕВ СУЛФАТ',
        price: 0.58,
        is_on_promotion: false,
        alternative_names: [],
      },
      {
        distributor: 'Phoenix',
        name: '',
        price: -1,
        is_on_promotion: false,
        alternative_names: ['Магнезиев сулфат'],
      },
    ],
  },
  {
    original_product_name: 'бетафузин',
    bought_from_distributor: 'Sting',
    all_pharmacy_product_infos: [
      {
        distributor: 'Sting',
        name: 'БЕТАФУЗИН крем',
        price: 5.94,
        is_on_promotion: true,
        alternative_names: [],
      },
      {
        distributor: 'Phoenix',
        name: 'БЕТАФУЗИН КРЕМ',
        price: 6.06,
        is_on_promotion: false,
        alternative_names: [],
      },
    ],
  },
];

test('explains blue cells, the alternative names button, and the promotion star with tooltips', async () => {
  render(<BoughtProductsTable products={products} distributors={['Sting', 'Phoenix']} />);

  fireEvent.mouseOver(screen.getAllByText('N/A')[0]);

  expect(
    await screen.findByText(
      'Тази синя клетка означава, че продуктът не е намерен с директно съвпадение, но има предложени алтернативни имена. Натиснете иконата за преглед.'
    )
  ).toBeInTheDocument();

  fireEvent.mouseOver(
    screen.getByRole('button', { name: 'Покажи предложените алтернативни имена' })
  );

  expect(
    await screen.findByText('Покажи предложените алтернативни имена')
  ).toBeInTheDocument();

  fireEvent.mouseOver(
    screen.getByLabelText('Продукт на промоция')
  );

  expect(
    await screen.findByText(
      'Червената звезда означава, че продуктът е на промоция при този дистрибутор.'
    )
  ).toBeInTheDocument();
});
