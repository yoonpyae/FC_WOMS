namespace WOMS.Server.Services.Repository
{
    public class ViPurchaseRepo(WOMSDbContext context) : RepositoryBase<ViPurchase>(context), IViPurchaseRepo
    {
        private readonly WOMSDbContext _context = context;
    
    }
}
