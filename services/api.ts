import type { AddressSummary, ApplicantSummary, AssessmentSummary, CandidateAssessmentSummary, CategorySummary, ColorSummary, CouponTransactionSummary, CustomerProfile, CustomerSummary, GoodsReceiptSummary, HREmployeeDirectorySummary, InterviewSummary, JobListingSummary, LoyaltyCouponSummary, LoyaltyEarningRuleSummary, LoyaltyRewardSummary, LoyaltyTierDetailSummary, LoyaltyTierSummary, MaterialSummary, MemberBenefitSummary, MemberPointBalanceSummary, MenuGroupConfigSummary, OfferSummary, PaymentMethodSummary, POSCatalogItemSummary, POSTransactionSummary, PreviewLayoutConfigSummary, PriceRuleSummary, PriceTierSummary, ProductSummary, PurchaseOrderSummary, QuotationDetail, QuotationStatus, QuotationSummary, SaleOrderSummary, SupplierInvoiceSummary, SupplierPaymentSummary, TermSummary, ThemeConfigSummary } from "@/types/models";
import { buildApiUrl, logApiRequest } from "@/services/http";
import { applyProfilePermissions, defaultPermissions, fullPermissions, setCurrentRoleId, setSessionPermissions, type PermissionMatrix, type RoleBackendProfile } from "@/services/permissions";
import { clearSessionStorage, handleUnauthorizedResponse } from "@/services/session";
import { saveSessionTheme } from "@/services/theme";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type LoginApiResponse = {
  token: string;
  user: {
    id: string;
    username: string;
    display_name: string;
    role_id: string;
    status: string;
  };
  role: {
    id: string;
    role_name: string;
    backend_profile: RoleBackendProfile;
    permissions: Array<{
      module_name: string;
      can_create: boolean;
      can_update: boolean;
      can_delete: boolean;
    }>;
  };
  menu_config: MenuGroupConfigSummary[];
};

type CustomerApi = {
  id: string;
  owner_user_id?: string;
  primary_contact_id?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  created_at?: string;
  updated_at?: string;
  customer_type?: string;
  customer_name: string;
  account_code: string;
  billing_address?: string;
  full_name?: string;
  national_id?: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
  registered_address?: string;
  document_delivery_address?: string;
  identity_document_note?: string;
  line_id?: string;
  bank_info?: string;
  company_name?: string;
  tax_id?: string;
  branch_type?: string;
  office_phone?: string;
  company_email?: string;
  website?: string;
  company_certificate_note?: string;
  vat_certificate_note?: string;
  shareholder_list_note?: string;
  power_of_attorney_note?: string;
  authorized_person_name?: string;
  authorized_person_title?: string;
  authorized_person_phone?: string;
  authorized_person_email?: string;
  status: "active" | "inactive";
};

type LoyaltyTierApi = {
  id: string;
  loyalty_name: string;
  min_spend: number;
  benefit: string;
  created_at: string;
  updated_at: string;
};

type LoyaltyTierMemberApi = {
  id: string;
  tier_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
};

type LoyaltyTierBenefitApi = {
  id: string;
  tier_id: string;
  benefit_type: string;
  ref_id: string;
  benefit_name: string;
  created_at: string;
};

type LoyaltyTierDetailApi = {
  tier: LoyaltyTierApi;
  members: LoyaltyTierMemberApi[];
  benefits: LoyaltyTierBenefitApi[];
};

type LoyaltyRewardApi = {
  id: string;
  reward_name: string;
  reward_type: string;
  product_id: string;
  product_name: string;
  loyalty_tier_id: string;
  loyalty_tier: string;
  use_point: number;
  stock: number;
  owner_count: number;
  cost_per: number;
  expiry: string;
  created_at: string;
  updated_at: string;
};

type LoyaltyCouponApi = {
  id: string;
  coupon_code: string;
  coupon_name: string;
  coupon_type: string;
  loyalty_tier_id: string;
  loyalty_tier: string;
  stock: number;
  owner_count: number;
  value_label: string;
  expiry: string;
  created_at: string;
  updated_at: string;
};

type LoyaltyEarningRuleApi = {
  id: string;
  rule_name: string;
  loyalty_tier_id: string;
  loyalty_tier: string;
  trigger_rule: string;
  reward_logic: string;
  owner_count: number;
  expiry: string;
  created_at: string;
  updated_at: string;
};

type MemberBenefitApi = {
  id: string;
  customer_id: string;
  name: string;
  code: string;
  benefit_type: string;
  source_ref_id: string;
  amount: number;
  created_at: string;
  expires_at: string;
  updated_at: string;
};

type CouponTransactionApi = {
  id: string;
  customer_id: string;
  member_benefit_id: string;
  coupon_code: string;
  coupon_name: string;
  benefit_type: string;
  value_amount: number;
  sale_order_no: string;
  pos_transaction_number: string;
  status: string;
  redeemed_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

type MemberPointBalanceApi = {
  customer_id: string;
  current_points: number;
  earned_points: number;
  spent_points: number;
};

type ProductApi = {
  id: string;
  product_code: string;
  product_name: string;
  barcode?: string;
  description?: string;
  image_data_url?: string;
  category_id?: string;
  category_name?: string;
  material_id?: string;
  material_name?: string;
  color_id?: string;
  color_name?: string;
  features?: string[];
  width?: number;
  length?: number;
  height?: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

type POSCatalogItemApi = {
  product_id: string;
  product_code: string;
  product_name: string;
  barcode: string;
  category_name: string;
  basic_price: number;
  tax_rate: number;
  active: boolean;
};

type POSTransactionApi = {
  id: string;
  transaction_number: string;
  customer_id: string;
  customer_name: string;
  cashier_id: string;
  cashier_name: string;
  payment_method_id: string;
  payment_method_name: string;
  subtotal: number;
  discount: number;
  vat_rate: number;
  vat: number;
  grand_total: number;
  amount_received: number;
  amount_changed: number;
  generated_quotation_id: string;
  generated_quotation_no: string;
  generated_sale_order_id: string;
  generated_sale_order_no: string;
  status: "success" | "cancelled";
  created_at: string;
  updated_at?: string;
  voided_at?: string;
  voided_by?: string;
  void_reason?: string;
  items?: Array<{
    id: string;
    product_id: string;
    item_name: string;
    product_code: string;
    barcode: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
    line_subtotal: number;
    line_discount: number;
    line_vat: number;
    total_price: number;
  }>;
};

type HREmployeeApi = {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  department?: string;
  position_title?: string;
};

type PurchaseOrderLookupApi = {
  id: string;
  po_number: string;
  supplier_name: string;
  order_date: string;
  expected_date: string;
  status: "draft" | "open" | "partial" | "received";
  items: Array<{
    po_item_id: string;
    item_id: string;
    product_code: string;
    product_name: string;
    quantity_ordered: number;
    quantity_received_total: number;
    quantity_rejected_total: number;
    remaining_qty: number;
  }>;
};

type GoodsReceiptApi = {
  id: string;
  gr_number: string;
  purchase_order_id: string;
  po_number: string;
  supplier_name: string;
  received_date: string;
  received_by: string;
  received_by_name: string;
  delivery_note_number?: string;
  remarks?: string;
  posting_status: "draft" | "posted";
  receipt_status: "draft" | "partial" | "completed";
  total_received: number;
  total_rejected: number;
  items: Array<{
    id: string;
    po_item_id: string;
    item_id: string;
    product_code: string;
    product_name: string;
    quantity_ordered: number;
    quantity_received: number;
    quantity_rejected: number;
  }>;
  created_at: string;
  updated_at: string;
};

type SupplierInvoiceApi = {
  id: string;
  invoice_number: string;
  purchase_order_id: string;
  purchase_order_number: string;
  supplier_name: string;
  supplier_bank_name: string;
  supplier_bank_account: string;
  invoice_date: string;
  due_date: string;
  sub_total: number;
  vat_amount: number;
  grand_total: number;
  matching_status: "pending" | "matched" | "mismatched";
  payment_status: "unpaid" | "partial" | "paid";
  invoice_file_url: string;
  goods_receipt_ids: string[];
  goods_receipt_numbers: string[];
  lines: Array<{
    id: string;
    po_item_id: string;
    item_id: string;
    product_code: string;
    product_name: string;
    ordered_qty: number;
    received_qty: number;
    rejected_qty: number;
    invoiced_qty: number;
    unit_price: number;
    po_amount: number;
    invoice_amount: number;
    is_mismatch: boolean;
    goods_receipt_refs: string[];
  }>;
  created_at: string;
  updated_at: string;
};

type SupplierPaymentApi = {
  id: string;
  payment_voucher_number: string;
  invoice_id: string;
  invoice_number: string;
  supplier_name: string;
  payment_date: string;
  payment_method: "Bank_Transfer" | "Cheque" | "Cash";
  paid_amount: number;
  bank_slip_url: string;
  created_at: string;
  updated_at: string;
};

type MasterDataApi = {
  id: string;
  thai_name: string;
  english_name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  company_id: string;
};

type ThemeConfigApi = {
  id: string;
  theme_name: string;
  bg: string;
  surface: string;
  surface_alt: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primary_soft: string;
  warning: string;
  danger: string;
  success: string;
  shadow: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

type PreviewLayoutConfigApi = {
  id: string;
  seller_font_size: number;
  buyer_font_size: number;
  meta_font_size: number;
  meta_panel_width: number;
  terms_font_size: number;
  table_width: number;
  header_gap: number;
  meta_gap: number;
  terms_top: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

type AddressApi = {
  id: string;
  province: string;
  district: string;
  sub_district: string;
  zip_code: string;
};

type JobListingApi = {
  id: string;
  job_id: string;
  job_title: string;
  department_name: string;
  role_level: string;
  location_name: string;
  location_detail?: string;
  work_type: string;
  job_description: string;
  requirements_text?: string;
  requirements_tags?: string[];
  application_deadline: string;
  salary_min?: number;
  salary_max?: number;
  hide_salary_from_public?: boolean;
  status: JobListingSummary["status"];
  recruitment_enabled?: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
};

type ApplicantApi = {
  application_id: string;
  applicant_id: string;
  job_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_photo_url?: string;
  current_company?: string;
  current_role?: string;
  resume_url: string;
  portfolio_url?: string;
  portfolio_urls?: string[];
  source: string;
  job_title: string;
  department_name: string;
  role_level: string;
  location_name: string;
  work_type: string;
  status: ApplicantSummary["status"];
  match_percentage: number;
  recruiter_notes?: string;
  applied_at: string;
  updated_at: string;
};

type InterviewApi = {
  id: string;
  application_id: string;
  applicant_id: string;
  job_id: string;
  applicant_name: string;
  job_title: string;
  department_name: string;
  title: string;
  interview_date: string;
  start_time: string;
  end_time: string;
  interview_mode: InterviewSummary["interviewMode"];
  location?: string;
  meeting_url?: string;
  status: InterviewSummary["status"];
  scorecard_status: InterviewSummary["scorecardStatus"];
  created_at: string;
  updated_at: string;
  panels: Array<{
    id: string;
    interview_id: string;
    interviewer_email: string;
    status: InterviewSummary["panels"][number]["status"];
  }>;
  scorecards: Array<{
    id: string;
    interview_id: string;
    interviewer_email: string;
    rating: number;
    feedback_notes?: string;
    recommendation: InterviewSummary["scorecards"][number]["recommendation"];
  }>;
};

type AssessmentApi = {
  id: string;
  test_code?: string;
  title: string;
  description?: string;
  category: AssessmentSummary["category"];
  total_questions: number;
  duration_minutes: number;
  max_score?: number;
  passing_score: number;
  external_test_url?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  usage_count?: number;
  questions?: Array<{
    id: string;
    test_id: string;
    question_text: string;
    question_image_url?: string;
    options?: Array<{
      option_id: string;
      text: string;
      is_correct: boolean;
    }>;
    sort_order: number;
  }>;
};

type CandidateAssessmentApi = {
  id: string;
  application_id: string;
  applicant_id: string;
  job_id: string;
  applicant_name: string;
  applicant_photo_url?: string;
  job_title: string;
  department_name: string;
  role_level: string;
  assessment_id: string;
  assessment_title: string;
  assessment_category: CandidateAssessmentSummary["assessmentCategory"];
  total_questions: number;
  duration_minutes: number;
  passing_score: number;
  status: CandidateAssessmentSummary["status"];
  sent_at: string;
  completed_at: string;
  score_achieved: number;
  result_status: CandidateAssessmentSummary["resultStatus"];
  test_link: string;
  created_at: string;
  updated_at: string;
};

type OfferApi = {
  id: string;
  application_id: string;
  applicant_id: string;
  job_id: string;
  applicant_name: string;
  applicant_photo: string;
  job_title: string;
  department_name: string;
  salary: number;
  sign_on_bonus: number;
  benefits_package: string[];
  offer_letter_url: string;
  sent_at: string;
  expiry_date: string;
  status: OfferSummary["status"];
  decline_reason: string;
  start_date: string;
  created_at: string;
  updated_at: string;
  offer_approvals: Array<{
    id: string;
    offer_id: string;
    approver_email: string;
    approval_status: OfferSummary["offerApprovals"][number]["approvalStatus"];
    comment: string;
  }>;
};

type QuotationApi = {
  id: string;
  quotation_no: string;
  customer_id: string;
  owner_user_id: string;
  status: QuotationSummary["status"];
  created_at: string;
  validity_date: string;
};

type PriceTierApi = {
  id: string;
  tier: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  company_id: string;
};

type PriceRuleApi = {
  id: string;
  product_id: string;
  tax_code_id: string;
  price_tier_id?: string | null;
  standard_price: number;
  discount_limit_percent: number;
  created_by?: string;
  effective_from: string;
  effective_to?: string | null;
};

type QuotationCreateResponse = {
  quotation: QuotationApi;
  version: {
    subtotal_amount: number;
    tax_amount: number;
    total_amount: number;
  };
};

type QuotationDetailApi = {
  quotation: QuotationApi;
  version: {
    terms: string;
    total_amount: number;
  };
  line_items: Array<{
    id: string;
    line_order: number;
    product_id: string;
    product_code: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_percent: number;
    tax_rate: number;
    line_total: number;
  }>;
};

type SaleOrderApi = {
  id: string;
  so_number: string;
  quotation_id: string;
  quotation_no: string;
  customer_id: string;
  customer_name: string;
  created_by: string;
  created_by_name: string;
  payment_method_id: string;
  payment_method_name: string;
  payment_term_days: number;
  shipping_address: string;
  promotion_campaign: string;
  subtotal: number;
  discount: number;
  vat_rate: number;
  vat: number;
  grand_total: number;
  status: SaleOrderSummary["status"];
  created_at: string;
  updated_at: string;
  items: Array<{
    id: string;
    product_id: string;
    promotion_id: string;
    item_name: string;
    product_code: string;
    quantity: number;
    unit_price: number;
    discount: number;
    discounted_net: number;
    tax_rate: number;
    total_price: number;
  }>;
  delivery?: {
    id: string;
    delivery_number: string;
    requested_delivery_date: string;
    actual_delivery_date: string;
    shipping_address: string;
    tracking_number: string;
    status: SaleOrderSummary["delivery"] extends { status: infer T } ? T : string;
  } | null;
  payments: Array<{
    id: string;
    payment_number: string;
    payment_method_id: string;
    amount_paid: number;
    payment_status: SaleOrderSummary["payments"][number]["paymentStatus"];
    paid_at: string;
    evidence_url: string;
    created_at: string;
  }>;
  coupon_transactions: CouponTransactionApi[];
  outstanding_balance: number;
};

const sessionTokenKey = "qms.session.token";
const sessionUserKey = "qms.session.user";
const sessionProfileKey = "qms.session.profile";
const sessionMenuConfigKey = "qms.session.menuConfig";
const sessionCompanyConfigKey = "qms.session.companyConfig";

export const userCodes: Record<string, string> = {
  "10ce5872-d735-4a25-8ecb-69969a620624": "ADM-001",
  "751a83c7-dc5f-43fe-adea-3cf2e38f89a0": "SAL-001",
  "b01f25be-969b-4861-9cfd-1fd7dc2b63e7": "MGR-001",
  "3ed8b670-c3db-4977-8931-bb624a213548": "FIN-001"
};

type LoginProfile = RoleBackendProfile;

function authHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function displayNameFromId(id: string, names: Record<string, string>): string {
  return names[id] ?? id;
}

async function getUserDisplayNames(token: string): Promise<Record<string, string>> {
  const response = await request<ApiResponse<Array<{ id: string; display_name: string }>>>("/users", {
    headers: authHeaders(token)
  });
  return Object.fromEntries((response.data ?? []).map((user) => [user.id, user.display_name]));
}

export async function getUserDirectory(token: string): Promise<Record<string, string>> {
  return getUserDisplayNames(token);
}

export async function getUserContacts(token: string): Promise<Array<{ id: string; displayName: string; email: string }>> {
  const response = await request<ApiResponse<Array<{ id: string; display_name: string; email: string }>>>("/users", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((user) => ({
    id: user.id,
    displayName: user.display_name,
    email: user.email
  }));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  const method = init?.method ?? "GET";
  const startedAt = Date.now();
  logApiRequest(method, url);
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
      const payload = (await response.json()) as { message?: string; error_code?: string };
      detail = payload.message ? `: ${payload.message}` : "";
    } catch {
      detail = "";
    }
    throw new Error(`Request failed: ${response.status}${detail}`);
  }
  return (await response.json()) as T;
}

function mapPurchaseOrderApi(item: PurchaseOrderLookupApi): PurchaseOrderSummary {
  return {
    id: item.id,
    poNumber: item.po_number,
    supplierName: item.supplier_name,
    orderDate: item.order_date,
    expectedDate: item.expected_date,
    status: item.status,
    items: (item.items ?? []).map((line) => ({
      poItemId: line.po_item_id,
      itemId: line.item_id,
      productCode: line.product_code,
      productName: line.product_name,
      quantityOrdered: line.quantity_ordered,
      quantityReceivedTotal: line.quantity_received_total,
      quantityRejectedTotal: line.quantity_rejected_total,
      remainingQty: line.remaining_qty
    }))
  };
}

function mapGoodsReceiptApi(item: GoodsReceiptApi): GoodsReceiptSummary {
  return {
    id: item.id,
    grNumber: item.gr_number,
    purchaseOrderId: item.purchase_order_id,
    poNumber: item.po_number,
    supplierName: item.supplier_name,
    receivedDate: item.received_date,
    receivedBy: item.received_by,
    receivedByName: item.received_by_name,
    deliveryNoteNumber: item.delivery_note_number ?? "",
    remarks: item.remarks ?? "",
    postingStatus: item.posting_status,
    receiptStatus: item.receipt_status,
    totalReceived: item.total_received,
    totalRejected: item.total_rejected,
    items: (item.items ?? []).map((line) => ({
      id: line.id,
      poItemId: line.po_item_id,
      itemId: line.item_id,
      productCode: line.product_code,
      productName: line.product_name,
      quantityOrdered: line.quantity_ordered,
      quantityReceived: line.quantity_received,
      quantityRejected: line.quantity_rejected
    })),
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

function mapSupplierInvoiceApi(item: SupplierInvoiceApi): SupplierInvoiceSummary {
  return {
    id: item.id,
    invoiceNumber: item.invoice_number,
    purchaseOrderId: item.purchase_order_id,
    purchaseOrderNumber: item.purchase_order_number,
    supplierName: item.supplier_name,
    supplierBankName: item.supplier_bank_name,
    supplierBankAccount: item.supplier_bank_account,
    invoiceDate: item.invoice_date,
    dueDate: item.due_date,
    subTotal: item.sub_total,
    vatAmount: item.vat_amount,
    grandTotal: item.grand_total,
    matchingStatus: item.matching_status,
    paymentStatus: item.payment_status,
    invoiceFileUrl: item.invoice_file_url,
    goodsReceiptIds: item.goods_receipt_ids ?? [],
    goodsReceiptNumbers: item.goods_receipt_numbers ?? [],
    lines: (item.lines ?? []).map((line) => ({
      id: line.id,
      poItemId: line.po_item_id,
      itemId: line.item_id,
      productCode: line.product_code,
      productName: line.product_name,
      orderedQty: line.ordered_qty,
      receivedQty: line.received_qty,
      rejectedQty: line.rejected_qty,
      invoicedQty: line.invoiced_qty,
      unitPrice: line.unit_price,
      poAmount: line.po_amount,
      invoiceAmount: line.invoice_amount,
      isMismatch: line.is_mismatch,
      goodsReceiptRefs: line.goods_receipt_refs ?? []
    })),
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

function mapSupplierPaymentApi(item: SupplierPaymentApi): SupplierPaymentSummary {
  return {
    id: item.id,
    paymentVoucherNumber: item.payment_voucher_number,
    invoiceId: item.invoice_id,
    invoiceNumber: item.invoice_number,
    supplierName: item.supplier_name,
    paymentDate: item.payment_date,
    paymentMethod: item.payment_method,
    paidAmount: item.paid_amount,
    bankSlipUrl: item.bank_slip_url,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

export async function getDemoToken(profile: "sales" | "admin" | "manager" | "finance" = "sales"): Promise<string> {
  const response = await request<ApiResponse<{ token: string }>>(`/auth/demo-token?profile=${profile}`);
  return response.data.token;
}

export async function login(username: string, password: string): Promise<{ token: string; displayName: string }> {
  const response = await request<ApiResponse<LoginApiResponse>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  const { token, user, role, menu_config } = response.data;
  const permissions = role.backend_profile === "admin" ? fullPermissions() : role.permissions.reduce<PermissionMatrix>(
    (current, permission) => {
      const moduleName = permission.module_name as keyof PermissionMatrix;
      if (moduleName in current) {
        current[moduleName] = {
          create: permission.can_create,
          update: permission.can_update,
          delete: permission.can_delete
        };
      }
      return current;
    },
    defaultPermissions()
  );
  if (typeof window !== "undefined") {
    window.localStorage.setItem(sessionTokenKey, token);
    window.localStorage.setItem(sessionUserKey, user.display_name);
    window.localStorage.setItem(sessionProfileKey, role.backend_profile);
    window.localStorage.setItem(sessionMenuConfigKey, JSON.stringify(menu_config ?? []));
    if (!window.localStorage.getItem(sessionCompanyConfigKey)) {
      window.localStorage.setItem(sessionCompanyConfigKey, JSON.stringify({ companyId: "QMS001" }));
    }
    setCurrentRoleId(user.role_id);
    setSessionPermissions(permissions);
    applyProfilePermissions(role.backend_profile);
  }
  try {
    const themes = await getThemes(token);
    const selectedTheme = themes.find((item) => item.isDefault) ?? themes[0];
    if (selectedTheme) {
      saveSessionTheme(selectedTheme);
    }
  } catch {
    // theme loading should not block login
  }
  return { token, displayName: user.display_name };
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(sessionTokenKey);
}

export function getSessionUser(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(sessionUserKey) ?? "";
}

export function getSessionProfile(): LoginProfile | "" {
  if (typeof window === "undefined") {
    return "";
  }
  const profile = window.localStorage.getItem(sessionProfileKey);
  if (profile === "sales" || profile === "admin" || profile === "manager" || profile === "finance") {
    return profile;
  }
  return "";
}

export function getSessionMenuConfig(): MenuGroupConfigSummary[] {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(sessionMenuConfigKey);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as MenuGroupConfigSummary[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

export async function getMenuConfig(token?: string): Promise<MenuGroupConfigSummary[]> {
  const response = await request<ApiResponse<MenuGroupConfigSummary[]>>("/me/menu-config", {
    method: "GET",
    headers: authHeaders(token)
  });
  if (typeof window !== "undefined") {
    window.localStorage.setItem(sessionMenuConfigKey, JSON.stringify(response.data ?? []));
  }
  return response.data ?? [];
}

export function requireSessionToken(): string {
  const token = getSessionToken();
  if (!token) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Please login first.");
  }
  return token;
}

export function logout() {
  if (typeof window !== "undefined") {
    clearSessionStorage();
    window.location.href = "/login";
  }
}

export async function getCustomers(token?: string): Promise<CustomerSummary[]> {
  const response = await request<ApiResponse<CustomerApi[]>>("/customers", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    ownerUserId: item.owner_user_id ?? "",
    primaryContactId: item.primary_contact_id ?? "",
    primaryContactName: item.primary_contact_name ?? "",
    primaryContactEmail: item.primary_contact_email ?? "",
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? "",
    customerType: item.customer_type === "company" ? "company" : "individual",
    customerName: item.customer_name,
    accountCode: item.account_code,
    billingAddress: item.billing_address ?? "",
    fullName: item.full_name ?? "",
    nationalId: item.national_id ?? "",
    dateOfBirth: item.date_of_birth ?? "",
    phone: item.phone ?? "",
    email: item.email ?? "",
    registeredAddress: item.registered_address ?? "",
    documentDeliveryAddress: item.document_delivery_address ?? "",
    identityDocumentNote: item.identity_document_note ?? "",
    lineId: item.line_id ?? "",
    bankInfo: item.bank_info ?? "",
    companyName: item.company_name ?? "",
    taxId: item.tax_id ?? "",
    branchType: item.branch_type ?? "",
    officePhone: item.office_phone ?? "",
    companyEmail: item.company_email ?? "",
    website: item.website ?? "",
    companyCertificateNote: item.company_certificate_note ?? "",
    vatCertificateNote: item.vat_certificate_note ?? "",
    shareholderListNote: item.shareholder_list_note ?? "",
    powerOfAttorneyNote: item.power_of_attorney_note ?? "",
    authorizedPersonName: item.authorized_person_name ?? "",
    authorizedPersonTitle: item.authorized_person_title ?? "",
    authorizedPersonPhone: item.authorized_person_phone ?? "",
    authorizedPersonEmail: item.authorized_person_email ?? "",
    status: item.status
  }));
}

export async function getAddresses(token?: string): Promise<AddressSummary[]> {
  const response = await request<ApiResponse<AddressApi[]>>("/addresses", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    province: item.province,
    district: item.district,
    subDistrict: item.sub_district,
    zipCode: item.zip_code
  }));
}

export async function getJobListings(token?: string): Promise<JobListingSummary[]> {
  const response = await request<ApiResponse<JobListingApi[]>>("/job-listings", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    jobId: item.job_id,
    jobTitle: item.job_title,
    departmentName: item.department_name,
    roleLevel: item.role_level,
    locationName: item.location_name,
    locationDetail: item.location_detail ?? "",
    workType: item.work_type,
    jobDescription: item.job_description,
    requirementsText: item.requirements_text ?? "",
    requirementsTags: item.requirements_tags ?? [],
    applicationDeadline: item.application_deadline,
    salaryMin: item.salary_min ?? 0,
    salaryMax: item.salary_max ?? 0,
    hideSalaryFromPublic: item.hide_salary_from_public ?? false,
    status: item.status,
    recruitmentEnabled: item.recruitment_enabled ?? true,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by,
    updatedBy: item.updated_by
  }));
}

export async function createJobListing(
  token: string,
  input: {
    jobTitle: string;
    departmentName: string;
    roleLevel: string;
    locationName: string;
    locationDetail?: string;
    workType: string;
    salaryMin: number;
    salaryMax: number;
    hideSalaryFromPublic: boolean;
    jobDescription: string;
    requirementsText: string;
    requirementsTags: string[];
    applicationDeadline: string;
    status: "open" | "pending";
    recruitmentEnabled: boolean;
    publish: boolean;
  }
): Promise<JobListingSummary> {
  const response = await request<ApiResponse<JobListingApi>>("/job-listings", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      job_title: input.jobTitle,
      department_name: input.departmentName,
      role_level: input.roleLevel,
      location_name: input.locationName,
      location_detail: input.locationDetail ?? "",
      work_type: input.workType,
      salary_min: input.salaryMin,
      salary_max: input.salaryMax,
      hide_salary_from_public: input.hideSalaryFromPublic,
      job_description: input.jobDescription,
      requirements_text: input.requirementsText,
      requirements_tags: input.requirementsTags,
      application_deadline: input.applicationDeadline,
      status: input.status,
      recruitment_enabled: input.recruitmentEnabled,
      publish: input.publish
    })
  });
  const item = response.data;
  return {
    id: item.id,
    jobId: item.job_id,
    jobTitle: item.job_title,
    departmentName: item.department_name,
    roleLevel: item.role_level,
    locationName: item.location_name,
    locationDetail: item.location_detail ?? "",
    workType: item.work_type,
    jobDescription: item.job_description,
    requirementsText: item.requirements_text ?? "",
    requirementsTags: item.requirements_tags ?? [],
    applicationDeadline: item.application_deadline,
    salaryMin: item.salary_min ?? 0,
    salaryMax: item.salary_max ?? 0,
    hideSalaryFromPublic: item.hide_salary_from_public ?? false,
    status: item.status,
    recruitmentEnabled: item.recruitment_enabled ?? true,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by,
    updatedBy: item.updated_by
  };
}

export async function getApplicants(token?: string): Promise<ApplicantSummary[]> {
  const response = await request<ApiResponse<ApplicantApi[]>>("/applicants", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    firstName: item.first_name,
    lastName: item.last_name,
    email: item.email,
    phone: item.phone,
    profilePhotoUrl: item.profile_photo_url ?? "",
    currentCompany: item.current_company ?? "",
    currentRole: item.current_role ?? "",
    resumeUrl: item.resume_url,
    portfolioUrl: item.portfolio_url ?? "",
    portfolioUrls: item.portfolio_urls ?? (item.portfolio_url ? [item.portfolio_url] : []),
    source: item.source,
    jobTitle: item.job_title,
    departmentName: item.department_name,
    roleLevel: item.role_level,
    locationName: item.location_name,
    workType: item.work_type,
    status: item.status,
    matchPercentage: item.match_percentage,
    recruiterNotes: item.recruiter_notes ?? "",
    appliedAt: item.applied_at,
    updatedAt: item.updated_at
  }));
}

export async function updateApplicantStatus(
  token: string,
  applicationId: string,
  status: ApplicantSummary["status"],
  recruiterNotes?: string
): Promise<void> {
  await request<ApiResponse<null>>(`/job-applications/${applicationId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({
      status,
      recruiter_notes: recruiterNotes ?? ""
    })
  });
}

export async function createApplicant(
  token: string,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profilePhotoUrl?: string;
    jobId: string;
    currentCompany?: string;
    currentRole?: string;
    source: string;
    resumeUrl: string;
    portfolioUrls: string[];
    matchPercentage?: number;
    status?: ApplicantSummary["status"];
    recruiterNotes?: string;
  }
): Promise<ApplicantSummary> {
  const response = await request<ApiResponse<ApplicantApi>>("/applicants", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      profile_photo_url: input.profilePhotoUrl ?? "",
      job_id: input.jobId,
      current_company: input.currentCompany ?? "",
      current_role: input.currentRole ?? "",
      source: input.source,
      resume_url: input.resumeUrl,
      portfolio_urls: input.portfolioUrls,
      match_percentage: input.matchPercentage ?? 0,
      status: input.status ?? "applied",
      recruiter_notes: input.recruiterNotes ?? ""
    })
  });
  const item = response.data;
  return {
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    firstName: item.first_name,
    lastName: item.last_name,
    email: item.email,
    phone: item.phone,
    profilePhotoUrl: item.profile_photo_url ?? "",
    currentCompany: item.current_company ?? "",
    currentRole: item.current_role ?? "",
    resumeUrl: item.resume_url,
    portfolioUrl: item.portfolio_url ?? "",
    portfolioUrls: item.portfolio_urls ?? (item.portfolio_url ? [item.portfolio_url] : []),
    source: item.source,
    jobTitle: item.job_title,
    departmentName: item.department_name,
    roleLevel: item.role_level,
    locationName: item.location_name,
    workType: item.work_type,
    status: item.status,
    matchPercentage: item.match_percentage,
    recruiterNotes: item.recruiter_notes ?? "",
    appliedAt: item.applied_at,
    updatedAt: item.updated_at
  };
}

export async function getInterviews(token?: string): Promise<InterviewSummary[]> {
  const response = await request<ApiResponse<InterviewApi[]>>("/interviews", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    jobTitle: item.job_title,
    departmentName: item.department_name,
    title: item.title,
    interviewDate: item.interview_date,
    startTime: item.start_time,
    endTime: item.end_time,
    interviewMode: item.interview_mode,
    location: item.location ?? "",
    meetingUrl: item.meeting_url ?? "",
    status: item.status,
    scorecardStatus: item.scorecard_status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    panels: (item.panels ?? []).map((panel) => ({
      id: panel.id,
      interviewId: panel.interview_id,
      interviewerEmail: panel.interviewer_email,
      status: panel.status
    })),
    scorecards: (item.scorecards ?? []).map((scorecard) => ({
      id: scorecard.id,
      interviewId: scorecard.interview_id,
      interviewerEmail: scorecard.interviewer_email,
      rating: scorecard.rating,
      feedbackNotes: scorecard.feedback_notes ?? "",
      recommendation: scorecard.recommendation
    }))
  }));
}

export async function createInterview(
  token: string,
  input: {
    applicationId: string;
    title: string;
    interviewDate: string;
    startTime: string;
    endTime: string;
    interviewMode: InterviewSummary["interviewMode"];
    location?: string;
    meetingUrl?: string;
    status?: InterviewSummary["status"];
    panelEmails: string[];
  }
): Promise<InterviewSummary> {
  const response = await request<ApiResponse<InterviewApi>>("/interviews", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      application_id: input.applicationId,
      title: input.title,
      interview_date: input.interviewDate,
      start_time: input.startTime,
      end_time: input.endTime,
      interview_mode: input.interviewMode,
      location: input.location ?? "",
      meeting_url: input.meetingUrl ?? "",
      status: input.status ?? "scheduled",
      panel_emails: input.panelEmails
    })
  });
  const item = response.data;
  return {
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    jobTitle: item.job_title,
    departmentName: item.department_name,
    title: item.title,
    interviewDate: item.interview_date,
    startTime: item.start_time,
    endTime: item.end_time,
    interviewMode: item.interview_mode,
    location: item.location ?? "",
    meetingUrl: item.meeting_url ?? "",
    status: item.status,
    scorecardStatus: item.scorecard_status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    panels: (item.panels ?? []).map((panel) => ({
      id: panel.id,
      interviewId: panel.interview_id,
      interviewerEmail: panel.interviewer_email,
      status: panel.status
    })),
    scorecards: (item.scorecards ?? []).map((scorecard) => ({
      id: scorecard.id,
      interviewId: scorecard.interview_id,
      interviewerEmail: scorecard.interviewer_email,
      rating: scorecard.rating,
      feedbackNotes: scorecard.feedback_notes ?? "",
      recommendation: scorecard.recommendation
    }))
  };
}

export async function updateInterviewSchedule(
  token: string,
  interviewId: string,
  input: {
    interviewDate: string;
    startTime: string;
    endTime: string;
    status?: InterviewSummary["status"];
  }
): Promise<InterviewSummary> {
  const response = await request<ApiResponse<InterviewApi>>(`/interviews/${interviewId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({
      interview_date: input.interviewDate,
      start_time: input.startTime,
      end_time: input.endTime,
      status: input.status ?? ""
    })
  });
  const item = response.data;
  return {
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    jobTitle: item.job_title,
    departmentName: item.department_name,
    title: item.title,
    interviewDate: item.interview_date,
    startTime: item.start_time,
    endTime: item.end_time,
    interviewMode: item.interview_mode,
    location: item.location ?? "",
    meetingUrl: item.meeting_url ?? "",
    status: item.status,
    scorecardStatus: item.scorecard_status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    panels: (item.panels ?? []).map((panel) => ({
      id: panel.id,
      interviewId: panel.interview_id,
      interviewerEmail: panel.interviewer_email,
      status: panel.status
    })),
    scorecards: (item.scorecards ?? []).map((scorecard) => ({
      id: scorecard.id,
      interviewId: scorecard.interview_id,
      interviewerEmail: scorecard.interviewer_email,
      rating: scorecard.rating,
      feedbackNotes: scorecard.feedback_notes ?? "",
      recommendation: scorecard.recommendation
    }))
  };
}

export async function getAssessments(token?: string): Promise<AssessmentSummary[]> {
  const response = await request<ApiResponse<AssessmentApi[]>>("/assessments", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    testCode: item.test_code ?? "",
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    maxScore: item.max_score ?? 100,
    passingScore: item.passing_score,
    externalTestUrl: item.external_test_url ?? "",
    isActive: item.is_active,
    createdBy: item.created_by ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    usageCount: item.usage_count ?? 0,
    questions: (item.questions ?? []).map((question) => ({
      id: question.id,
      testId: question.test_id,
      questionText: question.question_text,
      questionImageUrl: question.question_image_url ?? "",
      options: (question.options ?? []).map((option) => ({
        optionId: option.option_id,
        text: option.text,
        isCorrect: option.is_correct
      })),
      sortOrder: question.sort_order
    }))
  }));
}

export async function getTests(token?: string): Promise<AssessmentSummary[]> {
  const response = await request<ApiResponse<AssessmentApi[]>>("/tests", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    testCode: item.test_code ?? "",
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    maxScore: item.max_score ?? 100,
    passingScore: item.passing_score,
    externalTestUrl: item.external_test_url ?? "",
    isActive: item.is_active,
    createdBy: item.created_by ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    usageCount: item.usage_count ?? 0,
    questions: (item.questions ?? []).map((question) => ({
      id: question.id,
      testId: question.test_id,
      questionText: question.question_text,
      questionImageUrl: question.question_image_url ?? "",
      options: (question.options ?? []).map((option) => ({
        optionId: option.option_id,
        text: option.text,
        isCorrect: option.is_correct
      })),
      sortOrder: question.sort_order
    }))
  }));
}

export async function createTest(
  token: string,
  input: {
    testCode?: string;
    title: string;
    description: string;
    category: AssessmentSummary["category"];
    durationMinutes: number;
    totalQuestions: number;
    maxScore: number;
    passingScore: number;
    externalTestUrl: string;
    isActive: boolean;
    questions: AssessmentSummary["questions"];
  }
): Promise<AssessmentSummary> {
  const response = await request<ApiResponse<AssessmentApi>>("/tests", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      test_code: input.testCode ?? "",
      title: input.title,
      description: input.description,
      category: input.category,
      duration_minutes: input.durationMinutes,
      total_questions: input.totalQuestions,
      max_score: input.maxScore,
      passing_score: input.passingScore,
      external_test_url: input.externalTestUrl,
      is_active: input.isActive,
      questions: input.questions.map((question) => ({
        id: question.id,
        question_text: question.questionText,
        question_image_url: question.questionImageUrl,
        sort_order: question.sortOrder,
        options: question.options.map((option) => ({
          option_id: option.optionId,
          text: option.text,
          is_correct: option.isCorrect
        }))
      }))
    })
  });
  const item = response.data;
  return {
    id: item.id,
    testCode: item.test_code ?? "",
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    maxScore: item.max_score ?? 100,
    passingScore: item.passing_score,
    externalTestUrl: item.external_test_url ?? "",
    isActive: item.is_active,
    createdBy: item.created_by ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    usageCount: item.usage_count ?? 0,
    questions: (item.questions ?? []).map((question) => ({
      id: question.id,
      testId: question.test_id,
      questionText: question.question_text,
      questionImageUrl: question.question_image_url ?? "",
      options: (question.options ?? []).map((option) => ({
        optionId: option.option_id,
        text: option.text,
        isCorrect: option.is_correct
      })),
      sortOrder: question.sort_order
    }))
  };
}

export async function updateTest(
  token: string,
  id: string,
  input: Parameters<typeof createTest>[1]
): Promise<AssessmentSummary> {
  const response = await request<ApiResponse<AssessmentApi>>(`/tests/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      test_code: input.testCode ?? "",
      title: input.title,
      description: input.description,
      category: input.category,
      duration_minutes: input.durationMinutes,
      total_questions: input.totalQuestions,
      max_score: input.maxScore,
      passing_score: input.passingScore,
      external_test_url: input.externalTestUrl,
      is_active: input.isActive,
      questions: input.questions.map((question) => ({
        id: question.id,
        question_text: question.questionText,
        question_image_url: question.questionImageUrl,
        sort_order: question.sortOrder,
        options: question.options.map((option) => ({
          option_id: option.optionId,
          text: option.text,
          is_correct: option.isCorrect
        }))
      }))
    })
  });
  const item = response.data;
  return {
    id: item.id,
    testCode: item.test_code ?? "",
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    maxScore: item.max_score ?? 100,
    passingScore: item.passing_score,
    externalTestUrl: item.external_test_url ?? "",
    isActive: item.is_active,
    createdBy: item.created_by ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    usageCount: item.usage_count ?? 0,
    questions: (item.questions ?? []).map((question) => ({
      id: question.id,
      testId: question.test_id,
      questionText: question.question_text,
      questionImageUrl: question.question_image_url ?? "",
      options: (question.options ?? []).map((option) => ({
        optionId: option.option_id,
        text: option.text,
        isCorrect: option.is_correct
      })),
      sortOrder: question.sort_order
    }))
  };
}

export async function duplicateTest(token: string, id: string): Promise<AssessmentSummary> {
  const response = await request<ApiResponse<AssessmentApi>>(`/tests/${id}/duplicate`, {
    method: "POST",
    headers: authHeaders(token)
  });
  const item = response.data;
  return {
    id: item.id,
    testCode: item.test_code ?? "",
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    maxScore: item.max_score ?? 100,
    passingScore: item.passing_score,
    externalTestUrl: item.external_test_url ?? "",
    isActive: item.is_active,
    createdBy: item.created_by ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    usageCount: item.usage_count ?? 0,
    questions: (item.questions ?? []).map((question) => ({
      id: question.id,
      testId: question.test_id,
      questionText: question.question_text,
      questionImageUrl: question.question_image_url ?? "",
      options: (question.options ?? []).map((option) => ({
        optionId: option.option_id,
        text: option.text,
        isCorrect: option.is_correct
      })),
      sortOrder: question.sort_order
    }))
  };
}

export async function deleteTest(token: string, id: string): Promise<void> {
  await request<ApiResponse<null>>(`/tests/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export async function bulkUpdateTestsStatus(token: string, ids: string[], isActive: boolean): Promise<AssessmentSummary[]> {
  const response = await request<ApiResponse<AssessmentApi[]>>("/tests/status", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ ids, is_active: isActive })
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    testCode: item.test_code ?? "",
    title: item.title,
    description: item.description ?? "",
    category: item.category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    maxScore: item.max_score ?? 100,
    passingScore: item.passing_score,
    externalTestUrl: item.external_test_url ?? "",
    isActive: item.is_active,
    createdBy: item.created_by ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    usageCount: item.usage_count ?? 0,
    questions: (item.questions ?? []).map((question) => ({
      id: question.id,
      testId: question.test_id,
      questionText: question.question_text,
      questionImageUrl: question.question_image_url ?? "",
      options: (question.options ?? []).map((option) => ({
        optionId: option.option_id,
        text: option.text,
        isCorrect: option.is_correct
      })),
      sortOrder: question.sort_order
    }))
  }));
}

export async function getCandidateAssessments(token?: string): Promise<CandidateAssessmentSummary[]> {
  const response = await request<ApiResponse<CandidateAssessmentApi[]>>("/candidate-assessments", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    applicantPhotoUrl: item.applicant_photo_url ?? "",
    jobTitle: item.job_title,
    departmentName: item.department_name,
    roleLevel: item.role_level,
    assessmentId: item.assessment_id,
    assessmentTitle: item.assessment_title,
    assessmentCategory: item.assessment_category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    passingScore: item.passing_score,
    status: item.status,
    sentAt: item.sent_at,
    completedAt: item.completed_at,
    scoreAchieved: item.score_achieved,
    resultStatus: item.result_status ?? "",
    testLink: item.test_link,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

export async function sendCandidateAssessments(
  token: string,
  assessmentId: string,
  candidateAssessmentIds: string[]
): Promise<CandidateAssessmentSummary[]> {
  const response = await request<ApiResponse<CandidateAssessmentApi[]>>("/candidate-assessments/send", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      assessment_id: assessmentId,
      candidate_assessment_ids: candidateAssessmentIds
    })
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    applicantPhotoUrl: item.applicant_photo_url ?? "",
    jobTitle: item.job_title,
    departmentName: item.department_name,
    roleLevel: item.role_level,
    assessmentId: item.assessment_id,
    assessmentTitle: item.assessment_title,
    assessmentCategory: item.assessment_category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    passingScore: item.passing_score,
    status: item.status,
    sentAt: item.sent_at,
    completedAt: item.completed_at,
    scoreAchieved: item.score_achieved,
    resultStatus: item.result_status ?? "",
    testLink: item.test_link,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

export async function resendCandidateAssessment(token: string, id: string): Promise<CandidateAssessmentSummary> {
  const response = await request<ApiResponse<CandidateAssessmentApi>>(`/candidate-assessments/${id}/resend`, {
    method: "PATCH",
    headers: authHeaders(token)
  });
  const item = response.data;
  return {
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    applicantPhotoUrl: item.applicant_photo_url ?? "",
    jobTitle: item.job_title,
    departmentName: item.department_name,
    roleLevel: item.role_level,
    assessmentId: item.assessment_id,
    assessmentTitle: item.assessment_title,
    assessmentCategory: item.assessment_category,
    totalQuestions: item.total_questions,
    durationMinutes: item.duration_minutes,
    passingScore: item.passing_score,
    status: item.status,
    sentAt: item.sent_at,
    completedAt: item.completed_at,
    scoreAchieved: item.score_achieved,
    resultStatus: item.result_status ?? "",
    testLink: item.test_link,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

export async function getOffers(token?: string): Promise<OfferSummary[]> {
  const response = await request<ApiResponse<OfferApi[]>>("/offers", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    applicantPhoto: item.applicant_photo ?? "",
    jobTitle: item.job_title,
    departmentName: item.department_name,
    salary: item.salary,
    signOnBonus: item.sign_on_bonus,
    benefitsPackage: item.benefits_package ?? [],
    offerLetterUrl: item.offer_letter_url,
    sentAt: item.sent_at,
    expiryDate: item.expiry_date,
    status: item.status,
    declineReason: item.decline_reason ?? "",
    startDate: item.start_date ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    offerApprovals: (item.offer_approvals ?? []).map((approval) => ({
      id: approval.id,
      offerId: approval.offer_id,
      approverEmail: approval.approver_email,
      approvalStatus: approval.approval_status,
      comment: approval.comment ?? ""
    }))
  }));
}

export async function createOffer(
  token: string,
  input: {
    applicationId: string;
    salary: number;
    signOnBonus: number;
    benefitsPackage: string[];
    offerLetterUrl: string;
    expiryDate: string;
    status: OfferSummary["status"];
    declineReason?: string;
    startDate?: string;
  }
): Promise<OfferSummary> {
  const response = await request<ApiResponse<OfferApi>>("/offers", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      application_id: input.applicationId,
      salary: input.salary,
      sign_on_bonus: input.signOnBonus,
      benefits_package: input.benefitsPackage,
      offer_letter_url: input.offerLetterUrl,
      expiry_date: input.expiryDate,
      status: input.status,
      decline_reason: input.declineReason ?? "",
      start_date: input.startDate ?? ""
    })
  });
  const item = response.data;
  return {
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    applicantPhoto: item.applicant_photo ?? "",
    jobTitle: item.job_title,
    departmentName: item.department_name,
    salary: item.salary,
    signOnBonus: item.sign_on_bonus,
    benefitsPackage: item.benefits_package ?? [],
    offerLetterUrl: item.offer_letter_url,
    sentAt: item.sent_at,
    expiryDate: item.expiry_date,
    status: item.status,
    declineReason: item.decline_reason ?? "",
    startDate: item.start_date ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    offerApprovals: (item.offer_approvals ?? []).map((approval) => ({
      id: approval.id,
      offerId: approval.offer_id,
      approverEmail: approval.approver_email,
      approvalStatus: approval.approval_status,
      comment: approval.comment ?? ""
    }))
  };
}

export async function resendOffer(token: string, id: string): Promise<OfferSummary> {
  const response = await request<ApiResponse<OfferApi>>(`/offers/${id}/resend`, {
    method: "PATCH",
    headers: authHeaders(token)
  });
  const item = response.data;
  return {
    id: item.id,
    applicationId: item.application_id,
    applicantId: item.applicant_id,
    jobId: item.job_id,
    applicantName: item.applicant_name,
    applicantPhoto: item.applicant_photo ?? "",
    jobTitle: item.job_title,
    departmentName: item.department_name,
    salary: item.salary,
    signOnBonus: item.sign_on_bonus,
    benefitsPackage: item.benefits_package ?? [],
    offerLetterUrl: item.offer_letter_url,
    sentAt: item.sent_at,
    expiryDate: item.expiry_date,
    status: item.status,
    declineReason: item.decline_reason ?? "",
    startDate: item.start_date ?? "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    offerApprovals: (item.offer_approvals ?? []).map((approval) => ({
      id: approval.id,
      offerId: approval.offer_id,
      approverEmail: approval.approver_email,
      approvalStatus: approval.approval_status,
      comment: approval.comment ?? ""
    }))
  };
}

export async function createCustomer(
  token: string,
  input: {
    customerName: string;
    accountCode: string;
    billingAddress?: string;
    customerType: "individual" | "company";
    registeredAddress?: string;
    documentDeliveryAddress?: string;
    profile: CustomerProfile;
  }
): Promise<CustomerSummary> {
  const individual = input.profile.customerType === "individual" ? input.profile : null;
  const company = input.profile.customerType === "company" ? input.profile : null;
  const response = await request<ApiResponse<CustomerApi>>("/customers", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      customer_type: input.customerType,
      customer_name: input.customerName,
      account_code: input.accountCode,
      billing_address: input.billingAddress ?? "",
      full_name: individual?.fullName ?? "",
      national_id: individual?.nationalId ?? "",
      date_of_birth: individual?.dateOfBirth ?? "",
      phone: individual?.phone ?? "",
      email: individual?.email ?? company?.companyEmail ?? "",
      registered_address: input.registeredAddress ?? individual?.registeredAddress ?? "",
      document_delivery_address: input.documentDeliveryAddress ?? individual?.documentDeliveryAddress ?? "",
      identity_document_note: individual?.identityDocumentNote ?? "",
      line_id: individual?.lineId ?? "",
      bank_info: individual?.bankInfo ?? "",
      company_name: company?.companyName ?? "",
      tax_id: company?.taxId ?? "",
      branch_type: company?.branchType ?? "",
      office_phone: company?.officePhone ?? "",
      company_email: company?.companyEmail ?? "",
      website: company?.website ?? "",
      company_certificate_note: company?.companyCertificateNote ?? "",
      vat_certificate_note: company?.vatCertificateNote ?? "",
      shareholder_list_note: company?.shareholderListNote ?? "",
      power_of_attorney_note: company?.powerOfAttorneyNote ?? "",
      authorized_person_name: company?.authorizedPersonName ?? "",
      authorized_person_title: company?.authorizedPersonTitle ?? "",
      authorized_person_phone: company?.authorizedPersonPhone ?? "",
      authorized_person_email: company?.authorizedPersonEmail ?? ""
    })
  });
  const item = response.data;
  return {
    id: item.id,
    ownerUserId: item.owner_user_id ?? "",
    primaryContactId: item.primary_contact_id ?? "",
    primaryContactName: item.primary_contact_name ?? "",
    primaryContactEmail: item.primary_contact_email ?? "",
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? "",
    customerType: item.customer_type === "company" ? "company" : "individual",
    customerName: item.customer_name,
    accountCode: item.account_code,
    billingAddress: item.billing_address ?? "",
    fullName: item.full_name ?? "",
    nationalId: item.national_id ?? "",
    dateOfBirth: item.date_of_birth ?? "",
    phone: item.phone ?? "",
    email: item.email ?? "",
    registeredAddress: item.registered_address ?? "",
    documentDeliveryAddress: item.document_delivery_address ?? "",
    identityDocumentNote: item.identity_document_note ?? "",
    lineId: item.line_id ?? "",
    bankInfo: item.bank_info ?? "",
    companyName: item.company_name ?? "",
    taxId: item.tax_id ?? "",
    branchType: item.branch_type ?? "",
    officePhone: item.office_phone ?? "",
    companyEmail: item.company_email ?? "",
    website: item.website ?? "",
    companyCertificateNote: item.company_certificate_note ?? "",
    vatCertificateNote: item.vat_certificate_note ?? "",
    shareholderListNote: item.shareholder_list_note ?? "",
    powerOfAttorneyNote: item.power_of_attorney_note ?? "",
    authorizedPersonName: item.authorized_person_name ?? "",
    authorizedPersonTitle: item.authorized_person_title ?? "",
    authorizedPersonPhone: item.authorized_person_phone ?? "",
    authorizedPersonEmail: item.authorized_person_email ?? "",
    status: item.status
  };
}

export async function updateCustomer(
  token: string,
  id: string,
  input: {
    customerName: string;
    accountCode: string;
    billingAddress?: string;
    customerType: "individual" | "company";
    registeredAddress?: string;
    documentDeliveryAddress?: string;
    profile: CustomerProfile;
  }
): Promise<CustomerSummary> {
  const individual = input.profile.customerType === "individual" ? input.profile : null;
  const company = input.profile.customerType === "company" ? input.profile : null;
  const response = await request<ApiResponse<CustomerApi>>(`/customers/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      customer_type: input.customerType,
      customer_name: input.customerName,
      account_code: input.accountCode,
      billing_address: input.billingAddress ?? "",
      full_name: individual?.fullName ?? "",
      national_id: individual?.nationalId ?? "",
      date_of_birth: individual?.dateOfBirth ?? "",
      phone: individual?.phone ?? "",
      email: individual?.email ?? company?.companyEmail ?? "",
      registered_address: input.registeredAddress ?? individual?.registeredAddress ?? "",
      document_delivery_address: input.documentDeliveryAddress ?? individual?.documentDeliveryAddress ?? "",
      identity_document_note: individual?.identityDocumentNote ?? "",
      line_id: individual?.lineId ?? "",
      bank_info: individual?.bankInfo ?? "",
      company_name: company?.companyName ?? "",
      tax_id: company?.taxId ?? "",
      branch_type: company?.branchType ?? "",
      office_phone: company?.officePhone ?? "",
      company_email: company?.companyEmail ?? "",
      website: company?.website ?? "",
      company_certificate_note: company?.companyCertificateNote ?? "",
      vat_certificate_note: company?.vatCertificateNote ?? "",
      shareholder_list_note: company?.shareholderListNote ?? "",
      power_of_attorney_note: company?.powerOfAttorneyNote ?? "",
      authorized_person_name: company?.authorizedPersonName ?? "",
      authorized_person_title: company?.authorizedPersonTitle ?? "",
      authorized_person_phone: company?.authorizedPersonPhone ?? "",
      authorized_person_email: company?.authorizedPersonEmail ?? ""
    })
  });
  const item = response.data;
  return {
    id: item.id,
    ownerUserId: item.owner_user_id ?? "",
    primaryContactId: item.primary_contact_id ?? "",
    primaryContactName: item.primary_contact_name ?? "",
    primaryContactEmail: item.primary_contact_email ?? "",
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? "",
    customerType: item.customer_type === "company" ? "company" : "individual",
    customerName: item.customer_name,
    accountCode: item.account_code,
    billingAddress: item.billing_address ?? "",
    fullName: item.full_name ?? "",
    nationalId: item.national_id ?? "",
    dateOfBirth: item.date_of_birth ?? "",
    phone: item.phone ?? "",
    email: item.email ?? "",
    registeredAddress: item.registered_address ?? "",
    documentDeliveryAddress: item.document_delivery_address ?? "",
    identityDocumentNote: item.identity_document_note ?? "",
    lineId: item.line_id ?? "",
    bankInfo: item.bank_info ?? "",
    companyName: item.company_name ?? "",
    taxId: item.tax_id ?? "",
    branchType: item.branch_type ?? "",
    officePhone: item.office_phone ?? "",
    companyEmail: item.company_email ?? "",
    website: item.website ?? "",
    companyCertificateNote: item.company_certificate_note ?? "",
    vatCertificateNote: item.vat_certificate_note ?? "",
    shareholderListNote: item.shareholder_list_note ?? "",
    powerOfAttorneyNote: item.power_of_attorney_note ?? "",
    authorizedPersonName: item.authorized_person_name ?? "",
    authorizedPersonTitle: item.authorized_person_title ?? "",
    authorizedPersonPhone: item.authorized_person_phone ?? "",
    authorizedPersonEmail: item.authorized_person_email ?? "",
    status: item.status ?? "active"
  };
}

function mapLoyaltyTier(item: LoyaltyTierApi): LoyaltyTierSummary {
  return {
    id: item.id,
    loyaltyName: item.loyalty_name,
    minSpend: item.min_spend,
    benefit: item.benefit,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

function mapLoyaltyTierMember(item: LoyaltyTierMemberApi) {
  return {
    id: item.id,
    tierId: item.tier_id,
    customerId: item.customer_id,
    customerName: item.customer_name,
    customerPhone: item.customer_phone,
    createdAt: item.created_at
  };
}

function mapLoyaltyTierBenefit(item: LoyaltyTierBenefitApi) {
  return {
    id: item.id,
    tierId: item.tier_id,
    benefitType: item.benefit_type,
    refId: item.ref_id,
    benefitName: item.benefit_name,
    createdAt: item.created_at
  };
}

export async function getLoyaltyTiers(token?: string): Promise<LoyaltyTierSummary[]> {
  const response = await request<ApiResponse<LoyaltyTierApi[]>>("/loyalty/tiers", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapLoyaltyTier);
}

export async function getLoyaltyTier(token: string, id: string): Promise<LoyaltyTierDetailSummary> {
  const response = await request<ApiResponse<LoyaltyTierDetailApi>>(`/loyalty/tiers/${id}`, {
    headers: authHeaders(token)
  });
  return {
    tier: mapLoyaltyTier(response.data.tier),
    members: (response.data.members ?? []).map(mapLoyaltyTierMember),
    benefits: (response.data.benefits ?? []).map(mapLoyaltyTierBenefit)
  };
}

export async function createLoyaltyTier(token: string, payload: { loyaltyName: string; minSpend: number; benefit: string }): Promise<LoyaltyTierSummary> {
  const response = await request<ApiResponse<LoyaltyTierApi>>("/loyalty/tiers", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ loyalty_name: payload.loyaltyName, min_spend: payload.minSpend, benefit: payload.benefit })
  });
  return mapLoyaltyTier(response.data);
}

export async function updateLoyaltyTier(token: string, id: string, payload: { loyaltyName: string; minSpend: number; benefit: string }): Promise<LoyaltyTierSummary> {
  const response = await request<ApiResponse<LoyaltyTierApi>>(`/loyalty/tiers/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ loyalty_name: payload.loyaltyName, min_spend: payload.minSpend, benefit: payload.benefit })
  });
  return mapLoyaltyTier(response.data);
}

export async function deleteLoyaltyTier(token: string, id: string): Promise<void> {
  await request<ApiResponse<null>>(`/loyalty/tiers/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export async function addCustomerToLoyaltyTier(token: string, id: string, customerId: string) {
  const response = await request<ApiResponse<LoyaltyTierMemberApi>>(`/loyalty/tiers/${id}/members`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ customer_id: customerId })
  });
  return mapLoyaltyTierMember(response.data);
}

export async function addBenefitToLoyaltyTier(token: string, id: string, payload: { benefitType: string; refId: string; benefitName: string }) {
  const response = await request<ApiResponse<LoyaltyTierBenefitApi>>(`/loyalty/tiers/${id}/benefits`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ benefit_type: payload.benefitType, ref_id: payload.refId, benefit_name: payload.benefitName })
  });
  return mapLoyaltyTierBenefit(response.data);
}

function mapLoyaltyReward(item: LoyaltyRewardApi): LoyaltyRewardSummary {
  return {
    id: item.id,
    rewardName: item.reward_name,
    rewardType: item.reward_type,
    productId: item.product_id,
    productName: item.product_name,
    loyaltyTierId: item.loyalty_tier_id,
    loyaltyTier: item.loyalty_tier,
    usePoint: item.use_point,
    stock: item.stock,
    ownerCount: item.owner_count,
    costPer: item.cost_per,
    expiry: item.expiry,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

export async function getLoyaltyRewards(token?: string): Promise<LoyaltyRewardSummary[]> {
  const response = await request<ApiResponse<LoyaltyRewardApi[]>>("/loyalty/rewards", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapLoyaltyReward);
}

export async function createLoyaltyReward(token: string, payload: { rewardName: string; rewardType: string; productId?: string; loyaltyTierId: string; usePoint: number; stock: number; ownerCount: number; costPer: number; expiry: string }) {
  const response = await request<ApiResponse<LoyaltyRewardApi>>("/loyalty/rewards", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      reward_name: payload.rewardName,
      reward_type: payload.rewardType,
      product_id: payload.productId ?? "",
      loyalty_tier_id: payload.loyaltyTierId,
      use_point: payload.usePoint,
      stock: payload.stock,
      owner_count: payload.ownerCount,
      cost_per: payload.costPer,
      expiry: payload.expiry
    })
  });
  return mapLoyaltyReward(response.data);
}

export async function deleteLoyaltyReward(token: string, id: string): Promise<void> {
  await request<ApiResponse<null>>(`/loyalty/rewards/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

function mapLoyaltyCoupon(item: LoyaltyCouponApi): LoyaltyCouponSummary {
  return {
    id: item.id,
    couponCode: item.coupon_code,
    couponName: item.coupon_name,
    couponType: item.coupon_type,
    loyaltyTierId: item.loyalty_tier_id,
    loyaltyTier: item.loyalty_tier,
    stock: item.stock,
    ownerCount: item.owner_count,
    valueLabel: item.value_label,
    expiry: item.expiry,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

export async function getLoyaltyCoupons(token?: string): Promise<LoyaltyCouponSummary[]> {
  const response = await request<ApiResponse<LoyaltyCouponApi[]>>("/loyalty/coupons", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapLoyaltyCoupon);
}

export async function createLoyaltyCoupon(token: string, payload: { couponCode: string; couponName: string; couponType: string; loyaltyTierId: string; stock: number; ownerCount: number; valueLabel: string; expiry: string }) {
  const response = await request<ApiResponse<LoyaltyCouponApi>>("/loyalty/coupons", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      coupon_code: payload.couponCode,
      coupon_name: payload.couponName,
      coupon_type: payload.couponType,
      loyalty_tier_id: payload.loyaltyTierId,
      stock: payload.stock,
      owner_count: payload.ownerCount,
      value_label: payload.valueLabel,
      expiry: payload.expiry
    })
  });
  return mapLoyaltyCoupon(response.data);
}

export async function deleteLoyaltyCoupon(token: string, id: string): Promise<void> {
  await request<ApiResponse<null>>(`/loyalty/coupons/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

function mapLoyaltyEarningRule(item: LoyaltyEarningRuleApi): LoyaltyEarningRuleSummary {
  return {
    id: item.id,
    ruleName: item.rule_name,
    loyaltyTierId: item.loyalty_tier_id,
    loyaltyTier: item.loyalty_tier,
    triggerRule: item.trigger_rule,
    rewardLogic: item.reward_logic,
    ownerCount: item.owner_count,
    expiry: item.expiry,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}

export async function getLoyaltyEarningRules(token?: string): Promise<LoyaltyEarningRuleSummary[]> {
  const response = await request<ApiResponse<LoyaltyEarningRuleApi[]>>("/loyalty/earning-rules", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapLoyaltyEarningRule);
}

export async function createLoyaltyEarningRule(token: string, payload: { ruleName: string; loyaltyTierId: string; triggerRule: string; rewardLogic: string; ownerCount: number; expiry: string }) {
  const response = await request<ApiResponse<LoyaltyEarningRuleApi>>("/loyalty/earning-rules", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      rule_name: payload.ruleName,
      loyalty_tier_id: payload.loyaltyTierId,
      trigger_rule: payload.triggerRule,
      reward_logic: payload.rewardLogic,
      owner_count: payload.ownerCount,
      expiry: payload.expiry
    })
  });
  return mapLoyaltyEarningRule(response.data);
}

export async function deleteLoyaltyEarningRule(token: string, id: string): Promise<void> {
  await request<ApiResponse<null>>(`/loyalty/earning-rules/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

function mapMemberBenefit(item: MemberBenefitApi): MemberBenefitSummary {
  return {
    id: item.id,
    customerId: item.customer_id,
    name: item.name,
    code: item.code,
    benefitType: item.benefit_type,
    sourceRefId: item.source_ref_id,
    amount: item.amount,
    createdAt: item.created_at,
    expiresAt: item.expires_at,
    updatedAt: item.updated_at
  };
}

export async function getMemberBenefits(token: string, customerId: string): Promise<MemberBenefitSummary[]> {
  const response = await request<ApiResponse<MemberBenefitApi[]>>(`/member-benefits/${customerId}`, {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapMemberBenefit);
}

export async function getMemberPointBalances(token: string): Promise<MemberPointBalanceSummary[]> {
  const response = await request<ApiResponse<MemberPointBalanceApi[]>>("/member-benefits/points-balances", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    customerId: item.customer_id,
    currentPoints: item.current_points,
    earnedPoints: item.earned_points,
    spentPoints: item.spent_points
  }));
}

export async function redeemMemberBenefit(token: string, customerId: string, payload: { benefitId: string; saleOrderNo?: string; posTransactionNumber?: string }): Promise<CouponTransactionSummary> {
  const response = await request<ApiResponse<CouponTransactionApi>>(`/member-benefits/${customerId}/redeem`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      benefit_id: payload.benefitId,
      sale_order_no: payload.saleOrderNo ?? "",
      pos_transaction_number: payload.posTransactionNumber ?? ""
    })
  });
  return {
    id: response.data.id,
    customerId: response.data.customer_id,
    memberBenefitId: response.data.member_benefit_id,
    couponCode: response.data.coupon_code,
    couponName: response.data.coupon_name,
    benefitType: response.data.benefit_type,
    valueAmount: response.data.value_amount,
    saleOrderNo: response.data.sale_order_no,
    posTransactionNumber: response.data.pos_transaction_number,
    status: response.data.status,
    redeemedAt: response.data.redeemed_at,
    expiresAt: response.data.expires_at,
    createdAt: response.data.created_at,
    updatedAt: response.data.updated_at
  };
}

export async function grantMemberBenefit(token: string, customerId: string, payload: { benefitType: string; refId: string }): Promise<MemberBenefitSummary> {
  const response = await request<ApiResponse<MemberBenefitApi>>(`/member-benefits/${customerId}/grant`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      benefit_type: payload.benefitType,
      ref_id: payload.refId
    })
  });
  return mapMemberBenefit(response.data);
}

export async function getProducts(token?: string): Promise<ProductSummary[]> {
  const response = await request<ApiResponse<ProductApi[]>>("/products", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    productCode: item.product_code,
    productName: item.product_name,
    barcode: item.barcode ?? "",
    description: item.description ?? "",
    imageDataUrl: item.image_data_url ?? "",
    categoryId: item.category_id ?? "",
    categoryName: item.category_name ?? "ไม่จัดหมวดหมู่ (Uncategorized)",
    materialId: item.material_id ?? "",
    materialName: item.material_name ?? "ไม่ระบุวัสดุ (Not specified)",
    colorId: item.color_id ?? "",
    colorName: item.color_name ?? "ไม่ระบุสี (Not specified)",
    features: item.features ?? [],
    width: item.width ?? 0,
    length: item.length ?? 0,
    height: item.height ?? 0,
    active: item.active,
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? ""
  }));
}

export async function getHREmployees(token?: string): Promise<HREmployeeDirectorySummary[]> {
  const response = await request<ApiResponse<HREmployeeApi[]>>("/hr/employees", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    employeeCode: item.employee_code,
    firstName: item.first_name,
    lastName: item.last_name,
    department: item.department ?? "",
    positionTitle: item.position_title ?? ""
  }));
}

export async function getPurchaseOrders(token?: string): Promise<PurchaseOrderSummary[]> {
  const response = await request<ApiResponse<PurchaseOrderLookupApi[]>>("/purchase-orders", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapPurchaseOrderApi);
}

export async function getGoodsReceipts(token?: string): Promise<GoodsReceiptSummary[]> {
  const response = await request<ApiResponse<GoodsReceiptApi[]>>("/goods-receipts", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapGoodsReceiptApi);
}

export async function getSupplierInvoices(token?: string): Promise<SupplierInvoiceSummary[]> {
  const response = await request<ApiResponse<SupplierInvoiceApi[]>>("/invoicing-payments/invoices", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapSupplierInvoiceApi);
}

export async function approveSupplierInvoiceMatch(token: string, invoiceId: string): Promise<SupplierInvoiceSummary> {
  const response = await request<ApiResponse<SupplierInvoiceApi>>(`/invoicing-payments/invoices/${invoiceId}/match`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ matching_status: "matched" })
  });
  return mapSupplierInvoiceApi(response.data);
}

export async function getSupplierPayments(token?: string): Promise<SupplierPaymentSummary[]> {
  const response = await request<ApiResponse<SupplierPaymentApi[]>>("/invoicing-payments/payments", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapSupplierPaymentApi);
}

export async function createSupplierPayment(
  token: string,
  input: {
    invoiceId: string;
    paymentDate: string;
    paymentMethod: "Bank_Transfer" | "Cheque" | "Cash";
    paidAmount: number;
    bankSlipUrl: string;
  }
): Promise<SupplierPaymentSummary> {
  const response = await request<ApiResponse<SupplierPaymentApi>>("/invoicing-payments/payments", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      invoice_id: input.invoiceId,
      payment_date: input.paymentDate,
      payment_method: input.paymentMethod,
      paid_amount: input.paidAmount,
      bank_slip_url: input.bankSlipUrl
    })
  });
  return mapSupplierPaymentApi(response.data);
}

export async function pullPurchaseOrderForGoodsReceipt(token: string, poNumber: string): Promise<PurchaseOrderSummary> {
  const response = await request<ApiResponse<PurchaseOrderLookupApi>>("/goods-receipts/pull-po", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ po_number: poNumber })
  });
  return mapPurchaseOrderApi(response.data);
}

export async function createGoodsReceipt(
  token: string,
  input: {
    poNumber: string;
    receivedDate: string;
    receivedBy: string;
    deliveryNoteNumber: string;
    remarks: string;
    postingStatus: "draft" | "posted";
    items: Array<{
      poItemId: string;
      itemId: string;
      quantityReceived: number;
      quantityRejected: number;
    }>;
  }
): Promise<GoodsReceiptSummary> {
  const response = await request<ApiResponse<GoodsReceiptApi>>("/goods-receipts", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      po_number: input.poNumber,
      received_date: input.receivedDate,
      received_by: input.receivedBy,
      delivery_note_number: input.deliveryNoteNumber,
      remarks: input.remarks,
      posting_status: input.postingStatus,
      items: input.items.map((item) => ({
        po_item_id: item.poItemId,
        item_id: item.itemId,
        quantity_received: item.quantityReceived,
        quantity_rejected: item.quantityRejected
      }))
    })
  });
  return mapGoodsReceiptApi(response.data);
}

export async function createProduct(
  token: string,
  input: {
    productName: string;
    productCode: string;
    barcode?: string;
    description?: string;
    imageDataUrl?: string;
    categoryId?: string;
    categoryName?: string;
    materialId?: string;
    materialName?: string;
    colorId?: string;
    colorName?: string;
    features?: string[];
    width?: number;
    length?: number;
    height?: number;
  }
): Promise<ProductSummary> {
  const response = await request<ApiResponse<ProductApi>>("/products", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      product_name: input.productName,
      product_code: input.productCode,
      barcode: input.barcode ?? "",
      description: input.description ?? "",
      image_data_url: input.imageDataUrl ?? "",
      category_id: input.categoryId ?? "",
      category_name: input.categoryName ?? "",
      material_id: input.materialId ?? "",
      material_name: input.materialName ?? "",
      color_id: input.colorId ?? "",
      color_name: input.colorName ?? "",
      features: input.features ?? [],
      width: input.width ?? 0,
      length: input.length ?? 0,
      height: input.height ?? 0,
      active: true
    })
  });
  const item = response.data;
  return {
    id: item.id,
    productCode: item.product_code,
    productName: item.product_name,
    barcode: item.barcode ?? "",
    description: item.description ?? "",
    imageDataUrl: item.image_data_url ?? "",
    categoryId: item.category_id ?? "",
    categoryName: item.category_name ?? "ไม่จัดหมวดหมู่ (Uncategorized)",
    materialId: item.material_id ?? "",
    materialName: item.material_name ?? "ไม่ระบุวัสดุ (Not specified)",
    colorId: item.color_id ?? "",
    colorName: item.color_name ?? "ไม่ระบุสี (Not specified)",
    features: item.features ?? [],
    width: item.width ?? 0,
    length: item.length ?? 0,
    height: item.height ?? 0,
    active: item.active,
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? ""
  };
}

export async function updateProduct(
  token: string,
  id: string,
  input: {
    productName: string;
    productCode: string;
    barcode?: string;
    description?: string;
    imageDataUrl?: string;
    categoryId?: string;
    categoryName?: string;
    materialId?: string;
    materialName?: string;
    colorId?: string;
    colorName?: string;
    features?: string[];
    width?: number;
    length?: number;
    height?: number;
    active?: boolean;
  }
): Promise<ProductSummary> {
  const response = await request<ApiResponse<ProductApi>>(`/products/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      product_name: input.productName,
      product_code: input.productCode,
      barcode: input.barcode ?? "",
      description: input.description ?? "",
      image_data_url: input.imageDataUrl ?? "",
      category_id: input.categoryId ?? "",
      category_name: input.categoryName ?? "",
      material_id: input.materialId ?? "",
      material_name: input.materialName ?? "",
      color_id: input.colorId ?? "",
      color_name: input.colorName ?? "",
      features: input.features ?? [],
      width: input.width ?? 0,
      length: input.length ?? 0,
      height: input.height ?? 0,
      active: input.active ?? true
    })
  });
  const item = response.data;
  return {
    id: item.id,
    productCode: item.product_code,
    productName: item.product_name,
    barcode: item.barcode ?? "",
    description: item.description ?? "",
    imageDataUrl: item.image_data_url ?? "",
    categoryId: item.category_id ?? "",
    categoryName: item.category_name ?? "ไม่จัดหมวดหมู่ (Uncategorized)",
    materialId: item.material_id ?? "",
    materialName: item.material_name ?? "ไม่ระบุวัสดุ (Not specified)",
    colorId: item.color_id ?? "",
    colorName: item.color_name ?? "ไม่ระบุสี (Not specified)",
    features: item.features ?? [],
    width: item.width ?? 0,
    length: item.length ?? 0,
    height: item.height ?? 0,
    active: item.active,
    createdAt: item.created_at ?? "",
    updatedAt: item.updated_at ?? ""
  };
}

export async function getPOSCatalog(token: string): Promise<POSCatalogItemSummary[]> {
  const response = await request<ApiResponse<POSCatalogItemApi[]>>("/pos/catalog", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    productId: item.product_id,
    productCode: item.product_code,
    productName: item.product_name,
    barcode: item.barcode,
    categoryName: item.category_name,
    basicPrice: item.basic_price,
    taxRate: item.tax_rate,
    active: item.active
  }));
}

export async function getPOSTransactions(token: string): Promise<POSTransactionSummary[]> {
  const response = await request<ApiResponse<POSTransactionApi[]>>("/pos/transactions", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    transactionNumber: item.transaction_number,
    customerId: item.customer_id,
    customerName: item.customer_name,
    cashierId: item.cashier_id,
    cashierName: item.cashier_name,
    paymentMethodId: item.payment_method_id,
    paymentMethodName: item.payment_method_name,
    subtotal: item.subtotal,
    discount: item.discount,
    vatRate: item.vat_rate,
    vat: item.vat,
    grandTotal: item.grand_total,
    amountReceived: item.amount_received,
    amountChanged: item.amount_changed,
    generatedQuotationId: item.generated_quotation_id,
    generatedQuotationNo: item.generated_quotation_no,
    generatedSaleOrderId: item.generated_sale_order_id,
    generatedSaleOrderNo: item.generated_sale_order_no,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    voidedAt: item.voided_at,
    voidedBy: item.voided_by,
    voidReason: item.void_reason,
    items: (item.items ?? []).map((line) => ({
      id: line.id,
      productId: line.product_id,
      itemName: line.item_name,
      productCode: line.product_code,
      barcode: line.barcode,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      taxRate: line.tax_rate,
      lineSubtotal: line.line_subtotal,
      lineDiscount: line.line_discount,
      lineVAT: line.line_vat,
      totalPrice: line.total_price
    }))
  }));
}

export async function createPOSTransaction(
  token: string,
  input: {
    customerId?: string;
    customerPhone?: string;
    paymentMethodId: string;
    discountAmount?: number;
    amountReceived: number;
    lines: Array<{ productId: string; quantity: number; unitPriceOverride?: number; isReward?: boolean }>;
  }
): Promise<POSTransactionSummary> {
  const response = await request<ApiResponse<POSTransactionApi>>("/pos/transactions", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      customer_id: input.customerId ?? "",
      customer_phone: input.customerPhone ?? "",
      payment_method_id: input.paymentMethodId,
      terminal_id: "POS-BKK-01",
      discount_amount: input.discountAmount ?? 0,
      amount_received: input.amountReceived,
      lines: input.lines.map((line) => ({
        product_id: line.productId,
        quantity: line.quantity,
        unit_price_override: line.unitPriceOverride ?? -1,
        is_reward: line.isReward ?? false
      }))
    })
  });
  const item = response.data;
  return {
    id: item.id,
    transactionNumber: item.transaction_number,
    customerId: item.customer_id,
    customerName: item.customer_name,
    cashierId: item.cashier_id,
    cashierName: item.cashier_name,
    paymentMethodId: item.payment_method_id,
    paymentMethodName: item.payment_method_name,
    subtotal: item.subtotal,
    discount: item.discount,
    vatRate: item.vat_rate,
    vat: item.vat,
    grandTotal: item.grand_total,
    amountReceived: item.amount_received,
    amountChanged: item.amount_changed,
    generatedQuotationId: item.generated_quotation_id,
    generatedQuotationNo: item.generated_quotation_no,
    generatedSaleOrderId: item.generated_sale_order_id,
    generatedSaleOrderNo: item.generated_sale_order_no,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    voidedAt: item.voided_at,
    voidedBy: item.voided_by,
    voidReason: item.void_reason,
    items: (item.items ?? []).map((line) => ({
      id: line.id,
      productId: line.product_id,
      itemName: line.item_name,
      productCode: line.product_code,
      barcode: line.barcode,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      taxRate: line.tax_rate,
      lineSubtotal: line.line_subtotal,
      lineDiscount: line.line_discount,
      lineVAT: line.line_vat,
      totalPrice: line.total_price
    }))
  };
}

export async function voidPOSTransaction(token: string, id: string, reason: string): Promise<POSTransactionSummary> {
  const response = await request<ApiResponse<POSTransactionApi>>(`/pos/transactions/${id}/void`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ reason })
  });
  const item = response.data;
  return {
    id: item.id,
    transactionNumber: item.transaction_number,
    customerId: item.customer_id,
    customerName: item.customer_name,
    cashierId: item.cashier_id,
    cashierName: item.cashier_name,
    paymentMethodId: item.payment_method_id,
    paymentMethodName: item.payment_method_name,
    subtotal: item.subtotal,
    discount: item.discount,
    vatRate: item.vat_rate,
    vat: item.vat,
    grandTotal: item.grand_total,
    amountReceived: item.amount_received,
    amountChanged: item.amount_changed,
    generatedQuotationId: item.generated_quotation_id,
    generatedQuotationNo: item.generated_quotation_no,
    generatedSaleOrderId: item.generated_sale_order_id,
    generatedSaleOrderNo: item.generated_sale_order_no,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    voidedAt: item.voided_at,
    voidedBy: item.voided_by,
    voidReason: item.void_reason,
    items: (item.items ?? []).map((line) => ({
      id: line.id,
      productId: line.product_id,
      itemName: line.item_name,
      productCode: line.product_code,
      barcode: line.barcode,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      taxRate: line.tax_rate,
      lineSubtotal: line.line_subtotal,
      lineDiscount: line.line_discount,
      lineVAT: line.line_vat,
      totalPrice: line.total_price
    }))
  };
}

function mapMasterData(item: MasterDataApi): CategorySummary {
  return {
    id: item.id,
    thaiName: item.thai_name,
    englishName: item.english_name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by,
    updatedBy: item.updated_by,
    isActive: item.is_active,
    companyId: item.company_id
  };
}

export async function getCategories(token?: string): Promise<CategorySummary[]> {
  const response = await request<ApiResponse<MasterDataApi[]>>("/categories", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapMasterData);
}

export async function createCategory(
  token: string,
  input: { thaiName: string; englishName: string; isActive?: boolean; companyId?: string }
): Promise<CategorySummary> {
  const response = await request<ApiResponse<MasterDataApi>>("/categories", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      thai_name: input.thaiName,
      english_name: input.englishName,
      is_active: input.isActive ?? true,
      company_id: input.companyId ?? "QMS001"
    })
  });
  return mapMasterData(response.data);
}

export async function getMaterials(token?: string): Promise<MaterialSummary[]> {
  const response = await request<ApiResponse<MasterDataApi[]>>("/materials", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    ...mapMasterData(item)
  }));
}

export async function createMaterial(
  token: string,
  input: { thaiName: string; englishName: string; isActive?: boolean; companyId?: string }
): Promise<MaterialSummary> {
  const response = await request<ApiResponse<MasterDataApi>>("/materials", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      thai_name: input.thaiName,
      english_name: input.englishName,
      is_active: input.isActive ?? true,
      company_id: input.companyId ?? "QMS001"
    })
  });
  return {
    ...mapMasterData(response.data)
  };
}

export async function getColors(token?: string): Promise<ColorSummary[]> {
  const response = await request<ApiResponse<MasterDataApi[]>>("/colors", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    ...mapMasterData(item)
  }));
}

export async function createColor(
  token: string,
  input: { thaiName: string; englishName: string; isActive?: boolean; companyId?: string }
): Promise<ColorSummary> {
  const response = await request<ApiResponse<MasterDataApi>>("/colors", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      thai_name: input.thaiName,
      english_name: input.englishName,
      is_active: input.isActive ?? true,
      company_id: input.companyId ?? "QMS001"
    })
  });
  return {
    ...mapMasterData(response.data)
  };
}

export async function getTerms(token?: string): Promise<TermSummary[]> {
  const response = await request<ApiResponse<MasterDataApi[]>>("/terms", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    ...mapMasterData(item)
  }));
}

export async function createTerm(
  token: string,
  input: { thaiName: string; englishName: string; isActive?: boolean; companyId?: string }
): Promise<TermSummary> {
  const response = await request<ApiResponse<MasterDataApi>>("/terms", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      thai_name: input.thaiName,
      english_name: input.englishName,
      is_active: input.isActive ?? true,
      company_id: input.companyId ?? "QMS001"
    })
  });
  return {
    ...mapMasterData(response.data)
  };
}

export async function getPaymentMethods(token?: string): Promise<PaymentMethodSummary[]> {
  const response = await request<ApiResponse<MasterDataApi[]>>("/payment-methods", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    ...mapMasterData(item)
  }));
}

export async function createPaymentMethod(
  token: string,
  input: { thaiName: string; englishName: string; isActive?: boolean; companyId?: string }
): Promise<PaymentMethodSummary> {
  const response = await request<ApiResponse<MasterDataApi>>("/payment-methods", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      thai_name: input.thaiName,
      english_name: input.englishName,
      is_active: input.isActive ?? true,
      company_id: input.companyId ?? "QMS001"
    })
  });
  return {
    ...mapMasterData(response.data)
  };
}

function mapThemeConfig(item: ThemeConfigApi): ThemeConfigSummary {
  return {
    id: item.id,
    themeName: item.theme_name,
    bg: item.bg,
    surface: item.surface,
    surfaceAlt: item.surface_alt,
    text: item.text,
    muted: item.muted,
    border: item.border,
    primary: item.primary,
    primarySoft: item.primary_soft,
    warning: item.warning,
    danger: item.danger,
    success: item.success,
    shadow: item.shadow,
    isDefault: item.is_default,
    isActive: item.is_active,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by,
    updatedBy: item.updated_by
  };
}

function mapPreviewLayoutConfig(item: PreviewLayoutConfigApi): PreviewLayoutConfigSummary {
  return {
    id: item.id,
    sellerFontSize: item.seller_font_size,
    buyerFontSize: item.buyer_font_size,
    metaFontSize: item.meta_font_size,
    metaPanelWidth: item.meta_panel_width,
    termsFontSize: item.terms_font_size,
    tableWidth: item.table_width,
    headerGap: item.header_gap,
    metaGap: item.meta_gap,
    termsTop: item.terms_top,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by,
    updatedBy: item.updated_by
  };
}

export async function getThemes(token?: string): Promise<ThemeConfigSummary[]> {
  const response = await request<ApiResponse<ThemeConfigApi[]>>("/themes", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapThemeConfig);
}

export async function saveTheme(
  token: string,
  input: {
    id?: string;
    themeName: string;
    bg: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    primarySoft: string;
    warning: string;
    danger: string;
    success: string;
    shadow: string;
    isDefault: boolean;
    isActive: boolean;
  }
): Promise<ThemeConfigSummary> {
  const path = input.id ? `/themes/${input.id}` : "/themes";
  const method = input.id ? "PUT" : "POST";
  const response = await request<ApiResponse<ThemeConfigApi>>(path, {
    method,
    headers: authHeaders(token),
    body: JSON.stringify({
      theme_name: input.themeName,
      bg: input.bg,
      surface: input.surface,
      surface_alt: input.surfaceAlt,
      text: input.text,
      muted: input.muted,
      border: input.border,
      primary: input.primary,
      primary_soft: input.primarySoft,
      warning: input.warning,
      danger: input.danger,
      success: input.success,
      shadow: input.shadow,
      is_default: input.isDefault,
      is_active: input.isActive
    })
  });
  return mapThemeConfig(response.data);
}

export async function getPreviewLayoutConfig(token?: string): Promise<PreviewLayoutConfigSummary> {
  const response = await request<ApiResponse<PreviewLayoutConfigApi>>("/preview-layout", {
    headers: authHeaders(token)
  });
  return mapPreviewLayoutConfig(response.data);
}

export async function savePreviewLayoutConfig(
  token: string,
  input: {
    sellerFontSize: number;
    buyerFontSize: number;
    metaFontSize: number;
    metaPanelWidth: number;
    termsFontSize: number;
    tableWidth: number;
    headerGap: number;
    metaGap: number;
    termsTop: number;
  }
): Promise<PreviewLayoutConfigSummary> {
  const response = await request<ApiResponse<PreviewLayoutConfigApi>>("/preview-layout", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      seller_font_size: input.sellerFontSize,
      buyer_font_size: input.buyerFontSize,
      meta_font_size: input.metaFontSize,
      meta_panel_width: input.metaPanelWidth,
      terms_font_size: input.termsFontSize,
      table_width: input.tableWidth,
      header_gap: input.headerGap,
      meta_gap: input.metaGap,
      terms_top: input.termsTop
    })
  });
  return mapPreviewLayoutConfig(response.data);
}

export async function getPriceTiers(token?: string): Promise<PriceTierSummary[]> {
  const response = await request<ApiResponse<PriceTierApi[]>>("/price-tiers", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    tier: item.tier,
    name: item.name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    createdBy: item.created_by,
    updatedBy: item.updated_by,
    isActive: item.is_active,
    companyId: item.company_id
  }));
}

export async function createPriceTier(
  token: string,
  input: { tier: string; name: string; isActive?: boolean; companyId?: string }
): Promise<PriceTierSummary> {
  const response = await request<ApiResponse<PriceTierApi>>("/price-tiers", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      tier: input.tier,
      name: input.name,
      is_active: input.isActive ?? true,
      company_id: input.companyId ?? "QMS001"
    })
  });
  return {
    id: response.data.id,
    tier: response.data.tier,
    name: response.data.name,
    createdAt: response.data.created_at,
    updatedAt: response.data.updated_at,
    createdBy: response.data.created_by,
    updatedBy: response.data.updated_by,
    isActive: response.data.is_active,
    companyId: response.data.company_id
  };
}

export async function getPriceRules(token?: string): Promise<PriceRuleSummary[]> {
  const response = await request<ApiResponse<PriceRuleApi[]>>("/pricing-rules", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    taxCodeId: item.tax_code_id,
    priceTierId: item.price_tier_id ?? "",
    standardPrice: item.standard_price,
    discountLimitPercent: item.discount_limit_percent,
    createdBy: item.created_by ?? "",
    effectiveFrom: item.effective_from,
    effectiveTo: item.effective_to ?? undefined
  }));
}

export async function createPriceRule(
  token: string,
  input: { productId: string; taxCodeId: string; priceTierId: string; standardPrice: number; discountLimitPercent: number }
): Promise<PriceRuleSummary> {
  const response = await request<ApiResponse<PriceRuleApi>>("/pricing-rules", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      product_id: input.productId,
      tax_code_id: input.taxCodeId,
      price_tier_id: input.priceTierId,
      standard_price: input.standardPrice,
      discount_limit_percent: input.discountLimitPercent
    })
  });
  const item = response.data;
  return {
    id: item.id,
    productId: item.product_id,
    taxCodeId: item.tax_code_id,
    priceTierId: item.price_tier_id ?? "",
    standardPrice: item.standard_price,
    discountLimitPercent: item.discount_limit_percent,
    createdBy: item.created_by ?? "",
    effectiveFrom: item.effective_from,
    effectiveTo: item.effective_to ?? undefined
  };
}

export async function deletePriceRule(token: string, id: string): Promise<void> {
  await request<ApiResponse<unknown>>(`/pricing-rules/${id}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export async function getQuotations(token?: string): Promise<QuotationSummary[]> {
  const response = await request<ApiResponse<QuotationApi[]>>("/quotations", {
    headers: authHeaders(token)
  });
  const customers = token ? await getCustomers(token) : [];
  const userNames = token ? await getUserDisplayNames(token) : {};
  const customerNames = Object.fromEntries(customers.map((customer) => [customer.id, customer.customerName]));
  return Promise.all(
    (response.data ?? []).map(async (item) => {
      let totalAmount = 0;
      if (token) {
        try {
          const detail = await getQuotation(token, item.id);
          totalAmount = detail.totalAmount;
        } catch {
          totalAmount = 0;
        }
      }
      return {
        id: item.id,
        quotationNo: item.quotation_no,
        customerId: item.customer_id,
        customerName: displayNameFromId(item.customer_id, customerNames),
        ownerId: item.owner_user_id,
        ownerName: displayNameFromId(item.owner_user_id, userNames),
        status: item.status,
        totalAmount,
        createdAt: item.created_at,
        validityDate: item.validity_date
      };
    })
  );
}

export async function getQuotation(token: string, id: string): Promise<QuotationDetail> {
  const response = await request<ApiResponse<QuotationDetailApi>>(`/quotations/${id}`, {
    headers: authHeaders(token)
  });
  const [customers, userNames] = await Promise.all([getCustomers(token), getUserDisplayNames(token)]);
  const customerNames = Object.fromEntries(customers.map((customer) => [customer.id, customer.customerName]));
  const item = response.data;
  return {
    id: item.quotation.id,
    quotationNo: item.quotation.quotation_no,
    customerId: item.quotation.customer_id,
    customerName: displayNameFromId(item.quotation.customer_id, customerNames),
    ownerId: item.quotation.owner_user_id,
    ownerName: displayNameFromId(item.quotation.owner_user_id, userNames),
    status: item.quotation.status,
    totalAmount: item.version.total_amount,
    createdAt: item.quotation.created_at,
    validityDate: item.quotation.validity_date,
    terms: item.version.terms,
    lineItems: (item.line_items ?? []).map((line) => ({
      id: line.id,
      lineOrder: line.line_order ?? 0,
      productId: line.product_id,
      productCode: line.product_code,
      productName: line.product_name,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      discountPercent: line.discount_percent,
      taxRate: line.tax_rate,
      lineTotal: line.line_total
    }))
  };
}

function mapSaleOrderSummary(item: SaleOrderApi): SaleOrderSummary {
  return {
    id: item.id,
    soNumber: item.so_number,
    quotationId: item.quotation_id,
    quotationNo: item.quotation_no,
    customerId: item.customer_id,
    customerName: item.customer_name,
    createdBy: item.created_by,
    createdByName: item.created_by_name,
    paymentMethodId: item.payment_method_id,
    paymentMethodName: item.payment_method_name,
    paymentTermDays: item.payment_term_days,
    shippingAddress: item.shipping_address,
    promotionCampaign: item.promotion_campaign,
    subtotal: item.subtotal,
    discount: item.discount,
    vatRate: item.vat_rate,
    vat: item.vat,
    grandTotal: item.grand_total,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    items: (item.items ?? []).map((line) => ({
      id: line.id,
      productId: line.product_id,
      promotionId: line.promotion_id,
      itemName: line.item_name,
      productCode: line.product_code,
      quantity: line.quantity,
      unitPrice: line.unit_price,
      discount: line.discount,
      discountedNet: line.discounted_net,
      taxRate: line.tax_rate,
      totalPrice: line.total_price
    })),
    delivery: item.delivery ? {
      id: item.delivery.id,
      deliveryNumber: item.delivery.delivery_number,
      requestedDeliveryDate: item.delivery.requested_delivery_date,
      actualDeliveryDate: item.delivery.actual_delivery_date,
      shippingAddress: item.delivery.shipping_address,
      trackingNumber: item.delivery.tracking_number,
      status: item.delivery.status as SaleOrderSummary["delivery"] extends { status: infer T } ? T : never
    } : undefined,
    payments: (item.payments ?? []).map((payment) => ({
      id: payment.id,
      paymentNumber: payment.payment_number,
      paymentMethodId: payment.payment_method_id,
      amountPaid: payment.amount_paid,
      paymentStatus: payment.payment_status,
      paidAt: payment.paid_at,
      evidenceUrl: payment.evidence_url,
      createdAt: payment.created_at
    })),
    couponTransactions: (item.coupon_transactions ?? []).map((tx) => ({
      id: tx.id,
      customerId: tx.customer_id,
      memberBenefitId: tx.member_benefit_id,
      couponCode: tx.coupon_code,
      couponName: tx.coupon_name,
      benefitType: tx.benefit_type,
      valueAmount: tx.value_amount,
      saleOrderNo: tx.sale_order_no,
      posTransactionNumber: tx.pos_transaction_number,
      status: tx.status,
      redeemedAt: tx.redeemed_at,
      expiresAt: tx.expires_at,
      createdAt: tx.created_at,
      updatedAt: tx.updated_at
    })),
    outstandingBalance: item.outstanding_balance
  };
}

export async function getSaleOrders(token: string): Promise<SaleOrderSummary[]> {
  const response = await request<ApiResponse<SaleOrderApi[]>>("/sale-orders", {
    headers: authHeaders(token)
  });
  return (response.data ?? []).map(mapSaleOrderSummary);
}

export async function getSaleOrder(token: string, id: string): Promise<SaleOrderSummary> {
  const response = await request<ApiResponse<SaleOrderApi>>(`/sale-orders/${id}`, {
    headers: authHeaders(token)
  });
  return mapSaleOrderSummary(response.data);
}

export async function createSaleOrder(
  token: string,
  input: {
    quotationId: string;
    paymentMethodId: string;
    paymentTermDays: number;
    shippingAddress: string;
    promotionCampaign: string;
    status: SaleOrderSummary["status"];
    requestedDeliveryDate: string;
    actualDeliveryDate?: string;
    trackingNumber?: string;
    deliveryStatus: "pending" | "shipped" | "delivered" | "failed";
    items?: Array<{
      productId: string;
      promotionId?: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      itemName: string;
      productCode: string;
      taxRate: number;
    }>;
  }
): Promise<SaleOrderSummary> {
  const response = await request<ApiResponse<SaleOrderApi>>("/sale-orders", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      quotation_id: input.quotationId,
      payment_method_id: input.paymentMethodId,
      payment_term_days: input.paymentTermDays,
      shipping_address: input.shippingAddress,
      promotion_campaign: input.promotionCampaign,
      status: input.status,
      requested_delivery_date: input.requestedDeliveryDate,
      actual_delivery_date: input.actualDeliveryDate ?? "",
      tracking_number: input.trackingNumber ?? "",
      delivery_status: input.deliveryStatus,
      items: (input.items ?? []).map((item) => ({
        product_id: item.productId,
        promotion_id: item.promotionId ?? "",
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
        item_name: item.itemName,
        product_code: item.productCode,
        tax_rate: item.taxRate
      }))
    })
  });
  return mapSaleOrderSummary(response.data);
}

export async function updateSaleOrder(
  token: string,
  id: string,
  input: {
    quotationId: string;
    paymentMethodId: string;
    paymentTermDays: number;
    shippingAddress: string;
    promotionCampaign: string;
    status: SaleOrderSummary["status"];
    requestedDeliveryDate: string;
    actualDeliveryDate?: string;
    trackingNumber?: string;
    deliveryStatus: "pending" | "shipped" | "delivered" | "failed";
    items?: Array<{
      productId: string;
      promotionId?: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      itemName: string;
      productCode: string;
      taxRate: number;
    }>;
  }
): Promise<SaleOrderSummary> {
  const response = await request<ApiResponse<SaleOrderApi>>(`/sale-orders/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({
      quotation_id: input.quotationId,
      payment_method_id: input.paymentMethodId,
      payment_term_days: input.paymentTermDays,
      shipping_address: input.shippingAddress,
      promotion_campaign: input.promotionCampaign,
      status: input.status,
      requested_delivery_date: input.requestedDeliveryDate,
      actual_delivery_date: input.actualDeliveryDate ?? "",
      tracking_number: input.trackingNumber ?? "",
      delivery_status: input.deliveryStatus,
      items: (input.items ?? []).map((item) => ({
        product_id: item.productId,
        promotion_id: item.promotionId ?? "",
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
        item_name: item.itemName,
        product_code: item.productCode,
        tax_rate: item.taxRate
      }))
    })
  });
  return mapSaleOrderSummary(response.data);
}

export async function updateQuotationStatus(token: string, id: string, status: QuotationStatus): Promise<QuotationSummary> {
  const response = await request<ApiResponse<QuotationApi>>(`/quotations/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status })
  });
  const item = response.data;
  return {
    id: item.id,
    quotationNo: item.quotation_no,
    customerId: item.customer_id,
    customerName: item.customer_id,
    ownerId: item.owner_user_id,
    ownerName: item.owner_user_id,
    status: item.status,
    totalAmount: 0,
    createdAt: item.created_at,
    validityDate: item.validity_date
  };
}

export async function submitQuotation(token: string, id: string): Promise<QuotationSummary> {
  const response = await request<ApiResponse<QuotationApi>>(`/quotations/${id}/submit`, {
    method: "POST",
    headers: authHeaders(token)
  });
  const item = response.data;
  return {
    id: item.id,
    quotationNo: item.quotation_no,
    customerId: item.customer_id,
    customerName: item.customer_id,
    ownerId: item.owner_user_id,
    ownerName: item.owner_user_id,
    status: item.status,
    totalAmount: 0,
    createdAt: item.created_at,
    validityDate: item.validity_date
  };
}

export async function createQuotation(
  token: string,
  input: {
    customerId: string;
    contactId: string;
    validityDate: string;
    terms: string;
    lineItems: Array<{
      lineOrder: number;
      productId: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
      taxRate: number;
    }>;
  }
): Promise<QuotationCreateResponse> {
  const response = await request<ApiResponse<QuotationCreateResponse>>("/quotations", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      customer_id: input.customerId,
      contact_id: input.contactId,
      validity_date: input.validityDate,
      terms: input.terms,
      line_items: input.lineItems.map((item) => ({
        line_order: item.lineOrder,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent,
        tax_rate: item.taxRate
      }))
    })
  });
  return response.data;
}

export type ApprovalSummary = {
  id: string;
  approvalName: string;
  quotation_id: string;
  quotation_no: string;
  ownerId: string;
  ownerName: string;
  approver: string;
  status: "pending" | "approved" | "rejected";
  totalAmount: number;
  createdAt: string;
};

export async function getApprovals(token: string): Promise<ApprovalSummary[]> {
  const response = await request<ApiResponse<ApprovalSummary[]>>("/approvals", {
    headers: authHeaders(token)
  });
  const quotations = await getQuotations(token);
  const quotationMap = Object.fromEntries(quotations.map((quotation) => [quotation.id, quotation]));
  return (response.data ?? []).map((approval) => {
    const quotation = quotationMap[approval.quotation_id];
    return {
      ...approval,
      approvalName: `Approval for ${approval.quotation_no}`,
      ownerId: quotation?.ownerId ?? "",
      ownerName: quotation?.ownerName ?? "",
      totalAmount: quotation?.totalAmount ?? 0,
      createdAt: quotation?.createdAt ?? ""
    };
  });
}

export async function decideApproval(token: string, quotationId: string, decision: "approved" | "rejected") {
  const response = await request<ApiResponse<unknown>>(`/quotations/${quotationId}/approval-decisions`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ decision, comments: "Recorded from frontend workspace." })
  });
  return response.data;
}
