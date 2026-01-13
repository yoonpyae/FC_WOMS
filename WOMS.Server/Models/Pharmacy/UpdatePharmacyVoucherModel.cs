namespace WOMS.Server.Models.PharmacyVouchers
{
    public class UpdatePharmacyVoucherModel
    {
        public string? Vno { get; set; }
        public double? PaidAmount { get; set; }
        public double? LeftAmount { get; set; }
    }
}
