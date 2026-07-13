export type QuotationStatus = "draft" | "submitted" | "approved" | "rejected" | "sent" | "accepted" | "declined" | "revised" | "expired";
export type JobListingStatus = "draft" | "open" | "filled" | "pending" | "closed";
export type ApplicantStatus = "applied" | "under_review" | "interviewing" | "assessment" | "offer_extended" | "hired" | "rejected";
export type InterviewMode = "online" | "on-site";
export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";
export type InterviewPanelStatus = "awaiting" | "accepted" | "declined";
export type InterviewRecommendation = "pass" | "hold" | "reject";
export type AssessmentCategory = "logic" | "technical" | "language" | "psychology";
export type CandidateAssessmentStatus = "sent" | "in_progress" | "completed" | "expired";
export type CandidateResultStatus = "pass" | "fail" | "";
export type OfferStatus = "draft" | "pending_approval" | "sent" | "accepted" | "declined" | "expired";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type SaleOrderStatus = "draft" | "confirmed" | "processing" | "completed" | "cancelled";
export type DeliveryStatus = "pending" | "shipped" | "delivered" | "failed";
export type SaleOrderPaymentStatus = "pending" | "success" | "failed";
export type ShiftStatus = "open" | "closed";

export interface AssessmentOptionSummary {
  optionId: string;
  text: string;
  isCorrect: boolean;
}

export interface AssessmentQuestionSummary {
  id: string;
  testId: string;
  questionText: string;
  questionImageUrl: string;
  options: AssessmentOptionSummary[];
  sortOrder: number;
}

export interface InterviewPanelSummary {
  id: string;
  interviewId: string;
  interviewerEmail: string;
  status: InterviewPanelStatus;
}

export interface InterviewScorecardSummary {
  id: string;
  interviewId: string;
  interviewerEmail: string;
  rating: number;
  feedbackNotes: string;
  recommendation: InterviewRecommendation;
}

export interface InterviewSummary {
  id: string;
  applicationId: string;
  applicantId: string;
  jobId: string;
  applicantName: string;
  jobTitle: string;
  departmentName: string;
  title: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
  interviewMode: InterviewMode;
  location: string;
  meetingUrl: string;
  status: InterviewStatus;
  scorecardStatus: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
  panels: InterviewPanelSummary[];
  scorecards: InterviewScorecardSummary[];
}

export interface JobListingSummary {
  id: string;
  jobId: string;
  jobTitle: string;
  departmentName: string;
  roleLevel: string;
  locationName: string;
  locationDetail: string;
  workType: string;
  jobDescription: string;
  requirementsText: string;
  requirementsTags: string[];
  applicationDeadline: string;
  salaryMin: number;
  salaryMax: number;
  hideSalaryFromPublic: boolean;
  status: JobListingStatus;
  recruitmentEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ApplicantSummary {
  applicationId: string;
  applicantId: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhotoUrl: string;
  currentCompany: string;
  currentRole: string;
  resumeUrl: string;
  portfolioUrl: string;
  portfolioUrls: string[];
  source: string;
  jobTitle: string;
  departmentName: string;
  roleLevel: string;
  locationName: string;
  workType: string;
  status: ApplicantStatus;
  matchPercentage: number;
  recruiterNotes: string;
  appliedAt: string;
  updatedAt: string;
}

export interface AssessmentSummary {
  id: string;
  testCode: string;
  title: string;
  description: string;
  category: AssessmentCategory;
  totalQuestions: number;
  durationMinutes: number;
  maxScore: number;
  passingScore: number;
  externalTestUrl: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  questions: AssessmentQuestionSummary[];
}

export interface CandidateAssessmentSummary {
  id: string;
  applicationId: string;
  applicantId: string;
  jobId: string;
  applicantName: string;
  applicantPhotoUrl: string;
  jobTitle: string;
  departmentName: string;
  roleLevel: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentCategory: AssessmentCategory;
  totalQuestions: number;
  durationMinutes: number;
  passingScore: number;
  status: CandidateAssessmentStatus;
  sentAt: string;
  completedAt: string;
  scoreAchieved: number;
  resultStatus: CandidateResultStatus;
  testLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferApprovalSummary {
  id: string;
  offerId: string;
  approverEmail: string;
  approvalStatus: ApprovalStatus;
  comment: string;
}

export interface OfferSummary {
  id: string;
  applicationId: string;
  applicantId: string;
  jobId: string;
  applicantName: string;
  applicantPhoto: string;
  jobTitle: string;
  departmentName: string;
  salary: number;
  signOnBonus: number;
  benefitsPackage: string[];
  offerLetterUrl: string;
  sentAt: string;
  expiryDate: string;
  status: OfferStatus;
  declineReason: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  offerApprovals: OfferApprovalSummary[];
}

export interface QuotationSummary {
  id: string;
  quotationNo: string;
  customerId: string;
  customerName: string;
  ownerId: string;
  ownerName: string;
  status: QuotationStatus;
  totalAmount: number;
  createdAt: string;
  validityDate: string;
}

export interface QuotationLineItem {
  id: string;
  lineOrder: number;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  lineTotal: number;
}

export interface QuotationDetail extends QuotationSummary {
  terms: string;
  lineItems: QuotationLineItem[];
}

export interface SaleOrderLineItemSummary {
  id: string;
  productId: string;
  promotionId: string;
  itemName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountedNet: number;
  taxRate: number;
  totalPrice: number;
}

export interface SaleOrderDeliverySummary {
  id: string;
  deliveryNumber: string;
  requestedDeliveryDate: string;
  actualDeliveryDate: string;
  shippingAddress: string;
  trackingNumber: string;
  status: DeliveryStatus;
}

export interface SaleOrderPaymentSummary {
  id: string;
  paymentNumber: string;
  paymentMethodId: string;
  amountPaid: number;
  paymentStatus: SaleOrderPaymentStatus;
  paidAt: string;
  evidenceUrl: string;
  createdAt: string;
}

export interface SaleOrderSummary {
  id: string;
  soNumber: string;
  quotationId: string;
  quotationNo: string;
  customerId: string;
  customerName: string;
  createdBy: string;
  createdByName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentTermDays: number;
  shippingAddress: string;
  promotionCampaign: string;
  subtotal: number;
  discount: number;
  vatRate: number;
  vat: number;
  grandTotal: number;
  status: SaleOrderStatus;
  createdAt: string;
  updatedAt: string;
  items: SaleOrderLineItemSummary[];
  delivery?: SaleOrderDeliverySummary;
  payments: SaleOrderPaymentSummary[];
  couponTransactions: CouponTransactionSummary[];
  outstandingBalance: number;
}

export interface CustomerSummary {
  id: string;
  ownerUserId?: string;
  primaryContactId?: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  customerType?: CustomerType;
  customerName: string;
  accountCode: string;
  billingAddress?: string;
  fullName?: string;
  nationalId?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
  registeredAddress?: string;
  documentDeliveryAddress?: string;
  identityDocumentNote?: string;
  lineId?: string;
  bankInfo?: string;
  companyName?: string;
  taxId?: string;
  branchType?: string;
  officePhone?: string;
  companyEmail?: string;
  website?: string;
  companyCertificateNote?: string;
  vatCertificateNote?: string;
  shareholderListNote?: string;
  powerOfAttorneyNote?: string;
  authorizedPersonName?: string;
  authorizedPersonTitle?: string;
  authorizedPersonPhone?: string;
  authorizedPersonEmail?: string;
  status: "active" | "inactive";
}

export interface LoyaltyTierSummary {
  id: string;
  loyaltyName: string;
  minSpend: number;
  benefit: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTierMemberSummary {
  id: string;
  tierId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
}

export interface LoyaltyTierBenefitSummary {
  id: string;
  tierId: string;
  benefitType: string;
  refId: string;
  benefitName: string;
  createdAt: string;
}

export interface LoyaltyTierDetailSummary {
  tier: LoyaltyTierSummary;
  members: LoyaltyTierMemberSummary[];
  benefits: LoyaltyTierBenefitSummary[];
}

export interface LoyaltyRewardSummary {
  id: string;
  rewardName: string;
  rewardType: string;
  productId: string;
  productName: string;
  loyaltyTierId: string;
  loyaltyTier: string;
  usePoint: number;
  stock: number;
  ownerCount: number;
  costPer: number;
  expiry: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyCouponSummary {
  id: string;
  couponCode: string;
  couponName: string;
  couponType: string;
  loyaltyTierId: string;
  loyaltyTier: string;
  stock: number;
  ownerCount: number;
  valueLabel: string;
  expiry: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyEarningRuleSummary {
  id: string;
  ruleName: string;
  loyaltyTierId: string;
  loyaltyTier: string;
  triggerRule: string;
  rewardLogic: string;
  ownerCount: number;
  expiry: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberBenefitSummary {
  id: string;
  customerId: string;
  name: string;
  code: string;
  benefitType: string;
  sourceRefId: string;
  amount: number;
  createdAt: string;
  expiresAt: string;
  updatedAt: string;
}

export interface CouponTransactionSummary {
  id: string;
  customerId: string;
  memberBenefitId: string;
  couponCode: string;
  couponName: string;
  benefitType: string;
  valueAmount: number;
  saleOrderNo: string;
  posTransactionNumber: string;
  status: string;
  redeemedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberPointBalanceSummary {
  customerId: string;
  currentPoints: number;
  earnedPoints: number;
  spentPoints: number;
}

export interface AddressSummary {
  id: string;
  province: string;
  district: string;
  subDistrict: string;
  zipCode: string;
}

export type CustomerType = "individual" | "company";

export interface IndividualCustomerProfile {
  customerType: "individual";
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  registeredAddress: string;
  documentDeliveryAddress: string;
  identityDocumentNote: string;
  lineId: string;
  bankInfo: string;
}

export interface CompanyCustomerProfile {
  customerType: "company";
  companyName: string;
  taxId: string;
  branchType: string;
  officePhone: string;
  companyEmail: string;
  website: string;
  companyCertificateNote: string;
  vatCertificateNote: string;
  shareholderListNote: string;
  powerOfAttorneyNote: string;
  authorizedPersonName: string;
  authorizedPersonTitle: string;
  authorizedPersonPhone: string;
  authorizedPersonEmail: string;
}

export type CustomerProfile = IndividualCustomerProfile | CompanyCustomerProfile;

export interface ProductSummary {
  id: string;
  productCode: string;
  productName: string;
  barcode?: string;
  description?: string;
  imageDataUrl?: string;
  categoryId: string;
  categoryName: string;
  materialId: string;
  materialName: string;
  colorId: string;
  colorName: string;
  features: string[];
  width: number;
  length: number;
  height: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface POSCatalogItemSummary {
  productId: string;
  productCode: string;
  productName: string;
  barcode: string;
  categoryName: string;
  basicPrice: number;
  taxRate: number;
  active: boolean;
}

export interface POSTransactionSummary {
  id: string;
  transactionNumber: string;
  customerId: string;
  customerName: string;
  cashierId: string;
  cashierName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  subtotal: number;
  discount: number;
  vatRate: number;
  vat: number;
  grandTotal: number;
  amountReceived: number;
  amountChanged: number;
  generatedQuotationId: string;
  generatedQuotationNo: string;
  generatedSaleOrderId: string;
  generatedSaleOrderNo: string;
  status: "success" | "cancelled";
  createdAt: string;
  updatedAt?: string;
  voidedAt?: string;
  voidedBy?: string;
  voidReason?: string;
  items?: Array<{
    id: string;
    productId: string;
    itemName: string;
    productCode: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    lineSubtotal: number;
    lineDiscount: number;
    lineVAT: number;
    totalPrice: number;
  }>;
}

export interface CategorySummary {
  id: string;
  thaiName: string;
  englishName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  companyId: string;
}

export interface MaterialSummary {
  id: string;
  thaiName: string;
  englishName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  companyId: string;
}

export interface ColorSummary {
  id: string;
  thaiName: string;
  englishName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  companyId: string;
}

export interface TermSummary {
  id: string;
  thaiName: string;
  englishName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  companyId: string;
}

export interface PaymentMethodSummary {
  id: string;
  thaiName: string;
  englishName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  companyId: string;
}

export interface ThemeConfigSummary {
  id: string;
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
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PreviewLayoutConfigSummary {
  id: string;
  sellerFontSize: number;
  buyerFontSize: number;
  metaFontSize: number;
  metaPanelWidth: number;
  termsFontSize: number;
  tableWidth: number;
  headerGap: number;
  metaGap: number;
  termsTop: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PriceRuleSummary {
  id: string;
  productId: string;
  taxCodeId: string;
  priceTierId: string;
  standardPrice: number;
  discountLimitPercent: number;
  createdBy: string;
  effectiveFrom: string;
  effectiveTo?: string;
}


export interface PriceTierSummary {
  id: string;
  tier: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  companyId: string;
}

export type PurchaseOrderStatus = "draft" | "open" | "partial" | "received";
export type GoodsReceiptPostingStatus = "draft" | "posted";
export type GoodsReceiptStatus = "draft" | "partial" | "completed";

export interface PurchaseOrderLineSummary {
  poItemId: string;
  itemId: string;
  productCode: string;
  productName: string;
  quantityOrdered: number;
  quantityReceivedTotal: number;
  quantityRejectedTotal: number;
  remainingQty: number;
}

export interface PurchaseOrderSummary {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderLineSummary[];
}

export interface GoodsReceiptLineSummary {
  id: string;
  poItemId: string;
  itemId: string;
  productCode: string;
  productName: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityRejected: number;
}

export interface GoodsReceiptSummary {
  id: string;
  grNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierName: string;
  receivedDate: string;
  receivedBy: string;
  receivedByName: string;
  deliveryNoteNumber: string;
  remarks: string;
  postingStatus: GoodsReceiptPostingStatus;
  receiptStatus: GoodsReceiptStatus;
  totalReceived: number;
  totalRejected: number;
  items: GoodsReceiptLineSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInvoiceLineSummary {
  id: string;
  poItemId: string;
  itemId: string;
  productCode: string;
  productName: string;
  orderedQty: number;
  receivedQty: number;
  rejectedQty: number;
  invoicedQty: number;
  unitPrice: number;
  poAmount: number;
  invoiceAmount: number;
  isMismatch: boolean;
  goodsReceiptRefs: string[];
}

export interface SupplierInvoiceSummary {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  supplierName: string;
  supplierBankName: string;
  supplierBankAccount: string;
  invoiceDate: string;
  dueDate: string;
  subTotal: number;
  vatAmount: number;
  grandTotal: number;
  matchingStatus: "pending" | "matched" | "mismatched";
  paymentStatus: "unpaid" | "partial" | "paid";
  invoiceFileUrl: string;
  goodsReceiptIds: string[];
  goodsReceiptNumbers: string[];
  lines: SupplierInvoiceLineSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPaymentSummary {
  id: string;
  paymentVoucherNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  paymentDate: string;
  paymentMethod: "Bank_Transfer" | "Cheque" | "Cash";
  paidAmount: number;
  bankSlipUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface HREmployeeDirectorySummary {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string;
  positionTitle: string;
}

export interface MenuItemConfigSummary {
  href: string;
  label: string;
  visible: boolean;
}

export interface MenuGroupConfigSummary {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
  items: MenuItemConfigSummary[];
}
