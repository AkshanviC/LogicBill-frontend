import type { InvoiceRow } from "../../../interfaces/interfaces.tsx";

// ── Types ────────────────────────────────────────────────────────────────
// NOTE: HeaderDetails is defined locally in createInvoice.tsx.
// Either export it from there and import it here, or duplicate the shape below.
export interface HeaderDetails {
  sac: string;
  date: Date | string;
  billNo: string;
  pono: string;
  vendorCode: string;
  gst: string;
  pan: string;
  diesel: string;
  driverBeta: string;
  advance: string;
  ewayBillNo?: string;
}

export interface RowErrors {
  description?: string;
  qty?: string;
  amount?: string;
  weight?: string;
  trailers?: string;
  rate?: string;
  prorate?: string;
  loadingCharge?: string;
  cgst?: string;
  sgst?: string;
}

export interface ValidationErrors {
  selectedFirm?: string;
  client?: string;
  driver?: string;
  trailer?: string;
  selectedAddress?: string;
  headerDetails?: Partial<Record<keyof HeaderDetails, string>>;
  rows?: Record<number, RowErrors>; // keyed by row.id
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export interface InvoiceFormState {
  selectedFirm: string;
  client: number;
  driver: number;
  trailer: number;
  selectedAddess: number;
  headerDetails: HeaderDetails;
  rows: InvoiceRow[];
}

// ── Field-level helpers ─────────────────────────────────────────────────
const isBlank = (v: string | undefined | null): boolean =>
  !v || v.trim() === "";

const isNonNegativeNumber = (v: string | number | undefined): boolean => {
  if (v === undefined || v === "") return true; // optional numeric fields are allowed to be empty
  const n = typeof v === "number" ? v : parseFloat(v);
  return !isNaN(n) && n >= 0;
};

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const EWAYBILL_REGEX = /^\d{12}$/; // standard 12-digit e-way bill number
const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/; // DD-MM-YYYY, matching the input placeholder

// ── Main validator ────────────────────────────────────────────────────────
export function validateInvoiceForm(state: InvoiceFormState): ValidationResult {
  const errors: ValidationErrors = {};
  const {
    selectedFirm,
    client,
    driver,
    trailer,
    selectedAddess,
    headerDetails,
    rows,
  } = state;

  // Transport firm
  console.log("types", typeof selectedFirm);
  if (isBlank(String(selectedFirm))) {
    errors.selectedFirm = "Please select a transport firm.";
  }

  // Client / Driver / Trailer (defaultRow uses 1 as the unselected/default state)
  if (!client || client <= 0) {
    errors.client = "Please select a client.";
  }
  if (!driver || driver <= 0) {
    errors.driver = "Please select a driver.";
  }
  if (!trailer || trailer <= 0) {
    errors.trailer = "Please select a trailer.";
  }

  // Address
  if (!selectedAddess || selectedAddess === 0) {
    errors.selectedAddress =
      "Please select an address before creating the invoice.";
  }

  // Header details
  const headerErrors: Partial<Record<keyof HeaderDetails, string>> = {};

  if (isBlank(headerDetails.date as string)) {
    headerErrors.date = "Date is required.";
  } else if (
    typeof headerDetails.date === "string" &&
    !DATE_REGEX.test(headerDetails.date)
  ) {
    headerErrors.date = "Date must be in DD-MM-YYYY format.";
  }

  // Bill No. and PAN are only entered when firm "2" is selected (see the
  // conditional "Enter Header Details" block in the component)
  if (selectedFirm === "2") {
    if (isBlank(headerDetails.billNo)) {
      headerErrors.billNo = "Bill No. is required.";
    }
    if (isBlank(headerDetails.pan)) {
      headerErrors.pan = "PAN is required.";
    } else if (!PAN_REGEX.test(headerDetails.pan.toUpperCase())) {
      headerErrors.pan = "PAN must be in the format AAAAA9999A.";
    }
  }

  if (
    headerDetails.ewayBillNo &&
    !EWAYBILL_REGEX.test(headerDetails.ewayBillNo)
  ) {
    headerErrors.ewayBillNo = "E-way Bill No. must be a 12-digit number.";
  }

  if (!isNonNegativeNumber(headerDetails.diesel)) {
    headerErrors.diesel = "Diesel must be a valid non-negative number.";
  }
  if (!isNonNegativeNumber(headerDetails.driverBeta)) {
    headerErrors.driverBeta =
      "Driver Beta must be a valid non-negative number.";
  }

  if (Object.keys(headerErrors).length > 0) {
    errors.headerDetails = headerErrors;
  }

  // Rows
  if (!rows || rows.length === 0) {
    errors.rows = { 0: { description: "At least one line item is required." } };
  } else {
    const rowErrors: Record<number, RowErrors> = {};

    rows.forEach((row) => {
      const rErr: RowErrors = {};

      if (isBlank(row.description)) {
        rErr.description = "Description is required.";
      }

      // Numeric field checks
      if (!isNonNegativeNumber(row.weight))
        rErr.weight = "Weight must be a valid non-negative number.";
      if (!isNonNegativeNumber(row.trailers))
        rErr.trailers = "No. of Trailers must be a valid non-negative number.";
      if (!isNonNegativeNumber(row.rate))
        rErr.rate = "Rate must be a valid non-negative number.";
      if (!isNonNegativeNumber(row.amount))
        rErr.amount = "Amount must be a valid non-negative number.";
      if (!isNonNegativeNumber(row.prorate))
        rErr.prorate = "Prorate must be a valid non-negative number.";
      if (!isNonNegativeNumber(row.loadingCharge))
        rErr.loadingCharge =
          "Loading charge must be a valid non-negative number.";
      if (!isNonNegativeNumber(row.cgst))
        rErr.cgst = "CGST must be a valid non-negative number.";
      if (!isNonNegativeNumber(row.sgst))
        rErr.sgst = "SGST must be a valid non-negative number.";

      // At least one quantity (20ft or 40ft) should be present so the
      // preview total isn't silently zero
      //   const qty20 = parseFloat(String(row.qty20)) || 0;
      //   const qty40 = parseFloat(String(row.qty40)) || 0;
      //   if (qty20 <= 0 && qty40 <= 0) {
      //     rErr.qty = "Enter a quantity for either the 20' or 40' container.";
      //   }

      if (Object.keys(rErr).length > 0) {
        rowErrors[row.id] = rErr;
      }
    });

    if (Object.keys(rowErrors).length > 0) {
      errors.rows = rowErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ── Convenience: flatten errors into toast-friendly messages ─────────────
export function getFirstErrorMessage(errors: ValidationErrors): string | null {
  if (errors.selectedFirm) return errors.selectedFirm;
  if (errors.client) return errors.client;
  if (errors.driver) return errors.driver;
  if (errors.trailer) return errors.trailer;
  if (errors.selectedAddress) return errors.selectedAddress;
  if (errors.headerDetails) {
    const firstKey = Object.keys(
      errors.headerDetails,
    )[0] as keyof HeaderDetails;
    return errors.headerDetails[firstKey] ?? null;
  }
  if (errors.rows) {
    const firstRowId = Number(Object.keys(errors.rows)[0]);
    const firstRowErrors = errors.rows[firstRowId];
    const firstKey = Object.keys(firstRowErrors)[0] as keyof RowErrors;
    return firstRowErrors[firstKey] ?? null;
  }
  return null;
}
