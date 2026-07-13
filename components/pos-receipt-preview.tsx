"use client";

import type { POSTransactionSummary } from "@/types/models";
import { formatCurrency, formatDateTimeSeconds } from "@/utils/format";

export type ReceiptPreviewItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

const POS_STORE_NAME = "POS001";
const POS_STORE_TAX_ID = "0105559999999";
const POS_VAT_CODE = "POS-VAT-001";

export function POSReceiptPreview({
  receipt,
  items,
  customerName,
  paymentMethodName,
  currentPoints,
  earnedPoints,
  billDiscount,
  specialDiscount,
  appliedBenefits,
  onClose
}: {
  receipt: POSTransactionSummary;
  items: ReceiptPreviewItem[];
  customerName?: string;
  paymentMethodName?: string;
  currentPoints?: number;
  earnedPoints?: number;
  billDiscount?: number;
  specialDiscount?: number;
  appliedBenefits?: Array<{ benefitId: string; label: string; count: number; totalDiscount: number }>;
  onClose: () => void;
}) {
  const resolvedCustomerName =
    !customerName || customerName.trim().toLowerCase() === "general customer"
      ? "#"
      : customerName.trim();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal pos-receipt-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="pos-receipt-sheet">
          <div className="pos-receipt-header">
            <button className="button compact" type="button" onClick={onClose}>Close</button>
          </div>

          <div className="pos-receipt-centerline"><strong>{POS_STORE_NAME}</strong></div>
          <div className="pos-receipt-centerline"><span>TAX ID {POS_STORE_TAX_ID}</span></div>
          <div className="pos-receipt-centerline"><span>{POS_VAT_CODE}</span></div>
          <div className="pos-receipt-centerline"><span>{formatDateTimeSeconds(receipt.createdAt)}</span></div>
          <div className="pos-receipt-centerline pos-receipt-title"><strong>ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ</strong></div>

          <div className="pos-receipt-items-head">
            <span>Amount</span>
            <span>Item Name</span>
            <span>Unit</span>
            <span>Total</span>
          </div>
          <div className="pos-receipt-items-body">
            {items.length > 0 ? items.map((item) => (
              <div className="pos-receipt-item-row" key={item.id}>
                <span>{item.quantity}</span>
                <span>{item.productName}</span>
                <span>{formatCurrency(item.unitPrice)}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            )) : (
              <div className="pos-receipt-item-row">
                <span>-</span>
                <span>Receipt summary</span>
                <span>{formatCurrency(receipt.subtotal)}</span>
                <span>{formatCurrency(receipt.subtotal)}</span>
              </div>
            )}
          </div>
            <br />
          <div className="pos-receipt-summary-row">
            <span>Total Amount</span>
            <strong>{totalQuantity}</strong>
          </div>
          {(billDiscount ?? 0) > 0 ? (
            <div className="pos-receipt-summary-row">
              <span>Discount</span>
              <strong>{formatCurrency(billDiscount ?? 0)}</strong>
            </div>
          ) : null}
          {(specialDiscount ?? 0) > 0 ? (
            <>
              {(appliedBenefits ?? []).map((benefit) => (
                <div className="pos-receipt-summary-row" key={benefit.benefitId}>
                  <span>{benefit.label} (x{benefit.count})</span>
                  <strong>{formatCurrency(benefit.totalDiscount)}</strong>
                </div>
              ))}
              {!(appliedBenefits && appliedBenefits.length > 0) ? (
                <div className="pos-receipt-summary-row">
                  <span>Special Discount</span>
                  <strong>{formatCurrency(specialDiscount ?? 0)}</strong>
                </div>
              ) : null}
            </>
          ) : null}
          <div className="pos-receipt-summary-row pos-receipt-total">
            <span>Net Total</span>
            <strong>{formatCurrency(receipt.grandTotal)}</strong>
          </div>

          <div className="pos-receipt-summary-row">
            <span>{paymentMethodName || receipt.paymentMethodName} / Change</span>
            <strong>{formatCurrency(receipt.amountReceived)} / {formatCurrency(receipt.amountChanged)}</strong>
          </div>
          <div className="pos-receipt-summary-row">
            <span>Customer</span>
            <strong>{resolvedCustomerName}</strong>
          </div>
          {typeof currentPoints === "number" || typeof earnedPoints === "number" ? (
            <div className="pos-receipt-summary-row">
              <span>Point</span>
              <strong>{`${(currentPoints ?? 0).toLocaleString("en-US")} + ${(earnedPoints ?? 0).toLocaleString("en-US")}`}</strong>
            </div>
          ) : null}

          <div className="pos-receipt-divider" />
          <div className="pos-receipt-links">
            <small>QT: {receipt.generatedQuotationNo || "-"}</small>
            <small>SO: {receipt.generatedSaleOrderNo || "-"}</small>
          </div>
        </div>
      </div>
    </div>
  );
}
