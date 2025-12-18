namespace WOMS.Server.Services.Repository
{
    public class StockItemRepo(WOMSDbContext context): RepositoryBase<StockItem>(context), IStockItemRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
