namespace WOMS.Server.Services.Repository
{
    public class OPDVoucherRepo(WOMSDbContext context) : RepositoryBase<OPDVoucher>(context), IOPDVoucherRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
