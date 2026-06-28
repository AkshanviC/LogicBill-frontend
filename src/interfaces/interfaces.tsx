interface Clients {
    id: string,
    name: string,
}

interface Drivers {
    id: string,
    name: string,
    phoneNumber: string,
}

interface Trailers {
    id: string,
    regNo: string,
}

interface InvoiceList {
    id: number; // Primary key, auto-increment
    createdBy: number; // FK -> users.id, required
    templateId: number; // FK -> templates.id, required
    date?: Date; // Nullable
    transportFirmId?: number; // FK -> transportfirm.id
    sac?: string;
    billNo?: string;
    pono?: string;
    vendorCode?: string;
    gstno?: string;
    pan?: string;
    trailerId?: number; // FK -> trailers.id
    driverId?: number; // FK -> drivers.id
    diesel?: string;
    driverBeta?: string;
    advance?: string;
    clientId?: number; // FK -> clients.id
    createdAt?: string;
    updatedAt?: string;
    driver?: Drivers;
    trailer?: Trailers;
    client?: Clients;
}

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
    data: InvoiceList[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface Filters {
    driverId: string;
    trailerId: string;
    clientId: string;
    addressId: string;
}

interface Toast { id: number; message: string; type: "success" | "error"; }

interface InvoiceRow {
    fromAddress: string;
    toAddress: string;
    fromToId: number | string;
    trailerNo: string;
    lrNo: string;
    invoiceNo: string;
    docNo: string;
    shipmentNo: string;
    others: string;
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
    weight: number;
    trailers: number;
    rate: number;
    amount: number;
    prorate: number;
    loadingCharge: number;
    cgst: number;
    sgst: number;
}
interface Address {
    id: number;
    from: string;
    to: string;
    clientId: number;
}
export type { Clients, Drivers, Trailers, InvoiceList, PaginatedResponse, Filters, Invoice, Toast, InvoiceRow, Address }