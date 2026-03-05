namespace WOMS.Server.Services.Repository
{
    public class ViOPDVoucherItemRepo(WOMSDbContext context) : RepositoryBase<ViOPDVoucherItem>(context), IViOPDVoucherItemRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
