import {
  AllPharmacyProductInfos,
  BoughtProduct,
  UnboughtProduct,
} from '../types/product';

function normalizeDistributorKey(distributor: string) {
  return distributor.trim().toLowerCase();
}

function hasDisplayCasing(distributor: string) {
  return /[A-Z]/.test(distributor);
}

export function getDistributorNames(
  distributors: string[] | undefined,
  boughtProducts: BoughtProduct[]
) {
  const orderedDistributors: string[] = [];
  const distributorIndexes = new Map<string, number>();

  const addDistributor = (distributor: string) => {
    const normalizedDistributor = normalizeDistributorKey(distributor);
    const existingIndex = distributorIndexes.get(normalizedDistributor);

    if (existingIndex === undefined) {
      distributorIndexes.set(normalizedDistributor, orderedDistributors.length);
      orderedDistributors.push(distributor);
      return;
    }

    if (
      !hasDisplayCasing(orderedDistributors[existingIndex]) &&
      hasDisplayCasing(distributor)
    ) {
      orderedDistributors[existingIndex] = distributor;
    }
  };

  (distributors ?? []).forEach(addDistributor);

  boughtProducts.forEach((product) => {
    product.all_pharmacy_product_infos.forEach((info) => {
      addDistributor(info.distributor);
    });
  });

  return orderedDistributors;
}

export function getProductInfoByDistributor(
  product: BoughtProduct,
  distributor: string
): AllPharmacyProductInfos | undefined {
  return product.all_pharmacy_product_infos.find(
    (info) =>
      normalizeDistributorKey(info.distributor) ===
      normalizeDistributorKey(distributor)
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
