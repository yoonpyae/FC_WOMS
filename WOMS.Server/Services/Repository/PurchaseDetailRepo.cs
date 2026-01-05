namespace WOMS.Server.Services.Repository
{
    public class PurchaseDetailRepo(WOMSDbContext context) : RepositoryBase<PurchaseDetail>(context), IPurchaseDetailRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
