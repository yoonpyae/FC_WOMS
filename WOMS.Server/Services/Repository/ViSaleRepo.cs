namespace WOMS.Server.Services.Repository
{
    public class ViSaleRepo(WOMSDbContext context) : RepositoryBase<ViSale>(context), IViSaleRepo
    {
        private readonly WOMSDbContext _context = context;

    }
}
