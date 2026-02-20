export interface DoctorModel {
    doctorId: number;
    branchId: number;
    name: string;
    degree: string;
    specialized: string;
    photo: null;
    sign: null;
    consultantFee: number;
    ecgfee: number;
    xrayFee: number;
    ultrasoundFee: number;
    createdOn: string | null;
    createdBy: string | null;
    updatedOn: string | null;
    updatedBy: string | null;
    deletedOn: string | null;
    deletedBy: string | null;
    status: boolean;
    remark: null;
}

export interface DoctorWithSchedules extends DoctorModel {
    schedules: ScheduleModel[];
}

export interface ScheduleModel {
    scheduleId: number;
    doctorId: number;
    branchId: number;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    maxPatient: number;
    status: boolean;
}