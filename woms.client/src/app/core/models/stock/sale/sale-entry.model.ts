import { SaleEntryDetailModel } from "./sale-entry-detail.model";

export interface SaleEntryModel {
    saleVno: string;
    branchId: number;
    manualVno: string;
    patientId: number;
    saleDate: string | Date | null;
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
    status: boolean;
    remark: string | null;
    detail: SaleEntryDetailModel[];
}

