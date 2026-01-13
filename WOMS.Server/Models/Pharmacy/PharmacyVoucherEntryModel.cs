using WOMS.Server.Entities;

namespace WOMS.Server.Models.PharmacyVouchers
{
    public class PharmacyVoucherEntryModel:PharmacyVoucher
    {
        public List<PharmacyVoucherDetail> Details { get; set; } = [];
    }
}
