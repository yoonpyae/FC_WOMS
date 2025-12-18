namespace WOMS.Server.Services.Repository
{
    public class MainStockRepo(WOMSDbContext context) : RepositoryBase<MainStock>(context), IMainStockRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
