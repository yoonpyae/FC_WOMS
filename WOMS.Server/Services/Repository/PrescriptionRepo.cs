namespace WOMS.Server.Services.Repository
{
    public class PrescriptionRepo(WOMSDbContext context) : RepositoryBase<Prescription>(context), IPrescriptionRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
