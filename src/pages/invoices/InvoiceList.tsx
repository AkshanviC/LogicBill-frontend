import React, { useState, useEffect, useCallback } from "react";
import type { Clients, Drivers, Trailers, InvoiceList, Filters, Invoice, Toast } from "../../interfaces/interfaces";

// const updateInvoice = (id: number, data: Partial<Invoice>) =>
//   apiFetch<Invoice>(`${import.meta.env.VITE_APP_API_URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconEye = () => <svg width="48" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IconChevLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
const IconChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IconFilter = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const IconPrint = () => <svg fill="#000000" width="800px" height="800px" viewBox="-2 -2 24 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin"><path d='M16 4h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-1V9H4v7H3a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1v2h12V4zM6 20v-9h8v9H6zM6 4V0h8v4H6z' /></svg>
// ─── Sub-components ───────────────────────────────────────────────────────────

const DetailRow: React.FC<{ label: string; value?: string | number | null; accent?: boolean; full?: boolean }> = ({ label, value, accent, full }) => (
  <div className={`il-detail-item${full ? " full" : ""}`}>
    <div className="il-detail-label">{label}</div>
    <div className={`il-detail-value${accent ? " accent" : ""}${value === undefined || value === null || value === "" ? " empty" : ""}`}>
      {value !== undefined && value !== null && value !== "" ? String(value) : "—"}
    </div>
  </div>
);

const ViewModal: React.FC<{ invoice: InvoiceList; onClose: () => void; onEdit: () => void }> = ({ invoice, onClose, onEdit }) => (
  <div className="il-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="il-modal">
      <div className="il-modal-header">
        <div className="il-modal-title">Invoice Details <span className="il-modal-tag">#{invoice.id}</span></div>
        <button className="il-modal-close" onClick={onClose}><IconX /></button>
      </div>
      <div className="il-modal-body">
        <div className="il-detail-grid">
          <DetailRow label="Bill No" value={invoice.billNo} accent />
          <DetailRow label="PO No" value={invoice.pono} />
          <DetailRow label="Vendor Code" value={invoice.vendorCode} />
          <DetailRow label="SAC" value={invoice.sac} />
          <DetailRow label="GST No" value={invoice.gstno} />
          <DetailRow label="PAN" value={invoice.pan} />
          <DetailRow label="Driver ID" value={invoice.driverId} />
          <DetailRow label="Trailer ID" value={invoice.trailerId} />
          <DetailRow label="Client ID" value={invoice.clientId} />
          <DetailRow label="Transport Firm ID" value={invoice.transportFirmId} />
          <DetailRow label="Diesel" value={invoice.diesel} />
          <DetailRow label="Driver Beta" value={invoice.driverBeta} />
          <DetailRow label="Advance" value={invoice.advance} />
          <DetailRow label="Date" value={invoice.date ? new Date(invoice.date).toLocaleDateString() : undefined} />
          <DetailRow label="Template ID" value={invoice.templateId} />
          <DetailRow label="Created By" value={invoice.createdBy} />
          {invoice.createdAt && <DetailRow label="Created At" value={new Date(invoice.createdAt).toLocaleString()} full />}
        </div>
      </div>
      <div className="il-modal-footer">
        <button className="il-btn il-btn-ghost" onClick={onClose}>Close</button>
        <button className="il-btn il-btn-primary" onClick={onEdit}>Edit Invoice</button>
      </div>
    </div>
  </div>
);

const EditModal: React.FC<{ invoice: InvoiceList; onClose: () => void; onSave: (u: InvoiceList) => void }> = ({ invoice, onClose, onSave }) => {
  const [form, setForm] = useState<InvoiceList>({ ...invoice });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof InvoiceList) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      [key]: ["createdBy", "templateId", "transportFirmId", "trailerId", "driverId", "clientId"].includes(key)
        ? val === "" ? undefined : Number(val)
        : val,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Replace with: await updateInvoice(invoice.id, form);
      await new Promise((r) => setTimeout(r, 600));
      onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof Invoice, type = "text", full = false) => (
    <div className={`il-form-group${full ? " full" : ""}`}>
      <label className="il-form-label">{label}</label>
      <input className="il-form-input" type={type} value={(form[key] as string | number) ?? ""} onChange={set(key)} placeholder={`Enter ${label.toLowerCase()}`} />
    </div>
  );

  return (
    <div className="il-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="il-modal">
        <div className="il-modal-header">
          <div className="il-modal-title">Edit Invoice <span className="il-modal-tag">#{invoice.id}</span></div>
          <button className="il-modal-close" onClick={onClose}><IconX /></button>
        </div>
        <div className="il-modal-body">
          <div className="il-form-grid">
            {field("Bill No", "billNo")}
            {field("PO No", "pono")}
            {field("Vendor Code", "vendorCode")}
            {field("SAC", "sac")}
            {field("GST No", "gstno")}
            {field("PAN", "pan")}
            {field("Driver ID", "driverId", "number")}
            {field("Trailer ID", "trailerId", "number")}
            {field("Client ID", "clientId", "number")}
            {field("Transport Firm ID", "transportFirmId", "number")}
            {field("Diesel", "diesel")}
            {field("Driver Beta", "driverBeta")}
            {field("Advance", "advance")}
            {field("Date", "date", "date", true)}
          </div>
        </div>
        <div className="il-modal-footer">
          <button className="il-btn il-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="il-btn il-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = { driverId: "", trailerId: "", clientId: "" };
const LIMIT = 10;

const InvoiceListComponent: React.FC = () => {
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
                  <th>Advance</th>
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
                      <td>{inv.advance ?? "—"}</td>
                      <td>{inv.date ? new Date(inv.date).toLocaleDateString() : "—"}</td>
                      <td>
                        <div className="il-actions">
                          <button className="il-btn-icon" title="View" onClick={() => setViewInvoice(inv)}><IconEye /></button>
                          <button className="il-btn-icon" title="Edit" onClick={() => setEditInvoice(inv)}><IconEdit /></button>
                          <button className="il-btn-icon" title="Edit" onClick={() => setEditInvoice(inv)}><IconPrint /></button>
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