export interface VoucherItemModel {
    id: string;
    name: string;
    price: number;
    qty: number;
    total: number;
    type: "Consultant" | "Round" | "OPD Service" | "Ward Service" | "ECG" | "X-Ray" | "Ultrasound" | "Physiotherapy" | "Pharmacy";
}

export interface OTVoucherItemModel {
    id: string;
    name: string;
    typecode: number;
    typename: string,
    price: number;
    qty: number;
    total: number;
    type: "OT Stock" | "OT Service";
}