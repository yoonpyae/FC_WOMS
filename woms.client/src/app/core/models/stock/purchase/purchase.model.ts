export interface PurchaseModel {
    purchaseVno: string;
    branchId: number;
    manualVno: string;
    supplierId: number;
    purchaseDate: string | null;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    payAmount: number;
    leftAmount: number;
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

export interface ViPurchaseModel {
    details: Detail[];
    purchaseVno: string;
    branchId: number;
    manualVno: string;
    supplierId: number;
    supplierCompanyName: string;
    supplierName: string;
    purchaseDate: string | null;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    payAmount: number;
    leftAmount: number;
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
    purchaseVno: string;
    branchId: number;
    manualVno: string;
    supplierId: number;
    supplierCompanyName: string;
    supplierName: string;
    purchaseDate: null;
    itemCode: string;
    itemName: string;
    typeCode: number;
    typeName: string;
    qty: number;
    price: number;
    Amount: number;
    expireDate: string | null;
}

