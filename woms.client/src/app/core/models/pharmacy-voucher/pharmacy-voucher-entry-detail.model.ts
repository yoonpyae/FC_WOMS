export interface PharmacyVoucherEntryDetailModel {
    itemCode: string,
    itemName: string | null,
    typeName: string,
    typeCode: number;
    quantity: number;
    price: number;
    amount: number;
    groundBalance?: number;
}