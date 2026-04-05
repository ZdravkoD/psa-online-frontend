import {
  buildBoughtProductsExportRows,
  getBoughtProductsExportHeaders,
  getDistributorNames,
  getProductInfoByDistributor,
} from './report';
import { BoughtProduct } from '../types/product';

const boughtProducts: BoughtProduct[] = [
  {
    original_product_name: 'Paracetamol',
    bought_from_distributor: 'Medex',
    all_pharmacy_product_infos: [
      {
        distributor: 'Sting',
        name: 'Paracetamol Sting',
        price: 4.2,
        is_on_promotion: false,
        alternative_names: [],
      },
      {
        distributor: 'Medex',
        name: 'Paracetamol Medex',
        price: 3.9,
        is_on_promotion: true,
        alternative_names: [],
      },
    ],
  },
];

test('collects distributors from both the task and report data', () => {
  expect(getDistributorNames(['Phoenix'], boughtProducts)).toEqual([
    'Phoenix',
    'Sting',
    'Medex',
  ]);
});

test('builds export headers and rows for every distributor', () => {
  const distributors = getDistributorNames(['Phoenix'], boughtProducts);
  const headers = getBoughtProductsExportHeaders(distributors);
  const rows = buildBoughtProductsExportRows(boughtProducts, distributors);

  expect(headers).toEqual([
    'Продукт',
    'Phoenix - име на продукт',
    'Phoenix - цена на продукт',
    'Sting - име на продукт',
    'Sting - цена на продукт',
    'Medex - име на продукт',
    'Medex - цена на продукт',
    'Добавен в количката на',
  ]);
  expect(rows[0]).toEqual({
    'Продукт': 'Paracetamol',
    'Phoenix - име на продукт': undefined,
    'Phoenix - цена на продукт': undefined,
    'Sting - име на продукт': 'Paracetamol Sting',
    'Sting - цена на продукт': 4.2,
    'Medex - име на продукт': 'Paracetamol Medex',
    'Medex - цена на продукт': 3.9,
    'Добавен в количката на': 'Medex',
  });
});

test('deduplicates distributors when task data uses slugs and report data uses display names', () => {
  expect(
    getDistributorNames(['sting', 'phoenix'], [
      {
        original_product_name: 'Vitamin C',
        bought_from_distributor: 'Phoenix',
        all_pharmacy_product_infos: [
          {
            distributor: 'Phoenix',
            name: 'Vitamin C Phoenix',
            price: 4.1,
            is_on_promotion: false,
            alternative_names: [],
          },
          {
            distributor: 'Sting',
            name: 'Vitamin C Sting',
            price: 4.3,
            is_on_promotion: false,
            alternative_names: [],
          },
        ],
      },
    ])
  ).toEqual(['Sting', 'Phoenix']);
});

test('matches product info by distributor case-insensitively', () => {
  expect(getProductInfoByDistributor(boughtProducts[0], 'sting')).toEqual(
    boughtProducts[0].all_pharmacy_product_infos[0]
  );
  expect(getProductInfoByDistributor(boughtProducts[0], 'medex')).toEqual(
    boughtProducts[0].all_pharmacy_product_infos[1]
  );
});
