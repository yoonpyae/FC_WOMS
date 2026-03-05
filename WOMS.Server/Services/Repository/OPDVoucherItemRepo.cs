namespace WOMS.Server.Services.Repository
{
    public class OPDVoucherItemRepo(WOMSDbContext context) : RepositoryBase<OPDVoucherItem>(context), IOPDVoucherItemRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
