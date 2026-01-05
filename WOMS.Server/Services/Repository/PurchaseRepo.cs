namespace WOMS.Server.Services.Repository
{
    public class PurchaseRepo(WOMSDbContext context) : RepositoryBase<Purchase>(context), IPurchaseRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
