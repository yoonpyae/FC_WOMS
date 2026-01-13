export interface ViPharmacyVoucherModel {
    details: PharmacyVoucherDetail[];
    vno: string;
    branchId: number;
    patientId: null | string;
    vdate: string;
    patientName: string;
    referDoctorId: number;
    referDoctorName: string;
    totalAmount: number;
    discountAmount: number;
    paidAmount: number;
    leftAmount: number;
    paymentType: string;
    processStatus: string;
    issuePerson: null | string;
    issueDate: null | string;
    createdOn: string;
    createdBy: string;
    updatedOn: null | string;
    updatedBy: null | string;
    deletedOn: null;
    deletedBy: null;
    remark: null;
}

export interface PharmacyVoucherDetail {
    vno: string;
    itemCode: string;
    itemName: string;
    chemicalName: null;
    typeCode: number;
    typeName: string;
    capacity: number;
    price: number;
    qty: number;
    amount: number;
}