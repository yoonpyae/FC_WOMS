namespace WOMS.Server.Services.Repository
{
    public class ViPharmacyVoucherDetailRepo(WOMSDbContext context) : RepositoryBase<ViPharmacyVoucherDetail>(context), IViPharmacyVoucherDetailRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}