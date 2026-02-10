export interface PurchaseEntryDetailModel {
    purchaseVno?: string;
    itemCode: string;
    typeCode: number;
    qty: number;
    price: number;
    Amount: number; //should be totalPrice
    expireDate: string | null;
    saleQty: null;
    salePrice: number;
}

export interface PurchaseEntryDisplayModel extends PurchaseEntryDetailModel {
    itemName: string;
    typeName: string;
    capacity: number;
    salePrice: number;
}