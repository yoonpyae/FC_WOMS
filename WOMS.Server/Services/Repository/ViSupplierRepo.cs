namespace WOMS.Server.Services.Repository
{
    public class ViSupplierRepo(WOMSDbContext context) : RepositoryBase<ViSupplier>(context), IVISupplierRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
