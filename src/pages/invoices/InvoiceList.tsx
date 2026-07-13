import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Clients, Drivers, Trailers, InvoiceList, Filters, Toast, Address } from "../../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import { EditModal, ViewModal } from "../../components/invoices";
import { IconChevLeft, IconChevRight, IconEdit, IconEye, IconFilter, IconPrint, IconSearch, IconX } from "../../assets/Icons.tsx";
import Spinner from "../../components/spinner.tsx";
// const updateInvoice = (id: number, data: Partial<Invoice>) =>
//   apiFetch<Invoice>(`${import.meta.env.VITE_APP_API_URL}/${id}`, { method: "PUT", body: JSON.stringify(data) });

// ─── Main Component ───────────────────────────────────────────────────────────

const EMPTY_FILTERS: Filters = { driverId: "", trailerId: "", clientId: "", addressId: "" };
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
  const [addressList, setAddressList] = useState<Address[]>([]); // Replace 'any' with the correct type for addresses
  const [filterDate, setFilterDate] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [printLoad, setPrintLoad] = useState(false);
  const toastId = React.useRef(0);
  // state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const isAllSelected = invoiceList.length > 0 && invoiceList.every(inv => selectedIds.has(inv.id));
  const isIndeterminate = invoiceList.some(inv => selectedIds.has(inv.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        invoiceList.forEach(inv => next.delete(inv.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        invoiceList.forEach(inv => next.add(inv.id));
        return next;
      });
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = (id: number | "multiple") => {
    if (printLoad) return;
    setPrintLoad(true);
    let user = localStorage.getItem("user");
    if (user) {
      user = JSON.parse(user);
    }
    if (id === "multiple") {
      if (selectedIds.size === 0) {
        addToast("Please select at least one invoice to generate.", "error");
        setPrintLoad(false);
        return;
      }
      console.log("Generating multiple invoices for IDs:", Array.from(selectedIds), selectedIds);
      fetch(`${import.meta.env.VITE_APP_API_URL}/api/invoices/generate`, { method: "POST", body: JSON.stringify({ invoiceIds: Array.from(selectedIds), createdBy: (user as any)?.id }), headers: { "Content-Type": "application/json" } }).then(res => res.blob()).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoices.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }).catch(err => console.error(err)).finally(() => setPrintLoad(false));
      return;
    }
    else {
      fetch(`${import.meta.env.VITE_APP_API_URL}/api/invoices/generate/${id}`,
        {
          method: "POST",
          body: JSON.stringify({ invoiceIds: Array.from(selectedIds), createdBy: (user as any)?.id }),
          headers: { "Content-Type": "application/json" }
        }).then(res => res.blob()).then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `invoice_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }).catch(err => console.error(err)).finally(() => setPrintLoad(false));
    }
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
    fetch(`${import.meta.env.VITE_APP_API_URL}/api/addresses/all`).then(res => res.json()).then(res => setAddressList(res)).catch(err => console.error(err));

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
      if (filters.addressId) params.set("addressId", filters.addressId);
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
    addressId: "Address",
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
            <button className="il-btn il-btn-primary" onClick={() => handleGenerate("multiple")} disabled={printLoad}>
              {printLoad ? <Spinner /> : "Generate Invoice"}
            </button>
          </div>
          {/* // replace your button with this */}
          <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="il-btn il-btn-primary"
              onClick={() => setDropdownOpen(prev => !prev)}
            >
              Create ▾
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: '160px',
                zIndex: 1000,
                overflow: 'hidden',
              }}>
                <div
                  onClick={() => { navigate('/create-invoice'); setDropdownOpen(false); }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', color: 'black' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#3b81fa')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  Create Invoice
                </div>
                <div
                  onClick={() => { navigate('/create-user'); setDropdownOpen(false); }}
                  style={{ padding: '10px 16px', cursor: 'pointer', fontSize: '14px', color: 'black' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#3b81fa')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  Create User
                </div>
              </div>
            )}
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
          <select
            className={`il-filter-select${filters.addressId ? " active" : ""}`}
            value={filters.addressId}
            onChange={(e) => setFilter("addressId", e.target.value)}
          >
            <option value="">All Addresses</option>
            {addressList.map((value) => (
              <option key={value.id} value={value.id}>From: {value.from} To: {value.to}</option>
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
                  <th>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                      onChange={handleSelectAll}
                    />
                  </th>
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
                          <button disabled={printLoad} className="il-btn-icon" title="Print" onClick={() => handleGenerate(inv.id)}>
                            {<IconPrint />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(inv.id)}
                          onChange={() => handleSelectRow(inv.id)}
                        />
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