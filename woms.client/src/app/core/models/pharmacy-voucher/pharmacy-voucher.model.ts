export interface PharmacyVoucherModel {
    details: Detail[];
    vno: string;
    branchId: number;
    patientId: string | null;
    vdate: string | Date;
    referDoctorId: number;
    totalAmount: number;
    discountAmount: number;
    paidAmount: number;
    leftAmount: number;
    paymentType: string;
    processStatus: string;
    issuePerson: string | null;
    issueDate: string | Date;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    remark: null;
}

export interface Detail {
    vno: string;
    itemCode: string;
    typeCode: number;
    price: number;
    qty: number;
    amount: number;
}