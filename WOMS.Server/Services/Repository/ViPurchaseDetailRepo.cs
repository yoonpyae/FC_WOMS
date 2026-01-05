namespace WOMS.Server.Services.Repository
{
    public class ViPurchaseDetailRepo(WOMSDbContext context) : RepositoryBase<ViPurchaseDetail>(context), IViPurchaseDetailRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
