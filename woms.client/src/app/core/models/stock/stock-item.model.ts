export interface StockItemModel {
    itemCode: string;
    itemName: string;
    chemicalName: string;
    typeCode: number;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: boolean;
    remark: string | null;
    branchId: number;
}