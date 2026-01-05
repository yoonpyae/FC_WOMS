namespace WOMS.Server.Services.Repository
{
    public class SaleRepo(WOMSDbContext context) : RepositoryBase<Sale>(context), ISaleRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
