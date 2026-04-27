
import { useState, useEffect } from "react";
import type { Drivers, Trailers, Clients, InvoiceRow } from "../../interfaces/interfaces";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../../components/spinner";
// ── Types ──────────────────────────────────────────────────────────────────


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

// const CONTAINER_SIZES = ["1x20FT", "1x40FT", "2x20FT", "2x40FT"] as const;

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
    fromAddress: "",
    toAddress: "",
    trailerNo: "",
    lrNo: "",
    invoiceNo: "",
    docNo: "",
    shipmentNo: "",
    others: "",
    weight: 0,
    trailers: 0,
    rate: 0,
    amount: 0,
    prorate: 0,
    loadingCharge: 0,
    cgst: 0,
    sgst: 0,
});

// ── Sub-components ─────────────────────────────────────────────────────────
interface LabeledInputProps {
    label: string;
    value: any;
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
                style={{ width: "90%", border: "1.5px solid #e0e8f5", borderRadius: 7, padding: "6px 10px", fontSize: 13, outline: "none", background: "#fff", color: "#1a2340", transition: "border 0.15s" }}
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
                <LabeledInput label="Lr No:" value={row.lrNo} onChange={(v) => onChange("lrNo", v)} placeholder="e.g. 2876 / 13.06.2025" />
                <LabeledInput label="Doc No:" value={row.docNo} onChange={(v) => onChange("docNo", v)} placeholder="e.g. 74861410" />
                <LabeledInput label="Shipment No:" value={row.shipmentNo} onChange={(v) => onChange("shipmentNo", v)} placeholder="e.g. 6100197528" />
                <LabeledInput label="Others:" value={row.others} onChange={(v) => onChange("others", v)} placeholder="e.g. By 40 FT Trailers — Details Attached" />
            </div>

            <h2 className="form-section-title">Other columns:</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <LabeledInput label="Weight:" value={row.weight} onChange={(v) => onChange("weight", v)} placeholder="e.g. TN05AK4833" />
                <LabeledInput label="No. of Trailers:" value={row.trailers} onChange={(v) => onChange("trailers", v)} placeholder="0" type="number" />
                <LabeledInput label="Rate:" value={row.rate} onChange={(v) => onChange("rate", v)} placeholder="0" type="number" />
                <LabeledInput label="Amount (Rs.):" value={row.amount} onChange={(v) => onChange("amount", v)} placeholder="0" type="number" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <LabeledInput label="From" value={row.fromAddress} onChange={(v) => onChange("fromAddress", v)} placeholder="e.g. ZIRCON MT PLOT (14.04.25)" />
                <LabeledInput label="To" value={row.toAddress} onChange={(v) => onChange("toAddress", v)} placeholder="e.g. KATTUPALLI PORT" />
                {/* <LabeledInput label="Trailer No:" value={row.trailerNo} onChange={(v) => onChange("trailerNo", v)} placeholder="e.g. KATTUPALLI PORT (16.04.25)" /> */}
                <LabeledInput label="Invoice No:" value={row.invoiceNo} onChange={(v) => onChange("invoiceNo", v)} placeholder="e.g. 74817294" />
                {/* <div>
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
                </div> */}
            </div>
            <h2 className="form-section-title">Addon Rows:</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                <LabeledInput label="prorate:" value={row.prorate} onChange={(v) => onChange("prorate", v)} placeholder="0" type="number" />
                <LabeledInput label="sgst:" value={row.sgst} onChange={(v) => onChange("sgst", v)} placeholder="0" type="number" />
                <LabeledInput label="cgst:" value={row.cgst} onChange={(v) => onChange("cgst", v)} placeholder="0" type="number" />
                <LabeledInput label="loading charges:" value={row.loadingCharge} onChange={(v) => onChange("loadingCharge", v)} placeholder="0" type="number" />
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
interface TransportFirm {
    id: string,
    name: string,
}

interface HeaderDetails {
    sac: string,
    date: Date | string,
    billNo: string,
    pono: string,
    vendorCode: string,
    gst: string,
    pan: string
    diesel: string,
    driverBeta: string,
    advance: string,
}

const headerDetailsValue: HeaderDetails = {
    sac: "996511",
    date: "",
    billNo: "",
    pono: "",
    vendorCode: "7400668",
    gst: "33AACPJ1154C2ZH",
    pan: "",
    diesel: "",
    driverBeta: "",
    advance: "",
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ date, billNo, rows, totalAmount, previewRef }) => {
    const thStyle: React.CSSProperties = { border: "1px solid #ccc", padding: "6px 8px", background: "#f0f0f0", fontWeight: "bold", fontSize: 11, textAlign: "center" };
    const tdStyle: React.CSSProperties = { border: "1px solid #ccc", padding: "6px 8px", fontSize: 11 };

    return (
        <div ref={previewRef} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 16px rgba(30,50,100,0.07)", overflow: "hidden", fontFamily: "Arial, sans-serif", fontSize: 12, color: "#222" }}>
            {/* Header */}
            {/* <div style={{ padding: "12px 16px", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: "bold" }}>JAYALAKSHMI ROADLINES</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>FLEET OWNERS &amp; CONTAINER MOVERS</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>No.12/18, Thiruvalluvar Street, IInd Floor, Balakrishna Nagar, Thiruvottiyur, Chennai-600 019.</div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>Email: jayalakshmiroadlines.chennai@gmail.com</div>
                </div>
                <div style={{ fontSize: 11, color: "#555", textAlign: "right" }}>
                    GST No: 33AOPPM9326Q2Z1<br />Cell: 9841819012<br />Cell: 8939724222
                </div>
            </div> */}

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
export default function CreateInvoice() {
    // const [date, setDate] = useState<string>("16/04/2025");
    // const [billNo, setBillNo] = useState<string>("17");
    const navigate = useNavigate();
    const [rows, setRows] = useState<InvoiceRow[]>([defaultRow()]);
    // const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
    // const previewRef = useRef<HTMLDivElement>(null);
    const [selectedFirm, setSelectedFirm] = useState("2");
    const [transportFirm, setTransportFirm] = useState<TransportFirm[]>([{ id: "1", name: "Jayalakshmi" }, { id: "2", name: "Sreeji" }])
    const [headerDetails, setheaderDetails] = useState<HeaderDetails>(headerDetailsValue)
    const updateRow = (id: number, field: keyof InvoiceRow, value: string): void => {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    };
    const [driverList, setDriverList] = useState<Drivers[]>([]);
    const [trailerList, setTrailerList] = useState<Trailers[]>([]);
    const [client, setClient] = useState<number>(1);
    const [driver, setDriver] = useState<number>(1);
    const [trailer, setTrailer] = useState<number>(1);
    const [clientList, setClientList] = useState<Clients[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetch(`${import.meta.env.VITE_APP_API_URL}/api/drivers/`).then(res => res.json()).then(res => setDriverList(res.data)).catch(err => console.error(err));
        fetch(`${import.meta.env.VITE_APP_API_URL}/api/trailers/`).then(res => res.json()).then(res => setTrailerList(res.data)).catch(err => console.error(err));
        fetch(`${import.meta.env.VITE_APP_API_URL}/api/clients/`).then(res => res.json()).then(res => setClientList(res.data)).catch(err => console.error(err));
        fetch(`${import.meta.env.VITE_APP_API_URL}/api/transportfirms/`).then(res => res.json()).then(res => { setTransportFirm(res.data); setSelectedFirm(res.data[0]?.id || ""); }).catch(err => console.error(err));
    }, [])
    const addRow = (): void => setRows((prev) => [...prev, defaultRow()]);
    const listInvoice = () => navigate("/invoiceList");
    const removeRow = (id: number): void => setRows((prev) => prev.filter((r) => r.id !== id));

    // const totalAmount: number = rows.reduce((sum, r) => {
    //     return (
    //         sum +
    //         (parseFloat(r.amt20) || 0) * (parseFloat(r.qty20) || 0) +
    //         (parseFloat(r.amt40) || 0) * (parseFloat(r.qty40) || 0)
    //     );
    // }, 0);

    const handlePrint = async (): Promise<void> => {
        //     if (!previewRef.current) return;
        //     const content = previewRef.current.innerHTML;
        //     const win = window.open("", "_blank");
        //     if (!win) return;
        //     win.document.write(`<!DOCTYPE html><html><head><title>AVB Invoice</title><style>
        //   * { box-sizing: border-box; margin: 0; padding: 0; }
        //   body { font-family: Arial, sans-serif; font-size: 12px; color: #222; padding: 20px; }
        // </style></head><body>${content}</body></html>`);
        //     win.document.close();
        //     win.print();
        if (loading) return;
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/invoices/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // This is the missing piece
            },
            body: JSON.stringify({ invoiceRows: rows, invoices: { createdBy: localStorage.getItem("userId") || 1, templateId: 1, transportFirmId: 1, driverId: driver, trailerId: trailer, clientId: client, ...headerDetails } })
        });
        if (response.status === 201) {
            console.log("success", response);
            toast.success("Invoice created successfully!");
            setLoading(false);
            setheaderDetails(headerDetailsValue);
        }
        else {
            console.log("failure");
            toast.error("Failed to create invoice. Please try again.");
        }

    };

    return (
        <div className="page">
            <div className={'page-inner'}>

                {/* Top Bar */}
                <div className="topbar">
                    <div>
                        <h1 className="topbar-title">Create Record</h1>
                        <p className="topbar-subtitle">Sreeji · Export Movement</p>
                    </div>
                    <div className="topbar-actions">
                        <button
                            // onClick={() => setActiveTab(activeTab === "form" ? "preview" : "form")}
                            onClick={listInvoice}
                            className="btn btn-outline"
                        >
                            {/* {activeTab === "form" ? "👁 Preview Only" : "✏️ Edit"} */}
                            Invoice List
                        </button>
                        <button
                            onClick={handlePrint}
                            className="btn btn-primary"
                        >
                            {/* 🖨 Print / Save */}
                            {loading ? <Spinner /> : "Create"}
                        </button>
                    </div>
                </div>

                {/* Layout */}
                <div>
                    {/* Form Panel */}
                    {/* {activeTab === "form" && ( */}
                    <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 16px rgba(30,50,100,0.07)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "20px" }}>
                            <div>
                                <h2 className="form-section-title">Select Transport Firm:</h2>
                                <select
                                    value={selectedFirm}
                                    onChange={(e) => { setSelectedFirm(e.target.value) }}
                                    style={{ width: "90%", border: "1.5px solid #e0e8f5", borderRadius: 7, padding: "6px 10px", fontSize: 13, background: "#fff", color: "#1a2340" }}
                                >
                                    {transportFirm ? transportFirm.map((data) => <option key={`${data.id}+${data.name}`} value={data.id}>{data.name}</option>) : ""}
                                </select>
                            </div>
                            <div>
                                <h2 className="form-section-title">Select Client:</h2>
                                <select
                                    value={client}
                                    onChange={(e) => { setClient(+e.target.value) }}
                                    style={{ width: "90%", border: "1.5px solid #e0e8f5", borderRadius: 7, padding: "6px 10px", fontSize: 13, background: "#fff", color: "#1a2340" }}
                                >
                                    {clientList ? clientList.map((data) => <option key={`${data.id}+${data.name}`} value={data.id}>{data.name}</option>) : ""}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "20px" }}>
                            <div>
                                <h2 className="form-section-title">Select Driver:</h2>
                                <select
                                    value={driver}
                                    onChange={(e) => { setDriver(+e.target.value) }}
                                    style={{ width: "90%", border: "1.5px solid #e0e8f5", borderRadius: 7, padding: "6px 10px", fontSize: 13, background: "#fff", color: "#1a2340" }}
                                >
                                    {driverList ? driverList.map((data) => <option key={`${data.id}+${data.name}`} value={data.id}>{data.name}</option>) : ""}
                                </select>
                            </div>
                            <div>
                                <h2 className="form-section-title">Select Trailer:</h2>
                                <select
                                    value={trailer}
                                    onChange={(e) => { setTrailer(+e.target.value) }}
                                    style={{ width: "90%", border: "1.5px solid #e0e8f5", borderRadius: 7, padding: "6px 10px", fontSize: 13, background: "#fff", color: "#1a2340" }}
                                >
                                    {trailerList ? trailerList.map((data) => <option key={`${data.id}+${data.regNo}`} value={data.id}>{data.regNo}</option>) : ""}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "20px" }}>
                            <div>
                                <h2 className="form-section-title">Diesel:</h2>
                                <LabeledInput label="" value={headerDetails.diesel} onChange={(value) => { setheaderDetails({ ...headerDetails, diesel: value }) }} placeholder="eg:100" />
                            </div>
                            <div>
                                <h2 className="form-section-title">Driver Beta:</h2>
                                <LabeledInput label="" value={headerDetails.driverBeta} onChange={(value) => { setheaderDetails({ ...headerDetails, driverBeta: value }) }} placeholder="eg:1500" />
                            </div>
                        </div>
                        {selectedFirm === "2" ? <h2 className="form-section-title">Enter Header Details:</h2> : ""}
                        {selectedFirm === "2" ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                            {/* <LabeledInput label="SAC" value={headerDetails.sac} onChange={(value) => { setheaderDetails({ ...headerDetails, sac: value }) }} placeholder="eg:1a2b3c4d" /> */}
                            {/* <LabeledInput label="Date" value={headerDetails.date} onChange={(value) => { setheaderDetails({ ...headerDetails, date: value }) }} placeholder="DD-MM-YYYY" /> */}
                            <LabeledInput label="Purchase Order No." value={headerDetails.pono} onChange={(value) => { setheaderDetails({ ...headerDetails, pono: value }) }} placeholder="e.g. 17" />
                            {/* <LabeledInput label="Vendor Code" value={headerDetails.vendorCode} onChange={(value) => { setheaderDetails({ ...headerDetails, vendorCode: value }) }} placeholder="e.g. 17" /> */}
                            <LabeledInput label="PAN" value={headerDetails.pan} onChange={(value) => { setheaderDetails({ ...headerDetails, pan: value }) }} placeholder="e.g. 17" />
                            <LabeledInput label="Bill No." value={headerDetails.billNo} onChange={(value) => { setheaderDetails({ ...headerDetails, billNo: value }) }} placeholder="e.g. 17" />
                        </div> : ""}
                        <div className="gstComp">
                            <h5>Is GST note reqired?:</h5><input type="checkbox" />
                        </div>
                        <span style={{ color: "black", fontWeight: 200, marginBottom: "20px" }}>(note looks: "GST is Payable under Reverse Charge Mechanism")</span>

                        <h2 style={{ marginTop: 20, fontSize: 14, fontWeight: 700, color: "#1a2340", marginBottom: 14, borderBottom: "2px solid #e8ecf5", paddingBottom: 10 }}>
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
                    {/* )} */}

                    {/* Preview Panel */}
                    {/* <InvoicePreview
                        date={date}
                        billNo={billNo}
                        rows={rows}
                        totalAmount={totalAmount}
                        previewRef={previewRef}
                    /> */}
                </div>
            </div>
        </div>
    );
}