export interface TaskStatus {
    status: string;
    message: string;
    progress: number;
    detailed_error_message: string | null;
  }
  
  export interface AllPharmacyProductInfo {
    distributor: string;
    name: string;
    price: number;
    is_on_promotion: boolean;
  }
  
  export interface TaskReportBoughtProduct {
    original_product_name: string;
    bought_from_distributor: string;
    all_pharmacy_product_infos: AllPharmacyProductInfo[];
  }
  
  export interface TaskReportUnboughtProduct {
    product_name: string;
    quantity: number;
  }
  
  export interface TaskReport {
    bought_products: TaskReportBoughtProduct[];
    unbought_products: TaskReportUnboughtProduct[];
  }
  
  // Export the Task interface
  export interface Task {
    id: string;
    account_id: string;
    file_name: string; // The name of the input file
    pharmacy_id: string;
    distributors: string[];
    task_type: string;
    date_created: string;
    date_updated: string;
    status: TaskStatus;
    report: TaskReport;
    image_urls: string[] | null;
  }