namespace WOMS.Server.Services.Repository
{
    public class ViOPDVoucherRepo(WOMSDbContext context) : RepositoryBase<ViOPDVoucher>(context), IViOPDVoucherRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
