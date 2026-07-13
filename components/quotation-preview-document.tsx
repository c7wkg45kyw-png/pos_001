"use client";

import type { A4PreviewLayout } from "@/services/a4-preview";
import { formatCurrency, formatDate } from "@/utils/format";

export type QuotationPreviewLineItem = {
  id: string;
  lineOrder?: number;
  productCode: string;
  productName: string;
  description?: string;
  features?: string[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageDataUrl?: string;
};

type QuotationPreviewDocumentProps = {
  seller: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  buyer: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  meta: {
    quotationNo: string;
    date: string;
    sales: string;
  };
  lineItems: QuotationPreviewLineItem[];
  subtotal: number;
  vatLabel: string;
  vatAmount: number;
  netTotal: number;
  terms: string;
  paymentMethod: string;
  layout: A4PreviewLayout;
};

type PreviewPage = {
  items: QuotationPreviewLineItem[];
  isLast: boolean;
};

const MAX_PAGE_HEIGHT_PX = 980;
const PAGE_HEADER_HEIGHT_PX = 210;
const FOLLOWING_PAGE_HEADER_HEIGHT_PX = 0;
const TABLE_HEADER_HEIGHT_PX = 42;
const PAGE_BOTTOM_BUFFER_PX = 28;
const SUMMARY_HEIGHT_PX = 144;

function estimateTextLines(text: string, charsPerLine: number) {
  return Math.max(1, Math.ceil(text.trim().length / charsPerLine));
}

function estimateTermsHeight(terms: string) {
  return 48 + estimateTextLines(terms || "-", 92) * 18;
}

function estimateLineItemHeight(item: QuotationPreviewLineItem) {
  const featureLines = (item.features ?? []).reduce((sum, feature) => sum + estimateTextLines(feature, 48), 0);
  const descriptionLines = estimateTextLines(item.description || "-", 54) + featureLines;
  const detailHeight = 28 + descriptionLines * 16;
  return Math.max(98, detailHeight);
}

function paginateLineItems(items: QuotationPreviewLineItem[], terms: string): PreviewPage[] {
  if (items.length === 0) {
    return [{ items: [], isLast: true }];
  }

  const pages: PreviewPage[] = [];
  let cursor = 0;
  let isFirstPage = true;

  while (cursor < items.length) {
    const remaining = items.slice(cursor);
    const remainingHeight = remaining.reduce((sum, item) => sum + estimateLineItemHeight(item), 0);
    const pageHeaderHeight = isFirstPage ? PAGE_HEADER_HEIGHT_PX : FOLLOWING_PAGE_HEADER_HEIGHT_PX;
    const regularCapacity = MAX_PAGE_HEIGHT_PX - pageHeaderHeight - TABLE_HEADER_HEIGHT_PX - PAGE_BOTTOM_BUFFER_PX;
    const finalCapacity = regularCapacity - SUMMARY_HEIGHT_PX - estimateTermsHeight(terms);
    const isLastPage = remainingHeight <= finalCapacity;
    const capacity = isLastPage ? finalCapacity : regularCapacity;

    let used = 0;
    let take = 0;
    while (cursor + take < items.length) {
      const nextHeight = estimateLineItemHeight(items[cursor + take]);
      if (take > 0 && used + nextHeight > capacity) {
        break;
      }
      used += nextHeight;
      take += 1;
    }

    pages.push({
      items: items.slice(cursor, cursor + Math.max(take, 1)),
      isLast: false
    });
    cursor += Math.max(take, 1);
    isFirstPage = false;
  }

  if (pages.length > 0) {
    pages[pages.length - 1].isLast = true;
  }
  return pages;
}

export function QuotationPreviewDocument({
  seller,
  buyer,
  meta,
  lineItems,
  subtotal,
  vatLabel,
  vatAmount,
  netTotal,
  terms,
  paymentMethod,
  layout
}: QuotationPreviewDocumentProps) {
  const pages = paginateLineItems(lineItems, terms);

  function descriptionLines(item: QuotationPreviewLineItem) {
    const lines = [item.description || "-"];
    for (const feature of item.features ?? []) {
      const normalized = feature.trim().replace(/^- /, "");
      if (normalized) {
        lines.push(`- ${normalized}`);
      }
    }
    return lines;
  }

  return (
    <div className="print-document">
      {pages.map((page, pageIndex) => (
        <article className="print-sheet" key={`print-page-${pageIndex + 1}`}>
          {pageIndex === 0 ? (
            <section className="print-header print-header-with-meta" style={{ gap: layout.headerGap, marginBottom: layout.metaGap }}>
              <div className="print-party-group">
                <div className="print-party" style={{ fontSize: layout.sellerFontSize }}>
                  <h3>Seller</h3>
                  <strong>{seller.name}</strong>
                  <p>{seller.address}</p>
                  {seller.phone ? <p>{seller.phone}</p> : null}
                  {seller.email ? <p>{seller.email}</p> : null}
                </div>
                <div className="print-party" style={{ fontSize: layout.buyerFontSize }}>
                  <h3>Buyer</h3>
                  <strong>{buyer.name}</strong>
                  <p>{buyer.address}</p>
                  {buyer.phone ? <p>{buyer.phone}</p> : null}
                  {buyer.email ? <p>{buyer.email}</p> : null}
                </div>
              </div>
              <div className="print-meta-panel print-meta-panel-compact" style={{ fontSize: layout.metaFontSize, maxWidth: layout.metaPanelWidth }}>
                <div className="print-meta-row">
                  <span>Quotation No.</span>
                  <strong>{meta.quotationNo}</strong>
                </div>
                <div className="print-meta-row">
                  <span>Date</span>
                  <strong>{formatDate(meta.date)}</strong>
                </div>
                <div className="print-meta-row">
                  <span>Sales</span>
                  <strong>{meta.sales}</strong>
                </div>
              </div>
            </section>
          ) : null}

          <div className="print-table-wrap" style={{ width: `${layout.tableWidth}%` }}>
            <table className="print-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>SKU</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {page.items.map((line) => (
                  <tr key={line.id} className="print-line-row">
                    <td>{line.lineOrder ?? "-"}</td>
                    <td>
                      <div className="print-sku">
                        <div className="print-product-thumb">
                          {line.imageDataUrl ? (
                            <img src={line.imageDataUrl} alt={line.productName} className="print-product-thumb-image" />
                          ) : (
                            line.productCode || "-"
                          )}
                        </div>
                        <strong>{line.productName}</strong>
                        <div>{line.productCode || "-"}</div>
                      </div>
                    </td>
                    <td>
                      <div className="print-description">
                        {descriptionLines(line).map((text, index) => (
                          <p key={`${line.id}-desc-${index}`}>{text}</p>
                        ))}
                      </div>
                    </td>
                    <td>{line.quantity}</td>
                    <td>{formatCurrency(line.unitPrice)}</td>
                    <td>{formatCurrency(line.lineTotal)}</td>
                  </tr>
                ))}
                {page.isLast ? (
                  <tr className="print-summary-row">
                    <td className="print-summary-spacer" />
                    <td className="print-summary-spacer" />
                    <td className="print-summary-label">
                      <div>Subtotal before VAT</div>
                      <div>{vatLabel}</div>
                      <div>Net Total</div>
                    </td>
                    <td className="print-summary-spacer" />
                    <td className="print-summary-spacer" />
                    <td className="print-summary-value">
                      <div>{formatCurrency(subtotal)}</div>
                      <div>{formatCurrency(vatAmount)}</div>
                      <div>{formatCurrency(netTotal)}</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {page.isLast ? (
            <section className="print-terms" style={{ marginTop: layout.termsTop, fontSize: layout.termsFontSize }}>
              <strong>TERMS</strong>
              <p>{terms || "-"}</p>
              <strong>PAYMENT METHOD</strong>
              <p>{paymentMethod || "-"}</p>
            </section>
          ) : null}
        </article>
      ))}
    </div>
  );
}
