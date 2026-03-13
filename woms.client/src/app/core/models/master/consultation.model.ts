export interface ConsultationModel {
    consultationId: string;
    branchId: number;
    doctorId: number;
    visitDate: string;
    patientId: string;
    ano: number | null;
    symptoms: string | null;
    diagnosis: string | null;
    notes: string | null;
    status: string;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
}

export interface ViConsultationModel {
    consultationId: string;
    branchId: number;
    doctorId: number;
    visitDate: string;
    consultantFee: number;
    patientId: string;
    ano: number | null;
    symptoms: string | null;
    diagnosis: string | null;
    notes: string | null;
    status: string;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    doctorName: string;
    patientName: string;
}