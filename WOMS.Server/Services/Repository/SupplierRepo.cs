namespace WOMS.Server.Services.Repository
{
    public class SupplierRepo(WOMSDbContext context) : RepositoryBase<Supplier>(context), ISupplierRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
