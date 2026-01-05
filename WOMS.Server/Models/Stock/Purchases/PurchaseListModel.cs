namespace WOMS.Server.Models.Stock.Purchases
{
    public class PurchaseListModel : ViPurchase
    {
        public List<ViPurchaseDetail> Details { get; set; } = null!;

        public PurchaseListModel ConstructFromView(ViPurchase purchase, List<ViPurchaseDetail> purchaseDetails)
        {
            return new PurchaseListModel()
            {
                PurchaseVno = purchase.PurchaseVno,
                BranchId = purchase.BranchId,
                ManualVno = purchase.ManualVno,
                SupplierId = purchase.SupplierId,
                SupplierCompanyName = purchase.SupplierCompanyName,
                SupplierName = purchase.SupplierName,
                TotalAmount = purchase.TotalAmount,
                DiscountAmount = purchase.DiscountAmount,
                NetAmount = purchase.NetAmount,
                PayAmount = purchase.PayAmount,
                LeftAmount = purchase.LeftAmount,
                PaymentType = purchase.PaymentType,
                PaidDate = purchase.PaidDate,
                PurchaseDate = purchase.PurchaseDate,
                CreatedBy = purchase.CreatedBy,
                CreatedOn = purchase.CreatedOn,
                UpdatedBy = purchase.UpdatedBy,
                UpdatedOn = purchase.UpdatedOn,
                DeletedBy = purchase.DeletedBy,
                DeletedOn = purchase.DeletedOn,
                Status = purchase.Status,
                Remark = purchase.Remark,
                Details = purchaseDetails
            };
        }
    }
}
