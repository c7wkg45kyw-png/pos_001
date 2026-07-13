import { buildApiUrl, logApiRequest } from "@/services/http";
import { requireSessionToken } from "@/services/api";
import { handleUnauthorizedResponse } from "@/services/session";

export type BudgetCategoryRecord = {
  id: string;
  name: string;
  department: string;
  allocatedAmount: number;
  committedAmount: number;
};

export type SupplierRecord = {
  id: string;
  supplierNo: string;
  companyName: string;
  taxId: string;
  businessType: string;
  address: string;
  phone: string;
  email: string;
  social: string;
  categories: string[];
  catalogFileName: string;
  standards: string;
  creditTermDays: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  location: string;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryResponsibility = "Buyer" | "Seller";

export type DeliveryTermRecord = {
  id: string;
  termCode: string;
  name: string;
  version: "Incoterms 2020" | "Incoterms 2010" | "Non-Incoterms/Domestic";
  description: string;
  originFreight: DeliveryResponsibility;
  originCustoms: DeliveryResponsibility;
  mainCarriage: DeliveryResponsibility;
  insurance: DeliveryResponsibility;
  destinationCustoms: DeliveryResponsibility;
  destinationFreight: DeliveryResponsibility;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseRequisitionLineRecord = {
  id: string;
  itemName: string;
  catalogItemId: string;
  unit: string;
  quantity: number;
  estimatedUnitPrice: number;
};

export type PurchaseRequisitionRecord = {
  id: string;
  prNumber: string;
  requesterId: string;
  requesterName: string;
  department: string;
  budgetCategoryId: string;
  budgetCategoryName: string;
  requestedDate: string;
  requiredDate: string;
  totalEstimatedAmount: number;
  status: "draft" | "pending_approval" | "approved" | "rejected";
  purposeRemarks: string;
  itemLines: PurchaseRequisitionLineRecord[];
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BudgetCategoryApi = {
  id: string;
  name: string;
  department: string;
  allocated_amount: number;
  committed_amount: number;
};

type SupplierApi = {
  id: string;
  supplier_no: string;
  company_name: string;
  tax_id: string;
  business_type: string;
  address: string;
  phone: string;
  email: string;
  social: string;
  categories: string[];
  catalog_file_name: string;
  standards: string;
  credit_term_days: number;
  bank_account_name: string;
  bank_account_number: string;
  bank_branch: string;
  location: string;
  created_at: string;
  updated_at: string;
};

type DeliveryTermApi = {
  id: string;
  term_code: string;
  name: string;
  version: DeliveryTermRecord["version"];
  description: string;
  origin_freight: DeliveryResponsibility;
  origin_customs: DeliveryResponsibility;
  main_carriage: DeliveryResponsibility;
  insurance: DeliveryResponsibility;
  destination_customs: DeliveryResponsibility;
  destination_freight: DeliveryResponsibility;
  created_at: string;
  updated_at: string;
};

type PurchaseRequisitionApi = {
  id: string;
  pr_number: string;
  requester_id: string;
  requester_name: string;
  department: string;
  budget_category_id: string;
  budget_category_name: string;
  requested_date: string;
  required_date: string;
  total_estimated_amount: number;
  status: PurchaseRequisitionRecord["status"];
  purpose_remarks: string;
  item_lines: Array<{
    id: string;
    item_id: string;
    item_name: string;
    unit: string;
    quantity: number;
    estimated_unit_price: number;
  }>;
  created_at: string;
  updated_at: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = requireSessionToken();
  const url = buildApiUrl(path);
  const method = init?.method ?? "GET";
  const startedAt = Date.now();
  logApiRequest(method, url);
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  });
  logApiRequest(method, url, response.status, Date.now() - startedAt);
  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorizedResponse();
      throw new Error("Session expired. Please login again.");
    }
    let detail = "";
    try {
      const payload = (await response.json()) as { message?: string };
      detail = payload.message ? `: ${payload.message}` : "";
    } catch {
      detail = "";
    }
    throw new Error(`Request failed: ${response.status}${detail}`);
  }
  return (await response.json()) as T;
}

function mapBudgetCategory(item: BudgetCategoryApi): BudgetCategoryRecord {
  return {
    id: item.id,
    name: item.name,
    department: item.department,
    allocatedAmount: item.allocated_amount,
    committedAmount: item.committed_amount
  };
}

function mapSupplier(item: SupplierApi): SupplierRecord {
  return {
    id: item.id,
    supplierNo: item.supplier_no,
    companyName: item.company_name,
    taxId: item.tax_id ?? "",
    businessType: item.business_type ?? "",
    address: item.address ?? "",
    phone: item.phone ?? "",
    email: item.email ?? "",
    social: item.social ?? "",
    categories: item.categories ?? [],
    catalogFileName: item.catalog_file_name ?? "",
    standards: item.standards ?? "",
    creditTermDays: item.credit_term_days ?? 0,
    bankAccountName: item.bank_account_name ?? "",
    bankAccountNumber: item.bank_account_number ?? "",
    bankBranch: item.bank_branch ?? "",
    location: item.location ?? "",
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? ""
  };
}

function mapDeliveryTerm(item: DeliveryTermApi): DeliveryTermRecord {
  return {
    id: item.id,
    termCode: item.term_code,
    name: item.name,
    version: item.version,
    description: item.description ?? "",
    originFreight: item.origin_freight,
    originCustoms: item.origin_customs,
    mainCarriage: item.main_carriage,
    insurance: item.insurance,
    destinationCustoms: item.destination_customs,
    destinationFreight: item.destination_freight,
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? ""
  };
}

function mapRequisition(item: PurchaseRequisitionApi): PurchaseRequisitionRecord {
  return {
    id: item.id,
    prNumber: item.pr_number,
    requesterId: item.requester_id,
    requesterName: item.requester_name,
    department: item.department,
    budgetCategoryId: item.budget_category_id,
    budgetCategoryName: item.budget_category_name,
    requestedDate: item.requested_date,
    requiredDate: item.required_date,
    totalEstimatedAmount: item.total_estimated_amount,
    status: item.status,
    purposeRemarks: item.purpose_remarks ?? "",
    itemLines: (item.item_lines ?? []).map((line) => ({
      id: line.id,
      itemName: line.item_name,
      catalogItemId: line.item_id ?? "",
      unit: line.unit,
      quantity: line.quantity,
      estimatedUnitPrice: line.estimated_unit_price
    })),
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? ""
  };
}

export async function getBudgetCategories(): Promise<BudgetCategoryRecord[]> {
  const response = await request<ApiResponse<BudgetCategoryApi[]>>("/budget-categories");
  return (response.data ?? []).map(mapBudgetCategory);
}

export async function getSuppliers(): Promise<SupplierRecord[]> {
  const response = await request<ApiResponse<SupplierApi[]>>("/suppliers");
  return (response.data ?? []).map(mapSupplier);
}

export async function saveSupplier(input: Omit<SupplierRecord, "createdAt" | "updatedAt">): Promise<SupplierRecord> {
  const response = await request<ApiResponse<SupplierApi>>("/suppliers", {
    method: "POST",
    body: JSON.stringify({
      id: input.id,
      supplier_no: input.supplierNo,
      company_name: input.companyName,
      tax_id: input.taxId,
      business_type: input.businessType,
      address: input.address,
      phone: input.phone,
      email: input.email,
      social: input.social,
      categories: input.categories,
      catalog_file_name: input.catalogFileName,
      standards: input.standards,
      credit_term_days: input.creditTermDays,
      bank_account_name: input.bankAccountName,
      bank_account_number: input.bankAccountNumber,
      bank_branch: input.bankBranch,
      location: input.location
    })
  });
  return mapSupplier(response.data);
}

export async function getDeliveryTerms(): Promise<DeliveryTermRecord[]> {
  const response = await request<ApiResponse<DeliveryTermApi[]>>("/delivery-terms");
  return (response.data ?? []).map(mapDeliveryTerm);
}

export async function saveDeliveryTerm(input: Omit<DeliveryTermRecord, "createdAt" | "updatedAt">): Promise<DeliveryTermRecord> {
  const response = await request<ApiResponse<DeliveryTermApi>>("/delivery-terms", {
    method: "POST",
    body: JSON.stringify({
      id: input.id,
      term_code: input.termCode,
      name: input.name,
      version: input.version,
      description: input.description,
      origin_freight: input.originFreight,
      origin_customs: input.originCustoms,
      main_carriage: input.mainCarriage,
      insurance: input.insurance,
      destination_customs: input.destinationCustoms,
      destination_freight: input.destinationFreight
    })
  });
  return mapDeliveryTerm(response.data);
}

export async function getPurchaseRequisitions(): Promise<PurchaseRequisitionRecord[]> {
  const response = await request<ApiResponse<PurchaseRequisitionApi[]>>("/purchase-requisitions");
  return (response.data ?? []).map(mapRequisition);
}

export async function getPurchaseRequisition(id: string): Promise<PurchaseRequisitionRecord> {
  const response = await request<ApiResponse<PurchaseRequisitionApi>>(`/purchase-requisitions/${id}`);
  return mapRequisition(response.data);
}

export async function savePurchaseRequisition(input: {
  id?: string;
  requiredDate: string;
  budgetCategoryId: string;
  purposeRemarks: string;
  status: PurchaseRequisitionRecord["status"];
  itemLines: PurchaseRequisitionLineRecord[];
}): Promise<PurchaseRequisitionRecord> {
  const response = await request<ApiResponse<PurchaseRequisitionApi>>(input.id ? `/purchase-requisitions/${input.id}` : "/purchase-requisitions", {
    method: input.id ? "PUT" : "POST",
    body: JSON.stringify({
      required_date: input.requiredDate,
      budget_category_id: input.budgetCategoryId,
      purpose_remarks: input.purposeRemarks,
      status: input.status,
      item_lines: input.itemLines.map((line) => ({
        id: line.id,
        item_id: line.catalogItemId,
        item_name: line.itemName,
        unit: line.unit,
        quantity: line.quantity,
        estimated_unit_price: line.estimatedUnitPrice
      }))
    })
  });
  return mapRequisition(response.data);
}

export async function updatePurchaseRequisitionStatus(id: string, status: PurchaseRequisitionRecord["status"]): Promise<PurchaseRequisitionRecord> {
  const response = await request<ApiResponse<PurchaseRequisitionApi>>(`/purchase-requisitions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  return mapRequisition(response.data);
}
