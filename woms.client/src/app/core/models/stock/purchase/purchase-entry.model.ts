import { PurchaseEntryDetailModel } from "./purchase-entry-detail.model";

export interface PurchaseEntryModel {
    purchaseVno: string;
    branchId: number;
    manualVno: string;
    supplierId: number;
    purchaseDate: string | Date | null;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    payAmount: number;
    leftAmount: number;
    paymentType: string;
    paidDate: string | null;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: string | null;
    remark: string | null;
    detail: PurchaseEntryDetailModel[];
}

