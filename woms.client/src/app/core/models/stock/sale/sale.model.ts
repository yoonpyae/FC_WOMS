export interface SaleModel {
    saleVno: string;
    branchId: number;
    manualVno: string;
    patientId: number;
    saleDate: string | null;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    paymentType: string;
    paidDate:  string | Date | null;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: boolean;
    remark: string | null;
}

export interface ViSaleModel {
    details: Detail[];
    saleVno: string;
    branchId: number;
    manualVno: string;
    patientId: number;
    patientName: string;
    slaeDate: string | null;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    paymentType: string;
    paidDate:  string | Date | null;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: boolean;
    remark: null;
}

export interface Detail {
    saleVno: string;
    branchId: number;
    manualVno: string;
    patientId: number;
    patientName: string;
    saleDate: null;
    itemCode: string;
    itemName: string;
    typeCode: number;
    typeName: string;
    qty: number;
    price: number;
    expireDate: string | null;
}

