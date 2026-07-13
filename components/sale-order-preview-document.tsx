"use client";

import { formatCurrency, formatDate } from "@/utils/format";

export type SaleOrderPreviewItem = {
  id: string;
  productCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountLabel: string;
  amount: number;
};

function formatAmountText(total: number) {
  return `(${formatCurrency(total)} total amount)`;
}

export function SaleOrderPreviewDocument({
  company,
  document,
  customer,
  references,
  items,
  summary,
  signatures
}: {
  company: {
    logoText: string;
    name: string;
    address: string;
    contact: string;
    taxId: string;
  };
  document: {
    title: string;
    number: string;
    date: string;
  };
  customer: {
    code: string;
    name: string;
    address: string;
    phone: string;
    fax: string;
  };
  references: {
    bookingNo: string;
    bookingDate: string;
    deliveryDate: string;
    creditDays: string;
    billingTerms: string;
    department: string;
  };
  items: SaleOrderPreviewItem[];
  summary: {
    note: string;
    subtotal: number;
    tradeDiscountLabel: string;
    tradeDiscountAmount: number;
    promotionDiscountAmount: number;
    discountedNet: number;
    vatLabel: string;
    vatAmount: number;
    grandTotal: number;
  };
  signatures: Array<{
    title: string;
    name: string;
    date: string;
  }>;
}) {
  return (
    <div className="print-document sale-order-preview-document">
      <article className="print-sheet sale-order-preview-sheet">
        <section className="sale-order-preview-header">
          <div className="sale-order-preview-company">
            <div className="sale-order-preview-company-info">
              <strong>{company.name}</strong>
              <p>{company.address}</p>
              <p>{company.contact}</p>
              <p>{company.taxId}</p>
            </div>
          </div>
          <div className="sale-order-preview-docbox">
            <h1>{document.title}</h1>
            <div className="sale-order-preview-meta-box">
              <div><span>เลขที่:</span><strong>{document.number}</strong></div>
              <div><span>วันที่:</span><strong>{formatDate(document.date)}</strong></div>
            </div>
          </div>
        </section>

        <section className="sale-order-preview-meta-grid">
          <div className="sale-order-preview-meta-card">
            <div><span>รหัสลูกค้า</span><strong>{customer.code}</strong></div>
            <div><span>ชื่อลูกค้า</span><strong>{customer.name}</strong></div>
            <div><span>ที่อยู่</span><strong>{customer.address}</strong></div>
            <div><span>โทร.</span><strong>{customer.phone}</strong></div>
            <div><span>โทรสาร</span><strong>{customer.fax}</strong></div>
          </div>

          <div className="sale-order-preview-meta-card">
            <div><span>ใบสั่งจอง</span><strong>{references.bookingNo}</strong></div>
            <div><span>ลงวันที่</span><strong>{references.bookingDate ? formatDate(references.bookingDate) : "-"}</strong></div>
            <div><span>วันที่กำหนดส่ง</span><strong>{references.deliveryDate ? formatDate(references.deliveryDate) : "-"}</strong></div>
            <div><span>จำนวนวันเครดิต</span><strong>{references.creditDays}</strong></div>
            <div><span>เงื่อนไขการวางบิล</span><strong>{references.billingTerms}</strong></div>
            <div><span>แผนก</span><strong>{references.department}</strong></div>
          </div>
        </section>

        <section className="sale-order-preview-items-wrap">
          <table className="sale-order-preview-items-table">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>จำนวน</th>
                <th>หน่วย</th>
                <th>ราคา/หน่วย</th>
                <th>ส่วนลด</th>
                <th>จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="sale-order-preview-item-cell">
                      <strong>{item.productCode || "-"}</strong>
                      <span>{item.itemName}</span>
                    </div>
                  </td>
                  <td className="align-right">{item.quantity}</td>
                  <td className="align-center">{item.unit}</td>
                  <td className="align-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="align-right">{item.discountLabel}</td>
                  <td className="align-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="sale-order-preview-summary-grid">
          <div className="sale-order-preview-note-block">
            <div className="sale-order-preview-note-row">
              <span>หมายเหตุ</span>
              <strong>{summary.note || "-"}</strong>
            </div>
            <div className="sale-order-preview-note-text">{formatAmountText(summary.grandTotal)}</div>
          </div>

          <div className="sale-order-preview-totals-box">
            <div><span>รวมเงิน</span><strong>{formatCurrency(summary.subtotal)}</strong></div>
            <div><span>{summary.tradeDiscountLabel}</span><strong>{formatCurrency(summary.tradeDiscountAmount)}</strong></div>
            <div><span>ส่วนลดส่งเสริมการขาย</span><strong>{formatCurrency(summary.promotionDiscountAmount)}</strong></div>
            <div><span>เงินหลังหักส่วนลด</span><strong>{formatCurrency(summary.discountedNet)}</strong></div>
            <div><span>{summary.vatLabel}</span><strong>{formatCurrency(summary.vatAmount)}</strong></div>
            <div className="sale-order-preview-grand-total"><span>จำนวนเงินทั้งสิ้น</span><strong>{formatCurrency(summary.grandTotal)}</strong></div>
          </div>
        </section>

        <section className="sale-order-preview-signatures">
          {signatures.map((signature) => (
            <div className="sale-order-preview-signature-box" key={signature.title}>
              <span>{signature.title}</span>
              <div className="sale-order-preview-signature-line" />
              <strong>{signature.name}</strong>
              <small>{signature.date ? formatDate(signature.date) : "-"}</small>
            </div>
          ))}
        </section>
      </article>
    </div>
  );
}
