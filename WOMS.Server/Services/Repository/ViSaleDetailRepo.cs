namespace WOMS.Server.Services.Repository
{
    public class ViSaleDetailRepo(WOMSDbContext context) : RepositoryBase<ViSaleDetail>(context), IViSaleDetailRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}