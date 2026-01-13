namespace WOMS.Server.Services.Repository
{
    public class ViPharmacyVoucherRepo(WOMSDbContext context) : RepositoryBase<ViPharmacyVoucher>(context), IViPharmacyVoucherRepo
    {
        private readonly WOMSDbContext _context = context;

    }
}
