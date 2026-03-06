export interface OPDVoucherModel {
    opdvno: string;
    branchId: number;
    patientId?: string | null;
    vdate?: string | null; // ISO Date string
    doctorId?: number | null;
    totalAmount: number;
    discountAmount: number;
    paidAmount: number;
    leftAmount: number;
    paymentType: string;
    createdOn?: string | null;
    createdBy?: string | null;
    updatedOn?: string | null;
    updatedBy?: string | null;
    deletedOn?: string | null;
    deletedBy?: string | null;
    remark?: string | null;
    status?: string | null;
}

export interface OPDVoucherItemModel {
    opdvno: string;
    serviceId: number;
    consultationId: string;
    result?: string | null;
    resultDate?: string | null;
    quantity?: number | null;
    unitPrice?: number | null;
    amount?: number | null;
}

export interface OPDVoucherEntryModel extends OPDVoucherModel {
    items: OPDVoucherItemModel[];
}

export interface ViOPDVoucherModel {
    opdvno: string;
    branchId: number;
    patientId?: string | null;
    vdate?: string | null;
    doctorId?: number | null;
    totalAmount: number;
    discountAmount: number;
    paidAmount: number;
    leftAmount: number;
    paymentType: string;
    createdOn?: string | null;
    createdBy?: string | null;
    updatedOn?: string | null;
    updatedBy?: string | null;
    deletedOn?: string | null;
    deletedBy?: string | null;
    remark?: string | null;
    status?: string | null;
    // Joined Display Fields
    patientName: string;
    doctorName?: string | null;
}

export interface ViOPDVoucherItemModel {
    consultantFee?: number | null;
    serviceName?: string | null;
    serviceFee?: number | null;
    opdvno: string;
    serviceId: number;
    consultationId: string;
    result?: string | null;
    resultDate?: string | null;
    quantity?: number | null;
    unitPrice?: number | null;
    totalItemAmount?: number | null;
}