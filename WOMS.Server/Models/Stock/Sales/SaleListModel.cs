namespace WOMS.Server.Models.Stock.Sales
{
    public class SaleListModel:ViSale
    {
        public List<ViSaleDetail> Details { get; set; } = null!;
        public SaleListModel ConstructFromView(ViSale sale, List<ViSaleDetail> saleDetails)
        {
            return new SaleListModel()
            {
                SaleVno = sale.SaleVno,
                BranchId = sale.BranchId,
                ManualVno = sale.ManualVno,
                PatientId = sale.PatientId,
                PatientName = sale.PatientName,
                TotalAmount = sale.TotalAmount,
                DiscountAmount = sale.DiscountAmount,
                NetAmount = sale.NetAmount,
                PaymentType = sale.PaymentType,
                PaidDate = sale.PaidDate,
                SaleDate = sale.SaleDate,
                CreatedBy = sale.CreatedBy,
                CreatedOn = sale.CreatedOn,
                UpdatedBy = sale.UpdatedBy,
                UpdatedOn = sale.UpdatedOn,
                DeletedBy = sale.DeletedBy,
                DeletedOn = sale.DeletedOn,
                Status = sale.Status,
                Remark = sale.Remark,
                Details = saleDetails
            };
        }
    }
}
