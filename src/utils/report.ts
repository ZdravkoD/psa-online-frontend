import {
  AllPharmacyProductInfos,
  BoughtProduct,
  UnboughtProduct,
} from '../types/product';

export function getDistributorNames(
  distributors: string[] | undefined,
  boughtProducts: BoughtProduct[]
) {
  const orderedDistributors = [...(distributors ?? [])];

  boughtProducts.forEach((product) => {
    product.all_pharmacy_product_infos.forEach((info) => {
      if (!orderedDistributors.includes(info.distributor)) {
        orderedDistributors.push(info.distributor);
      }
    });
  });

  return orderedDistributors;
}

export function getProductInfoByDistributor(
  product: BoughtProduct,
  distributor: string
): AllPharmacyProductInfos | undefined {
  return product.all_pharmacy_product_infos.find(
    (info) => info.distributor === distributor
  );
}

export function getBoughtProductsExportHeaders(distributors: string[]) {
  return [
    'Продукт',
    ...distributors.flatMap((distributor) => [
      `${distributor} - име на продукт`,
      `${distributor} - цена на продукт`,
    ]),
    'Добавен в количката на',
  ];
}

export function buildBoughtProductsExportRows(
  boughtProducts: BoughtProduct[],
  distributors: string[]
) {
  return boughtProducts.map((product) => {
    const row: Record<string, string | number | undefined> = {
      'Продукт': product.original_product_name,
      'Добавен в количката на': product.bought_from_distributor,
    };

    distributors.forEach((distributor) => {
      const info = getProductInfoByDistributor(product, distributor);
      row[`${distributor} - име на продукт`] = info?.name;
      row[`${distributor} - цена на продукт`] = info?.price;
    });

    return row;
  });
}

export function buildUnboughtProductsExportRows(
  unboughtProducts: UnboughtProduct[]
) {
  return unboughtProducts.map((product) => ({
    'Списък с некупени продукти': product.product_name,
    'Количество': product.quantity,
  }));
}
