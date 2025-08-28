export interface ClinicModel {
    clinicId: number;
    clinicName: string;
    contantPerson: string;
    address: string;
    phone: string;
    email: string;
    note: string;
    planId: string;
    planExpireDate: string;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: boolean;
    remark: string | null;
}
