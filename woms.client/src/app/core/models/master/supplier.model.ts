export interface SupplierModel {
    supplierId: number;
    branchId: number;
    companyName: null;
    contactPerson: null | string;
    stateId: number;
    townshipId: number;
    address: null;
    phone: null;
    email: null;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: null;
    remark: null;
}

export interface ViSupplierModel {
    stateName: string;
    supplierId: number;
    branchId: number;
    companyName: string;
    contactPerson: string;
    address: string;
    phone: string;
    stateId: number;
    townshipId: number;
    email: string;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: boolean;
    remark: null;
    townshipName: string;
}