import React, { useEffect, useMemo, useState } from "react";
import { LuChevronLeft, LuChevronRight, LuArrowUpDown, LuArrowUp, LuArrowDown, LuSearch } from "react-icons/lu";
import { EmptyState } from "./ui.jsx";

/**
 * Generic sortable, paginated table.
 * columns: [{ key, label, render?(row), sortValue?(row), className?, sortable? }]
 */
export function DataTable({
  columns, rows, rowKey = (r) => r.id, pageSize = 10, onRowClick, selectedKey,
  renderExpanded, expandedKey, emptyTitle = "No matching records", emptyMessage = "Try adjusting your search or filters.", emptyAction,
  initialSort,
}) {
  const [sort, setSort] = useState(initialSort || null);
  const [page, setPage] = useState(0);

  useEffect(() => setPage(0), [rows.length]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = col?.sortValue || ((r) => r[sort.key]);
    return [...rows].sort((a, b) => {
      const va = get(a), vb = get(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const view = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const toggle = (key) =>
    setSort((s) => (!s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  if (!rows.length) {
    return <EmptyState icon={LuSearch} title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }

  return (
    <>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              {columns.map((c) => {
                const sortable = c.sortable !== false && c.label;
                const active = sort?.key === c.key;
                return (
                  <th key={c.key} className={`${sortable ? "sortable" : ""} ${c.className || ""}`} onClick={sortable ? () => toggle(c.key) : undefined}
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {c.label}
                      {sortable && (active ? (sort.dir === "asc" ? <LuArrowUp size={12} /> : <LuArrowDown size={12} />) : <LuArrowUpDown size={11} style={{ opacity: 0.4 }} />)}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {view.map((r) => {
              const k = rowKey(r);
              return (
                <React.Fragment key={k}>
                  <tr className={`${onRowClick ? "clickable" : ""} ${selectedKey === k ? "selected" : ""}`} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                    {columns.map((c) => (
                      <td key={c.key} className={c.className}>{c.render ? c.render(r) : r[c.key]}</td>
                    ))}
                  </tr>
                  {renderExpanded && expandedKey === k && (
                    <tr className="expand-row"><td colSpan={columns.length}>{renderExpanded(r)}</td></tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="table-foot">
        <span>Showing {page * pageSize + 1}–{Math.min(sorted.length, (page + 1) * pageSize)} of {sorted.length}</span>
        {pages > 1 && (
          <div className="pager">
            <button className="btn sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><LuChevronLeft size={14} /></button>
            <span>Page {page + 1} of {pages}</span>
            <button className="btn sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><LuChevronRight size={14} /></button>
          </div>
        )}
      </div>
    </>
  );
}
