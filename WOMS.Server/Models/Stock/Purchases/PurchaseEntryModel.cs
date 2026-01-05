namespace WOMS.Server.Models.Stock.Purchases
{
    public class PurchaseEntryModel : Purchase
    {
        public List<PurchaseEntryDetailModel> Detail { get; set; } = new List<PurchaseEntryDetailModel>();
    }
}
