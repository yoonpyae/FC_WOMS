export interface VoucherItemModel {
    id: string;
    name: string;
    price: number;
    qty: number;
    total: number;
    type: "Consultation" | "Service";
}