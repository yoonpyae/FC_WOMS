namespace WOMS.Server.Models.Stock.Sales
{
    public class SaleEntryModel:Sale
    {
        public List<SaleDetail> Details { get; set; } = [];
    }
}
