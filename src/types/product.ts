export interface Product {
  id: string;
  original_product_name: string;
  generated_product_variations: string[];
  custom_product_name_variations: string[];
}

export interface AllPharmacyProductInfos {
  distributor: string;
  name: string;
  price: number;
  is_on_promotion: boolean;
  alternative_names: string[];
}

export interface BoughtProduct {
  original_product_name: string;
  bought_from_distributor: string;
  all_pharmacy_product_infos: AllPharmacyProductInfos[];
}

export interface BoughtProductsTableProps {
  products: BoughtProduct[];
  distributors?: string[];
}

export interface UnboughtProduct {
  product_name: string;
  quantity: number;
  alternative_names: string[];
}
