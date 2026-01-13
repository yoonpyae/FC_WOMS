namespace WOMS.Server.Services.Repository
{
    public class PharmacyVoucherDetailRepo(WOMSDbContext context) : RepositoryBase<PharmacyVoucherDetail>(context), IPharmacyVoucherDetailRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
