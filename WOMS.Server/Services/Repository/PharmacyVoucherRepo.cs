namespace WOMS.Server.Services.Repository
{
    public class PharmacyVoucherRepo(WOMSDbContext context) : RepositoryBase<PharmacyVoucher>(context), IPharmacyVoucherRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
