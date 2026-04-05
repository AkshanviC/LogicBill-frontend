import React, { useState, useEffect, useCallback } from "react";
import type { Clients, Drivers, Trailers, InvoiceList, Filters, Toast } from "../../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import { EditModal, ViewModal } from "../../components/invoices";
import { IconChevLeft, IconChevRight, IconEdit, IconEye, IconFilter, IconPrint, IconSearch, IconX } from "../../assets/Icons.tsx";

// const updateInvoice = (id: number, data: Partial<Invoice>) =>
//   apiFetch<Invoice>(`${import.meta.env.VITE_APP_API_URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = { driverId: "", trailerId: "", clientId: "" };
const LIMIT = 10;

const InvoiceListComponent: React.FC = () => {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(LIMIT);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<InvoiceList | null>(null);
  const [editInvoice, setEditInvoice] = useState<InvoiceList | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [driverList, setDriverList] = useState<Drivers[]>([]);
  const [trailerList, setTrailerList] = useState<Trailers[]>([]);
  const [clientList, setClientList] = useState<Clients[]>([]);
  const [invoiceList, setInvoiceList] = useState<InvoiceList[]>([]);
  const [filterDate, setFilterDate] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const toastId = React.useRef(0);
  const create = () => {
    navigate("/create-invoice");
  }
  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  const setFilter = (key: keyof Filters, val: string) => {
    console.log(key, val, "filter pair");
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_API_URL}/api/drivers/`).then(res => res.json()).then(res => setDriverList(res.data)).catch(err => console.error(err));
    fetch(`${import.meta.env.VITE_APP_API_URL}/api/trailers/`).then(res => res.json()).then(res => setTrailerList(res.data)).catch(err => console.error(err));
    fetch(`${import.meta.env.VITE_APP_API_URL}/api/clients/`).then(res => res.json()).then(res => setClientList(res.data)).catch(err => console.error(err));
    // 

  }, []);
  // Fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filters.driverId) params.set("driverId", filters.driverId);
      if (filters.trailerId) params.set("trailerId", filters.trailerId);
      if (filters.clientId) params.set("clientId", filters.clientId);
      if (filterDate.from) params.set("dateFrom", filterDate.from);
      if (filterDate.to) params.set("dateTo", filterDate.to);
      fetch(`${import.meta.env.VITE_APP_API_URL}/api/invoices/getInvoice??${params.toString()}`).then(res => res.json()).then(res => { setInvoiceList(res.data); setTotal(res.total); setTotalPages(res.totalPages) }).catch(err => console.log(err));
      // Replace with: fetchInvoices(page, LIMIT, filters).then(res => { ... })

      // const res = mockFetchInvoices(invoiceList, page, LIMIT, debouncedSearch, filters);
      // setInvoices(res.data);
      // setInvoiceList(res.data)
      ;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters, filterDate]);
  const handleSave = (updated: InvoiceList) => {
    // setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    setEditInvoice(null);
    setViewInvoice(null);
    addToast(`Invoice #${updated.id} updated successfully`);
  };

  const renderPageButtons = () => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("…");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages.map((p, i) =>
      p === "…"
        ? <span key={`e${i}`} style={{ color: "var(--text-muted)", padding: "0 4px", fontFamily: "var(--font-mono)", fontSize: 12 }}>…</span>
        : <button key={p} className={`il-page-btn${page === p ? " active" : ""}`} onClick={() => setPage(p as number)}>{p}</button>
    );
  };

  const CHIP_LABELS: Record<keyof Filters, string> = {
    driverId: "Driver",
    trailerId: "Trailer",
    clientId: "Client",
  };

  return (
    <>
      {/* <style>{styles}</style> */}
      <div className="il-root">

        {/* Header */}
        <div className="il-header">
          <div>
            <div className="il-eyebrow">Logic Bill</div>
            <h1 className="il-title">Data Table<span>s</span></h1>
          </div>
          <div className="il-search-wrap">
            <span className="il-search-icon"><IconSearch /></span>
            <input
              className="il-search"
              type="text"
              placeholder="Search invoices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <button className="il-btn il-btn-primary" onClick={create}>Create Invoice</button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="il-filterbar">
          <span className="il-filter-label"><IconFilter /> Filters</span>

          <select
            className={`il-filter-select${filters.driverId ? " active" : ""}`}
            value={filters.driverId}
            onChange={(e) => setFilter("driverId", e.target.value)}
          >
            <option value="">All Drivers</option>
            {driverList.map((value) => (
              <option key={value.id} value={value.id}>{value.name}</option>
            ))}
          </select>

          <select
            className={`il-filter-select${filters.trailerId ? " active" : ""}`}
            value={filters.trailerId}
            onChange={(e) => setFilter("trailerId", e.target.value)}
          >
            <option value="">All Trailers</option>
            {trailerList.map((value) => (
              <option key={value.id} value={value.id}>{value.regNo}</option>
            ))}
          </select>

          <select
            className={`il-filter-select${filters.clientId ? " active" : ""}`}
            value={filters.clientId}
            onChange={(e) => setFilter("clientId", e.target.value)}
          >
            <option value="">All Clients</option>
            {clientList.map((value) => (
              <option key={value.id} value={value.id}>Client #{value.name}</option>
            ))}
          </select>

          <input
            className="il-date"
            type="date"
            placeholder="mm-dd-yyyy"
            value={filterDate.from}
            onChange={(e) => setFilterDate({ ...filterDate, from: e.target.value })}
          />

          <input
            className="il-date"
            type="date"
            placeholder="dd-mm-yyyy"
            value={filterDate.to}
            onChange={(e) => setFilterDate({ ...filterDate, to: e.target.value })}
          />

          {activeFilterCount > 0 && (
            <button className="il-clear-all" onClick={clearFilters}>
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="il-chips">
            {(Object.keys(filters) as (keyof Filters)[]).map((key) =>
              filters[key] ? (
                <span key={key} className="il-chip">
                  {CHIP_LABELS[key]} #{filters[key]}
                  <button className="il-chip-remove" onClick={() => setFilter(key, "")}>
                    <IconX />
                  </button>
                </span>
              ) : null
            )}
          </div>
        )}

        {error && <div className="il-error">⚠ {error}</div>}

        {/* Table */}
        <div className="il-card">
          <div className="il-table-wrap">
            <table className="il-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Bill No</th>
                  <th>PO No</th>
                  <th>Driver</th>
                  <th>Trailer</th>
                  <th>Client</th>
                  <th>Diesel</th>
                  {/* <th>Advance</th> */}
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10}><div className="il-state"><div className="il-spinner" />Loading invoices…</div></td></tr>
                ) : invoiceList.length === 0 ? (
                  <tr><td colSpan={10}><div className="il-state">
                    <div className="il-state-icon">◻</div>
                    {activeFilterCount > 0 || debouncedSearch ? "No invoices match the current filters" : "No invoices found"}
                  </div></td></tr>
                ) : (
                  invoiceList.map((inv) => (
                    <tr key={inv.id}>
                      <td className="id-cell">{inv.id}</td>
                      <td className="bill-no">{inv.billNo ?? "—"}</td>
                      <td>{inv.pono ?? "—"}</td>
                      <td>{inv.driver ? <span className="il-id-badge driver" >{inv.driver?.name}</span> : "—"}</td>
                      <td>{inv.trailerId ? <span className="il-id-badge trailer">{inv.trailer?.regNo}</span> : "—"}</td>
                      <td>{inv.clientId ? <span className="il-id-badge client" >{inv.client?.name}</span> : "—"}</td>
                      <td>{inv.diesel ?? "—"}</td>
                      {/* <td>{inv.advance ?? "—"}</td> */}
                      <td>{inv.date ? new Date(inv.date).toLocaleDateString() : "—"}</td>
                      <td>
                        <div className="il-actions">
                          <button className="il-btn-icon" title="View" onClick={() => setViewInvoice(inv)}><IconEye /></button>
                          <button className="il-btn-icon" title="Edit" onClick={() => setEditInvoice(inv)}><IconEdit /></button>
                          <button className="il-btn-icon" title="Print" onClick={() => setEditInvoice(inv)}><IconPrint /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && invoiceList.length > 0 && (
            <div className="il-pagination">
              <span>Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} invoices</span>
              <div className="il-page-btns">
                <button className="il-page-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 1}><IconChevLeft /></button>
                {renderPageButtons()}
                <button className="il-page-btn" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}><IconChevRight /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewInvoice && (
        <ViewModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onEdit={() => { setEditInvoice(viewInvoice); setViewInvoice(null); }}
        />
      )}

      {editInvoice && (
        <EditModal
          invoice={editInvoice}
          onClose={() => setEditInvoice(null)}
          onSave={handleSave}
        />
      )}

      {toasts.map((t) => (
        <div key={t.id} className={`il-toast ${t.type}`}>
          {t.type === "success" ? "✓" : "✗"} {t.message}
        </div>
      ))}
    </>
  );
};

export default InvoiceListComponent;