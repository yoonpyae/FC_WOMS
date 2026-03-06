export interface ServiceModel {
  serviceId: number;
  serviceName: string | null;
  fee: number | null;
  isActive: boolean;
  branchId: number;

  createdOn?: Date | string | null;
  createdBy?: string | null;
  updatedOn?: Date | string | null;
  updatedBy?: string | null;
  deletedOn?: Date | string | null;
  deletedBy?: string | null;
}