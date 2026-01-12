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
                SaleDate = sale.SaleDate,
                PatientId = sale.PatientId,
                PatientName = sale.PatientName,
                ReferDoctorId = sale.ReferDoctorId,
                ReferDoctorName = sale.ReferDoctorName,
                TotalAmount = sale.TotalAmount,
                DiscountAmount = sale.DiscountAmount,
                NetAmount = sale.NetAmount,
                PaidAmount = sale.PaidAmount,
                LeftAmount = sale.LeftAmount,
                PaymentType = sale.PaymentType,
                IssuePerson = sale.IssuePerson,
                IssueDate = sale.IssueDate,
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
