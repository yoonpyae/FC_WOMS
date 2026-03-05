namespace WOMS.Server.Models.OPD
{
    public class OPDVoucherEntryModel:OPDVoucher
    {
        public List<OPDVoucherItem> Items { get; set; } = [];
    }
}
