"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

export function DataTable({
  headers,
  rows,
  pageSize = 10,
  pagination = true
}: {
  headers: ReactNode[];
  rows: ReactNode[][];
  pageSize?: number;
  pagination?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [selectedPageSize, setSelectedPageSize] = useState(pageSize);
  const effectivePageSize = pagination ? selectedPageSize : Math.max(rows.length, 1);
  const pageCount = Math.max(1, Math.ceil(rows.length / effectivePageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedRows = useMemo(
    () => rows.slice((currentPage - 1) * effectivePageSize, currentPage * effectivePageSize),
    [currentPage, effectivePageSize, rows]
  );

  useEffect(() => {
    setPage(1);
  }, [rows.length, selectedPageSize, pagination]);

  return (
    <div className="table-shell">
      <div className="sales-live-table-card">
        <table className="sales-live-table sales-live-table-compact">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row, index) => (
                <tr key={`${currentPage}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="empty-cell">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="pagination">
          <span>{rows.length === 0 ? "0 records" : `Page ${currentPage} of ${pageCount} (${rows.length} records)`}</span>
          <div className="row-actions">
            <label className="page-size-control">
              <span>Rows</span>
              <select value={selectedPageSize} onChange={(event) => setSelectedPageSize(Number(event.target.value))}>
                {[5, 10, 20, 50].map((size) => (
                  <option value={size} key={size}>{size}</option>
                ))}
              </select>
            </label>
            <button className="button compact" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <button className="button compact" type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage === pageCount}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
