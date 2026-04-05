import React, { useState } from "react";
import { type InvoiceList, type Invoice } from "../interfaces/interfaces.tsx";
import { IconX } from "../assets/Icons.tsx";

const DetailRow: React.FC<{ label: string; value?: string | number | null; accent?: boolean; full?: boolean }> = ({ label, value, accent, full }) => (
    <div className={`il-detail-item${full ? " full" : ""}`}>
        <div className="il-detail-label">{label}</div>
        <div className={`il-detail-value${accent ? " accent" : ""}${value === undefined || value === null || value === "" ? " empty" : ""}`}>
            {value !== undefined && value !== null && value !== "" ? String(value) : "—"}
        </div>
    </div>
);

export const ViewModal: React.FC<{ invoice: InvoiceList; onClose: () => void; onEdit: () => void }> = ({ invoice, onClose, onEdit }) => (
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
                    <DetailRow label="Driver" value={invoice.driver?.name} />
                    <DetailRow label="Trailer" value={invoice.trailer?.regNo} />
                    <DetailRow label="Client" value={invoice.client?.name} />
                    <DetailRow label="Transport Firm" value={"Sreeji"} />
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

export const EditModal: React.FC<{ invoice: InvoiceList; onClose: () => void; onSave: (u: InvoiceList) => void }> = ({ invoice, onClose, onSave }) => {
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