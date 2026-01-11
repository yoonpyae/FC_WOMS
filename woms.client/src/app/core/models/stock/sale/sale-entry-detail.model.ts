export interface SaleEntryDetailModel {
    saleVno?: string;
    itemCode: string;
    typeCode: number;
    qty: number;
    price: number;
    totalQty: number; //should be totalPrice
}

export interface SaleEntryDisplayModel extends SaleEntryDetailModel {
    itemName: string;
    typeName: string;
    capacity: number;
    salePrice: number;
}