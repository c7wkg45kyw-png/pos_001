"use client";

export function SkeletonMetrics({ count = 3 }: { count?: number }) {
  return (
    <div className="grid cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div className="card metric skeleton-card" key={index}>
          <div className="skeleton-line skeleton-line-short" />
          <div className="skeleton-line skeleton-line-tall" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-shell">
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index}>
                  <div className="skeleton-line skeleton-line-header" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((__, columnIndex) => (
                  <td key={columnIndex}>
                    <div className="skeleton-line" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonFilters({ count = 4 }: { count?: number }) {
  return (
    <section className="section">
      <div className="quotation-filter-bar">
        {Array.from({ length: count }).map((_, index) => (
          <div className="field" key={index}>
            <div className="skeleton-line skeleton-line-short" />
            <div className="skeleton-input" />
          </div>
        ))}
      </div>
    </section>
  );
}
