export interface PacketTypeModel {
    typeCode: number;
    clinicId: number;
    typeName: string;
    capacity: number;
    createdOn: string;
    createdBy: string;
    updatedOn: null | string;
    updatedBy: null | string;
    deletedOn: null | string;
    deletedBy: null | string;
    status: boolean;
    remark: null | string;
}
