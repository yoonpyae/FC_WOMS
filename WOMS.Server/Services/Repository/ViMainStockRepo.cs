namespace WOMS.Server.Services.Repository
{
    public class ViMainStockRepo(WOMSDbContext context): RepositoryBase<ViMainStock>(context), IViMainStockRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
