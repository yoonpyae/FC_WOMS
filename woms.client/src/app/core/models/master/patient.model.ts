export interface PatientModel {
  patientId: string;
  branchId: number;
  name: string;
  nrc: string;
  dob: string;
  age: string;
  stateId: number;
  townshipId: number;
  addressDetail: string;
  phone: string;
  doctorId: number;
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
  nrc: string;
  dob: string;
  age: string;
  doctorId: number;
  doctorName: string;
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
}