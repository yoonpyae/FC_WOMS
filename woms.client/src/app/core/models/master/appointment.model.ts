export interface AppointmentModel {
  ano: number;
  scheduleId: number;
  patientId: string;
  appointmentDate: string | Date;
  branchId: number;
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
  deletedOn: string | null;
  deletedBy: string | null;
  status: string;
  remark: null;
}

export interface ViAppointmentModel {
  ano: number;
  branchId: number;
  appointmentDate: string;
  appointmentStatus: string;
  appointmentRemark: null | string;
  patientName: null | string;
  patientPhone: null | string;
  dayOfWeek: null | string;
  startTime: null | string;
  endTime: null | string;
  doctorId: number | null;
  doctorName: null | string;
  specialized: null | string;
  scheduleId: number;
  patientId: null | string;
  createdOn: string | null;
  createdBy: string | null;
  updatedOn: string | null;
  updatedBy: string | null;
  deletedOn: string | null;
  deletedBy: string | null;
}
