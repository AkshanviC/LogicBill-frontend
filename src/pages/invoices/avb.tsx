import { useState, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface InvoiceRow {
    id: number;
    description: string;
    emptyPickup: string;
    stuffing: string;
    unload: string;
    containerSize: string;
    vehNo: string;
    conNo: string;
    qty20: string;
    qty40: string;
    amt20: string;
    amt40: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function toWords(num: number): string {
    if (!num || isNaN(num)) return "";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function convert(n: number): string {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
        if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
        if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
        return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
    }
    return "Rupees " + convert(Math.floor(num)) + " Only";
}

function fmt(n: string | number): string {
    const num = parseFloat(String(n)) || 0;
    return num.toLocaleString("en-IN");
}

const CONTAINER_SIZES = ["1x20FT", "1x40FT", "2x20FT", "2x40FT"] as const;
// type ContainerSize = typeof CONTAINER_SIZES[number];

const defaultRow = (): InvoiceRow => ({
    id: Date.now(),
    description: "Being the Transportation Charges",
    emptyPickup: "",
    stuffing: "",
    unload: "",
    containerSize: "1x20FT",
    vehNo: "",
    conNo: "",
    qty20: "",
    qty40: "",
    amt20: "",
    amt40: "",
});

// ── Sub-components ─────────────────────────────────────────────────────────
interface LabeledInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}

function LabeledInput({ label, value, onChange, placeholder = "", type = "text" }: LabeledInputProps) {
    return (
        <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#7c8db0", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                min={type === "number" ? 0 : undefined}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                style={{ width: "100%", border: "1.5px solid #e0e8f5", borderRadius: 7, padding: "6px 10px", fontSize: 13, outline: "none", background: "#fff", color: "#1a2340", transition: "border 0.15s" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e8f5")}
            />
        </div>
    );
}

interface RowEditorProps {
    row: InvoiceRow;
    index: number;
    canRemove: boolean;
    onChange: (field: keyof InvoiceRow, value: string) => void;
    onRemove: () => void;
}

function RowEditor({ row, index, canRemove, onChange, onRemove }: RowEditorProps) {
    return (
        <div style={{ background: "#f5f8ff", border: "1.5px solid #dde6f8", borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>Row {index + 1}</span>
                {canRemove && (
                    <button
                        onClick={onRemove}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
                    >
                        ✕ Remove
                    </button>
                )}
            </div>

            <div style={{ marginBottom: 10 }}>
                <LabeledInput label="Description" value={row.description} onChange={(v) => onChange("description", v)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <LabeledInput label="Empty Pickup (Location & Date)" value={row.emptyPickup} onChange={(v) => onChange("emptyPickup", v)} placeholder="e.g. ZIRCON MT PLOT (14.04.25)" />
                <LabeledInput label="Stuffing & Print Out" value={row.stuffing} onChange={(v) => onChange("stuffing", v)} placeholder="e.g. A S SHIPPING NUMBAL CFS (15.04.25)" />
                <LabeledInput label="Unload At" value={row.unload} onChange={(v) => onChange("unload", v)} placeholder="e.g. KATTUPALLI PORT (16.04.25)" />
                <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#7c8db0", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Container Size
                    </label>
                    <select
                        value={row.containerSize}
                        onChange={(e) => onChange("containerSize", e.target.value)}
                        style={{ width: "100%", border: "1.5px solid #e0e8f5", borderRadius: 7, padding: "6px 10px", fontSize: 13, background: "#fff", color: "#1a2340" }}
                    >
                        {CONTAINER_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <LabeledInput label="Vehicle No." value={row.vehNo} onChange={(v) => onChange("vehNo", v)} placeholder="e.g. TN05AK4833" />
                <LabeledInput label="Container No." value={row.conNo} onChange={(v) => onChange("conNo", v)} placeholder="e.g. ELNU2251010" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                <LabeledInput label="Qty 20'" value={row.qty20} onChange={(v) => onChange("qty20", v)} placeholder="0" type="number" />
                <LabeledInput label="Qty 40'" value={row.qty40} onChange={(v) => onChange("qty40", v)} placeholder="0" type="number" />
                <LabeledInput label="Rate 20' (Rs.)" value={row.amt20} onChange={(v) => onChange("amt20", v)} placeholder="0" type="number" />
                <LabeledInput label="Rate 40' (Rs.)" value={row.amt40} onChange={(v) => onChange("amt40", v)} placeholder="0" type="number" />
            </div>
        </div>
    );
}

// ── Invoice Preview ────────────────────────────────────────────────────────
interface InvoicePreviewProps {
    date: string;
    billNo: string;
    rows: InvoiceRow[];
    totalAmount: number;
    previewRef: React.RefObject<HTMLDivElement | null>;
}

function InvoicePreview({ date, billNo, rows, totalAmount, previewRef }: InvoicePreviewProps) {
    const thStyle: React.CSSProperties = { border: "1px solid #ccc", padding: "6px 8px", background: "#f0f0f0", fontWeight: "bold", fontSize: 11, textAlign: "center" };
    const tdStyle: React.CSSProperties = { border: "1px solid #ccc", padding: "6px 8px", fontSize: 11 };

    return (
        <div ref={previewRef} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(30,50,100,0.07)", overflow: "hidden", fontFamily: "Arial, sans-serif", fontSize: 12, color: "#222" }}>
            {/* Header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: "bold" }}>JAYALAKSHMI ROADLINES</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>FLEET OWNERS &amp; CONTAINER MOVERS</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>No.12/18, Thiruvalluvar Street, IInd Floor, Balakrishna Nagar, Thiruvottiyur, Chennai-600 019.</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>Email: jayalakshmiroadlines.chennai@gmail.com</div>
                </div>
                <div style={{ fontSize: 11, color: "#555", textAlign: "right" }}>
                    GST No: 33AOPPM9326Q2Z1<br />Cell: 9841819012<br />Cell: 8939724222
                </div>
            </div>

            {/* To + Ref */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #ccc" }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold", fontSize: 12 }}>AVB CARGO SERVICES</div>
                    <div style={{ fontSize: 11, color: "#444" }}>No:17, KAMARAJAR STREET (Govt School Opp), MEENAMBAKKAM, CHENNAI-600027</div>
                    <div style={{ fontSize: 11, color: "#444" }}>GST NO: 33ARRPB2281L1ZN | <em>Bill of Supply</em></div>
                </div>
                <div style={{ textAlign: "right", minWidth: 180 }}>
                    <table style={{ marginLeft: "auto", borderCollapse: "collapse" }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: "2px 6px", fontSize: 11, color: "#555" }}>Date:</td>
                                <td style={{ padding: "2px 6px", fontSize: 11, fontWeight: "bold" }}>{date || "—"}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "2px 6px", fontSize: 11, color: "#555" }}>Bill No:</td>
                                <td style={{ padding: "2px 6px", fontSize: 11, fontWeight: "bold" }}>{billNo || "—"}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th rowSpan={2} style={thStyle}>S.No</th>
                        <th rowSpan={2} style={{ ...thStyle, textAlign: "left" }}>Particulars</th>
                        <th colSpan={2} style={thStyle}>Qty</th>
                        <th colSpan={2} style={thStyle}>Amount (Rs.)</th>
                        <th rowSpan={2} style={thStyle}>Total (Rs.)</th>
                    </tr>
                    <tr>
                        {["20'", "40'", "20'", "40'"].map((h, i) => (
                            <th key={i} style={thStyle}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, idx) => {
                        const total =
                            (parseFloat(row.amt20) || 0) * (parseFloat(row.qty20) || 0) +
                            (parseFloat(row.amt40) || 0) * (parseFloat(row.qty40) || 0);
                        const lines = [
                            row.description,
                            row.emptyPickup ? `Empty Pickup: ${row.emptyPickup}` : null,
                            row.stuffing ? `Stuffing & Print Out: ${row.stuffing}` : null,
                            row.unload ? `Unload: ${row.unload}` : null,
                            [row.containerSize, row.vehNo ? `Veh: ${row.vehNo}` : null, row.conNo ? `Con: ${row.conNo}` : null]
                                .filter(Boolean).join(" | ") || null,
                        ].filter((l): l is string => Boolean(l));

                        return (
                            <tr key={row.id}>
                                <td style={{ ...tdStyle, textAlign: "center", verticalAlign: "top" }}>{idx + 1}</td>
                                <td style={{ ...tdStyle, verticalAlign: "top" }}>
                                    {lines.map((line, i) => <div key={i}>{line}</div>)}
                                </td>
                                <td style={{ ...tdStyle, textAlign: "right" }}>{row.qty20 || 0}</td>
                                <td style={{ ...tdStyle, textAlign: "right" }}>{row.qty40 || 0}</td>
                                <td style={{ ...tdStyle, textAlign: "right" }}>{row.amt20 ? fmt(row.amt20) : 0}</td>
                                <td style={{ ...tdStyle, textAlign: "right" }}>{row.amt40 ? fmt(row.amt40) : 0}</td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: total > 0 ? "bold" : "normal" }}>
                                    {total > 0 ? fmt(total) : 0}
                                </td>
                            </tr>
                        );
                    })}
                    <tr style={{ background: "#f9f9f9" }}>
                        <td colSpan={6} style={{ ...tdStyle, fontWeight: "bold" }}>
                            Total: {totalAmount > 0 ? toWords(totalAmount) : "—"}
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold" }}>
                            {totalAmount > 0 ? fmt(totalAmount) : "—"}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #ccc" }}>
                <div style={{ fontSize: 11 }}>
                    <strong>Bank Details</strong><br />
                    AXIS BANK<br />
                    Jayalakshmi Roadlines<br />
                    A/C No: 912020026510622<br />
                    Branch: Thiruvottiyur<br />
                    IFSC Code: UTIB0001619
                </div>
                <div style={{ fontSize: 11, textAlign: "right" }}>
                    For JAYALAKSHMI ROAD LINES<br /><br /><br />
                    Authorized Signatory
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AVBInvoice() {
    const [date, setDate] = useState<string>("16/04/2025");
    const [billNo, setBillNo] = useState<string>("17");
    const [rows, setRows] = useState<InvoiceRow[]>([defaultRow()]);
    const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
    const previewRef = useRef<HTMLDivElement>(null);

    const updateRow = (id: number, field: keyof InvoiceRow, value: string): void => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };

    const addRow = (): void => setRows((prev) => [...prev, defaultRow()]);

    const removeRow = (id: number): void => setRows((prev) => prev.filter((r) => r.id !== id));

    const totalAmount: number = rows.reduce((sum, r) => {
        return (
            sum +
            (parseFloat(r.amt20) || 0) * (parseFloat(r.qty20) || 0) +
            (parseFloat(r.amt40) || 0) * (parseFloat(r.qty40) || 0)
        );
    }, 0);

    const handlePrint = (): void => {
        if (!previewRef.current) return;
        const content = previewRef.current.innerHTML;
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`<!DOCTYPE html><html><head><title>AVB Invoice</title><style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #222; padding: 20px; }
    </style></head><body>${content}</body></html>`);
        win.document.close();
        win.print();
    };

    return (
        <div className="page">
            <div style={{ maxWidth: 1300, margin: "0 auto" }}>

                {/* Top Bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a2340", letterSpacing: "-0.5px" }}>AVB Invoice Generator</h1>
                        <p style={{ fontSize: 12, color: "#8a94aa", marginTop: 2 }}>Jayalakshmi Roadlines · Export Movement</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button
                            onClick={() => setActiveTab(activeTab === "form" ? "preview" : "form")}
                            style={{ padding: "8px 18px", borderRadius: 8, border: "1.5px solid #d0d7e8", background: "#fff", color: "#3a4a6b", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                            {activeTab === "form" ? "👁 Preview Only" : "✏️ Edit"}
                        </button>
                        <button
                            onClick={handlePrint}
                            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                            🖨 Print / Save
                        </button>
                    </div>
                </div>

                {/* Layout */}
                <div style={{ display: "grid", gridTemplateColumns: activeTab === "form" ? "1fr 1fr" : "1fr", gap: 20 }}>

                    {/* Form Panel */}
                    {activeTab === "form" && (
                        <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 16px rgba(30,50,100,0.07)", overflowY: "auto", maxHeight: "85vh" }}>
                            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a2340", marginBottom: 18, borderBottom: "2px solid #e8ecf5", paddingBottom: 10 }}>
                                Invoice Details
                            </h2>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                                <LabeledInput label="Date" value={date} onChange={setDate} placeholder="DD/MM/YYYY" />
                                <LabeledInput label="Bill No." value={billNo} onChange={setBillNo} placeholder="e.g. 17" />
                            </div>

                            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1a2340", marginBottom: 14, borderBottom: "2px solid #e8ecf5", paddingBottom: 10 }}>
                                Line Items
                            </h2>

                            {rows.map((row, idx) => (
                                <RowEditor
                                    key={row.id}
                                    row={row}
                                    index={idx}
                                    canRemove={rows.length > 1}
                                    onChange={(field, value) => updateRow(row.id, field, value)}
                                    onRemove={() => removeRow(row.id)}
                                />
                            ))}

                            <button
                                onClick={addRow}
                                style={{ width: "100%", padding: 10, borderRadius: 8, border: "2px dashed #b8c8ee", background: "transparent", color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 4 }}
                            >
                                + Add Row
                            </button>
                        </div>
                    )}

                    {/* Preview Panel */}
                    <InvoicePreview
                        date={date}
                        billNo={billNo}
                        rows={rows}
                        totalAmount={totalAmount}
                        previewRef={previewRef}
                    />
                </div>
            </div>
        </div>
    );
}