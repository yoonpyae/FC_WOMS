export interface BranchModel {
    branchId: number;
    clinicId: number;
    branchName: string;
    contactPerson: string;
    primaryPhone: string;
    otherPhone: null;
    email: string;
    addressDetail: string;
    townshipId: number;
    stateId: number;
    photo: null;
    isDefault: boolean;
    status: boolean;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    remark: string | null;
    clinic: null;
}