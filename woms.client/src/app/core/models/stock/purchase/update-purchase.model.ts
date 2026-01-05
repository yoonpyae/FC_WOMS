export interface UpdatePurchaseModel {
    purchaseVno: string;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    payAmount: number;
    leftAmount: number;
    paidDate: Date;
  }