namespace WOMS.Server.Models.Stock.Sales
{
    public class SaleEntryModel:Sale
    {
        public List<SaleEntryDetailModel> Detail { get; set; } = new List<SaleEntryDetailModel>();
    }
}
