namespace WOMS.Server.Models.Stock.Sales
{
    public class UpdateSaleModel
    {
        public string? SaleVno { get; set; }
        public double? PaidAmount { get; set; }
        public double? LeftAmount { get; set; }
    }
}
