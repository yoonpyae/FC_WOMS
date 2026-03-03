export interface PrescriptionModel {
    prescriptionId: number;
    consultationId: string;
    branchId: number;
    itemCode: string;
    dosage: number | null;
    frequency: number | null;
    duration: number | null;
    instruction: string;
    quantity: number | null;
    date: string;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
}

export interface ViPrescriptionModel {
    prescriptionId: number;
    consultationId: string;
    branchId: number;
    date: string | null;
    doctorName: string | null;
    doctorId: number;
    itemCode: string;
    dosage: number | null;
    frequency: number | null;
    duration: number | null;
    quantity: number | null;
    instruction: string | null;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
}