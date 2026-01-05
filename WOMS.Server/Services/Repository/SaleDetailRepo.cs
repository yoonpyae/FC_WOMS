namespace WOMS.Server.Services.Repository
{
    public class SaleDetailRepo(WOMSDbContext context) : RepositoryBase<SaleDetail>(context), ISaleDetailRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
