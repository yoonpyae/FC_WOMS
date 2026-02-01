export interface AppointmentModel {
  ano: number;
  doctorId: number;
  doctorName: string;
  appointmentDate: string | Date;
  branchId: number;
  patientId: string;
  name: string;
  phoneNo: string;
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
  deletedOn: string | null;
  deletedBy: string | null;
  status: boolean;
  remark: null;
}
