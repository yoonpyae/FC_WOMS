export interface PatientModel {
  patientId: string;
  branchId: number;
  name: string;
  dob: string;
  stateId: number;
  townshipId: number;
  addressDetail: string;
  phone: string;
  gender: number;
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
  deletedOn: string | null;
  deletedBy: string | null;
  status: boolean;
  remark: null;
}

export interface ViPatientModel {
  patientId: string;
  branchId: number;
  name: string;
  dob: string;
  stateId: number;
  stateName: string;
  townshipId: number;
  townshipName: string;
  addressDetail: string;
  phone: string;
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
  deletedOn: string | null;
  deletedBy: string | null;
  status: boolean;
  remark: null;
  gender: string;
}