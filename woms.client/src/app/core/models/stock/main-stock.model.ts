export interface MainStockModel {
    itemCode: string;
    typeCode: number;
    clinicId: number;
    purchasePrice: number;
    salePrice: number;
    groundBalance: number;
    createdOn: string;
    createdBy: string;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: boolean;
    remark?: string | null;
}


export interface ViMainStockModel {
    itemCode: string;
    itemName?: string;
    chemicalName?: string;
    typeCode: number;
    typeName: string;
    clinicId: number;
    purchasePrice?: number;
    salePrice?: number;
    avgPrice?: number;
    groundBalance?: number;
    createdOn?: Date;
    createdBy?: string;
    updatedOn?: Date;
    updatedBy?: string;
    deletedOn?: Date;
    deletedBy?: string;
    status?: boolean;
    remark?: string;
}