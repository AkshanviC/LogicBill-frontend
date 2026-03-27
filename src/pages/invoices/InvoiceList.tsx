import React, { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Invoice {
  id: number;
  createdBy: number;
  templateId: number;
  date?: string;
  transportFirmId?: number;
  sac?: string;
  billNo?: string;
  pono?: string;
  vendorCode?: string;
  gstno?: string;
  pan?: string;
  trailerId?: number;
  driverId?: number;
  diesel?: string;
  driverBeta?: string;
  advance?: string;
  clientId?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginatedResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Filters {
  driverId: string;
  trailerId: string;
  clientId: string;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const API_BASE = "/invoices";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

const fetchInvoices = (page: number, limit: number, filters: Filters) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.driverId) params.set("driverId", filters.driverId);
  if (filters.trailerId) params.set("trailerId", filters.trailerId);
  if (filters.clientId) params.set("clientId", filters.clientId);
  return apiFetch<PaginatedResponse>(`${API_BASE}?${params.toString()}`);
};

const updateInvoice = (id: number, data: Partial<Invoice>) =>
  apiFetch<Invoice>(`${API_BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DATA: Invoice[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  createdBy: Math.floor(Math.random() * 3) + 1,
  templateId: Math.floor(Math.random() * 3) + 1,
  date: new Date(Date.now() - Math.random() * 1e10).toISOString(),
  transportFirmId: Math.floor(Math.random() * 4) + 1,
  sac: `996511`,
  billNo: `BILL-${1000 + i}`,
  pono: `PO-${2000 + i}`,
  vendorCode: `VC-${String(i + 1).padStart(3, "0")}`,
  gstno: `33AABCT1332L1ZU`,
  pan: `AABCT1332L`,
  trailerId: (i % 5) + 1,
  driverId: (i % 4) + 1,
  diesel: String(Math.floor(Math.random() * 200) + 50),
  driverBeta: String(Math.floor(Math.random() * 1000) + 200),
  advance: String(Math.floor(Math.random() * 5000)),
  clientId: (i % 3) + 1,
  createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
}));

function mockFetchInvoices(page: number, limit: number, search: string, filters: Filters): PaginatedResponse {
  let filtered = MOCK_DATA;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (inv) =>
        inv.billNo?.toLowerCase().includes(q) ||
        inv.pono?.toLowerCase().includes(q) ||
        inv.vendorCode?.toLowerCase().includes(q) ||
        inv.gstno?.toLowerCase().includes(q) ||
        String(inv.id).includes(q)
    );
  }
  if (filters.driverId) filtered = filtered.filter((inv) => inv.driverId === Number(filters.driverId));
  if (filters.trailerId) filtered = filtered.filter((inv) => inv.trailerId === Number(filters.trailerId));
  if (filters.clientId) filtered = filtered.filter((inv) => inv.clientId === Number(filters.clientId));

  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d0f12;
    --surface: #13161b;
    --surface-2: #1a1e25;
    --border: #252930;
    --accent: #e8ff47;
    --accent-dim: rgba(232, 255, 71, 0.12);
    --text: #e8eaed;
    --text-muted: #6b717d;
    --text-subtle: #9299a3;
    --danger: #ff5c5c;
    --success: #4dffb4;
    --radius: 10px;
    --font-display: 'Syne', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-display); }

  .il-root { min-height: 100vh; padding: 40px 32px; max-width: 1280px; margin: 0 auto; }

  /* Header */
  .il-header {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
  }
  .il-eyebrow {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.18em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 6px;
  }
  .il-title { font-size: 32px; font-weight: 800; color: var(--text); line-height: 1; }
  .il-title span { color: var(--accent); }

  /* Search */
  .il-search-wrap { position: relative; width: 260px; }
  .il-search-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none; display: flex;
  }
  .il-search {
    width: 100%; background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); color: var(--text); font-family: var(--font-mono);
    font-size: 13px; padding: 10px 14px 10px 38px; outline: none; transition: border-color 0.2s;
  }
  .il-search::placeholder { color: var(--text-muted); }
  .il-search:focus { border-color: var(--accent); }

  /* Filter bar */
  .il-filterbar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px; flex-wrap: wrap;
  }
  .il-filter-label {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted);
    display: flex; align-items: center; gap: 6px;
    white-space: nowrap;
  }
  .il-filter-select {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text); font-family: var(--font-mono);
    font-size: 12px; padding: 8px 28px 8px 12px; outline: none;
    cursor: pointer; transition: border-color 0.2s; appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b717d' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
    min-width: 148px;
  }
  .il-filter-select:focus { border-color: var(--accent); }
  .il-filter-select.active { border-color: var(--accent); color: var(--accent); background-color: var(--accent-dim); }

  /* Active filter chips */
  .il-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; min-height: 0; }
  .il-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--accent-dim); border: 1px solid rgba(232,255,71,0.25);
    border-radius: 20px; padding: 4px 10px 4px 12px;
    font-family: var(--font-mono); font-size: 11px; color: var(--accent);
    animation: chipIn 0.15s ease;
  }
  @keyframes chipIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:none } }
  .il-chip-remove {
    background: none; border: none; cursor: pointer; color: var(--accent);
    display: flex; align-items: center; opacity: 0.6; transition: opacity 0.15s; padding: 0;
  }
  .il-chip-remove:hover { opacity: 1; }
  .il-clear-all {
    background: none; border: none; cursor: pointer;
    font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
    text-decoration: underline; transition: color 0.15s; padding: 0;
  }
  .il-clear-all:hover { color: var(--danger); }

  /* Table card */
  .il-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
  }
  .il-table-wrap { overflow-x: auto; }
  .il-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .il-table thead tr { background: var(--surface-2); border-bottom: 1px solid var(--border); }
  .il-table th {
    padding: 13px 16px; text-align: left; font-family: var(--font-mono);
    font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-muted); white-space: nowrap; user-select: none;
  }
  .il-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.15s; }
  .il-table tbody tr:last-child { border-bottom: none; }
  .il-table tbody tr:hover { background: rgba(255,255,255,0.025); }
  .il-table td { padding: 14px 16px; color: var(--text-subtle); font-family: var(--font-mono); font-size: 12.5px; white-space: nowrap; }
  .il-table td.id-cell { color: var(--accent); font-weight: 500; }
  .il-table td.bill-no { color: var(--text); font-weight: 500; }

  /* ID badge */
  .il-id-badge {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    border-radius: 5px; padding: 2px 7px;
    font-size: 11.5px; font-family: var(--font-mono); color: var(--text-subtle);
  }
  .il-id-badge.driver  { background: rgba(77,200,255,0.07); border-color: rgba(77,200,255,0.2); color: #4dc8ff; }
  .il-id-badge.trailer { background: rgba(255,180,77,0.07); border-color: rgba(255,180,77,0.2); color: #ffb44d; }
  .il-id-badge.client  { background: rgba(180,77,255,0.07); border-color: rgba(180,77,255,0.2); color: #b44dff; }

  /* Actions */
  .il-actions { display: flex; gap: 8px; }
  .il-btn-icon {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
    background: transparent; color: var(--text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .il-btn-icon:hover { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }

  /* Pagination */
  .il-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-top: 1px solid var(--border);
    font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);
    flex-wrap: wrap; gap: 12px;
  }
  .il-page-btns { display: flex; gap: 6px; align-items: center; }
  .il-page-btn {
    min-width: 32px; height: 32px; padding: 0 8px; border-radius: 7px;
    border: 1px solid var(--border); background: transparent; color: var(--text-subtle);
    cursor: pointer; font-family: var(--font-mono); font-size: 12px; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .il-page-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  .il-page-btn.active { background: var(--accent); border-color: var(--accent); color: #0d0f12; font-weight: 600; }
  .il-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* States */
  .il-state { padding: 64px 24px; text-align: center; color: var(--text-muted); font-family: var(--font-mono); font-size: 13px; }
  .il-state-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.4; }
  .il-spinner {
    width: 24px; height: 24px; border: 2px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin 0.7s linear infinite; margin: 0 auto 12px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .il-error {
    background: rgba(255,92,92,0.08); border: 1px solid rgba(255,92,92,0.25);
    color: var(--danger); border-radius: var(--radius); padding: 12px 16px;
    font-family: var(--font-mono); font-size: 12.5px; margin-bottom: 20px;
    display: flex; align-items: center; gap: 10px;
  }

  /* Modal */
  .il-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 1000;
    padding: 24px; animation: fadeIn 0.15s ease;
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .il-modal {
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto;
    animation: slideUp 0.2s ease;
  }
  @keyframes slideUp { from { transform: translateY(16px); opacity:0 } to { transform:none; opacity:1 } }
  .il-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 24px 16px; border-bottom: 1px solid var(--border);
    position: sticky; top: 0; background: var(--surface); z-index: 1;
  }
  .il-modal-title { font-size: 16px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 10px; }
  .il-modal-tag {
    font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 5px;
    background: var(--accent-dim); color: var(--accent); letter-spacing: 0.1em; text-transform: uppercase;
  }
  .il-modal-close {
    width: 30px; height: 30px; border-radius: 7px; border: 1px solid var(--border);
    background: transparent; color: var(--text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .il-modal-close:hover { background: var(--surface-2); color: var(--text); }
  .il-modal-body { padding: 24px; }
  .il-modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 16px 24px 24px; border-top: 1px solid var(--border); margin-top: 24px;
  }

  /* Detail grid */
  .il-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .il-detail-item { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; }
  .il-detail-item.full { grid-column: 1 / -1; }
  .il-detail-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 5px; }
  .il-detail-value { font-family: var(--font-mono); font-size: 13px; color: var(--text); word-break: break-all; }
  .il-detail-value.accent { color: var(--accent); }
  .il-detail-value.empty { color: var(--text-muted); font-style: italic; }

  /* Edit form */
  .il-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .il-form-group { display: flex; flex-direction: column; gap: 6px; }
  .il-form-group.full { grid-column: 1 / -1; }
  .il-form-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }
  .il-form-input {
    background: var(--surface-2); border: 1px solid var(--border); border-radius: 7px;
    color: var(--text); font-family: var(--font-mono); font-size: 12.5px;
    padding: 9px 12px; outline: none; transition: border-color 0.2s; width: 100%;
  }
  .il-form-input:focus { border-color: var(--accent); }
  .il-form-input::placeholder { color: var(--text-muted); }

  /* Buttons */
  .il-btn { padding: 9px 20px; border-radius: 8px; font-family: var(--font-display); font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
  .il-btn-ghost { background: transparent; border-color: var(--border); color: var(--text-subtle); }
  .il-btn-ghost:hover { border-color: var(--text-muted); color: var(--text); }
  .il-btn-primary { background: var(--accent); color: #0d0f12; }
  .il-btn-primary:hover { opacity: 0.88; }
  .il-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Toast */
  .il-toast {
    position: fixed; bottom: 28px; right: 28px; background: var(--surface-2);
    border: 1px solid var(--border); border-radius: 10px; padding: 13px 18px;
    font-family: var(--font-mono); font-size: 12.5px; color: var(--text); z-index: 2000;
    display: flex; align-items: center; gap: 10px; animation: slideIn 0.2s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .il-toast.success { border-color: rgba(77,255,180,0.3); color: var(--success); }
  .il-toast.error   { border-color: rgba(255,92,92,0.3);  color: var(--danger);  }
  @keyframes slideIn { from { transform: translateX(16px); opacity:0 } to { transform:none; opacity:1 } }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconEye = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IconChevLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>;
const IconChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const IconFilter = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;

// ─── Filter option sets (replace IDs with real fetched data) ──────────────────

const DRIVER_OPTIONS = [1, 2, 3, 4];
const TRAILER_OPTIONS = [1, 2, 3, 4, 5];
const CLIENT_OPTIONS = [1, 2, 3];

// ─── Sub-components ───────────────────────────────────────────────────────────

const DetailRow: React.FC<{ label: string; value?: string | number | null; accent?: boolean; full?: boolean }> = ({ label, value, accent, full }) => (
  <div className={`il-detail-item${full ? " full" : ""}`}>
    <div className="il-detail-label">{label}</div>
    <div className={`il-detail-value${accent ? " accent" : ""}${value === undefined || value === null || value === "" ? " empty" : ""}`}>
      {value !== undefined && value !== null && value !== "" ? String(value) : "—"}
    </div>
  </div>
);

const ViewModal: React.FC<{ invoice: Invoice; onClose: () => void; onEdit: () => void }> = ({ invoice, onClose, onEdit }) => (
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

const EditModal: React.FC<{ invoice: Invoice; onClose: () => void; onSave: (u: Invoice) => void }> = ({ invoice, onClose, onSave }) => {
  const [form, setForm] = useState<Invoice>({ ...invoice });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Invoice) => (e: React.ChangeEvent<HTMLInputElement>) => {
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

interface Toast { id: number; message: string; type: "success" | "error"; }

const EMPTY_FILTERS: Filters = { driverId: "", trailerId: "", clientId: "" };
const LIMIT = 8;

const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
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
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => { setFilters(EMPTY_FILTERS); setPage(1); };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      // Replace with: fetchInvoices(page, LIMIT, filters).then(res => { ... })
      const res = mockFetchInvoices(page, LIMIT, debouncedSearch, filters);
      setInvoices(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters]);

  const handleSave = (updated: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
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
      <style>{styles}</style>
      <div className="il-root">

        {/* Header */}
        <div className="il-header">
          <div>
            <div className="il-eyebrow">Finance Module</div>
            <h1 className="il-title">Invoice<span>s</span></h1>
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
            {DRIVER_OPTIONS.map((id) => (
              <option key={id} value={id}>Driver #{id}</option>
            ))}
          </select>

          <select
            className={`il-filter-select${filters.trailerId ? " active" : ""}`}
            value={filters.trailerId}
            onChange={(e) => setFilter("trailerId", e.target.value)}
          >
            <option value="">All Trailers</option>
            {TRAILER_OPTIONS.map((id) => (
              <option key={id} value={id}>Trailer #{id}</option>
            ))}
          </select>

          <select
            className={`il-filter-select${filters.clientId ? " active" : ""}`}
            value={filters.clientId}
            onChange={(e) => setFilter("clientId", e.target.value)}
          >
            <option value="">All Clients</option>
            {CLIENT_OPTIONS.map((id) => (
              <option key={id} value={id}>Client #{id}</option>
            ))}
          </select>

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
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={10}><div className="il-state">
                    <div className="il-state-icon">◻</div>
                    {activeFilterCount > 0 || debouncedSearch ? "No invoices match the current filters" : "No invoices found"}
                  </div></td></tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="id-cell">{inv.id}</td>
                      <td className="bill-no">{inv.billNo ?? "—"}</td>
                      <td>{inv.pono ?? "—"}</td>
                      <td>{inv.driverId ? <span className="il-id-badge driver" >D-{inv.driverId}</span> : "—"}</td>
                      <td>{inv.trailerId ? <span className="il-id-badge trailer">T-{inv.trailerId}</span> : "—"}</td>
                      <td>{inv.clientId ? <span className="il-id-badge client" >C-{inv.clientId}</span> : "—"}</td>
                      <td>{inv.diesel ?? "—"}</td>
                      <td>{inv.advance ?? "—"}</td>
                      <td>{inv.date ? new Date(inv.date).toLocaleDateString() : "—"}</td>
                      <td>
                        <div className="il-actions">
                          <button className="il-btn-icon" title="View" onClick={() => setViewInvoice(inv)}><IconEye /></button>
                          <button className="il-btn-icon" title="Edit" onClick={() => setEditInvoice(inv)}><IconEdit /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && invoices.length > 0 && (
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

export default InvoiceList;