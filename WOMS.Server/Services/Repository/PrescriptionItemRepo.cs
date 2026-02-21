namespace WOMS.Server.Services.Repository
{
    public class PrescriptionItemRepo(WOMSDbContext context) : RepositoryBase<PrescriptionItem>(context), IPrescriptionItemRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
