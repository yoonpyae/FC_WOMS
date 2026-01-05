namespace WOMS.Server.Models.Stock.Purchases
{
    public class UpdatePurcahseModel
    {
        public string? PurchaseVno { get; set; }
        public double? TotalAmount { get; set; }
        public double? DiscountAmount { get; set; }
        public double? NetAmount { get; set; }
        public double? PayAmount { get; set; }
        public double? LeftAmount { get; set; }
        public DateTime? PaidDate { get; set; }

    }
}
