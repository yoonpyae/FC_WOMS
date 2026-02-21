namespace WOMS.Server.Services.Repository
{
    public class ViPrescriptionRepo(WOMSDbContext context) : RepositoryBase<ViPrescription>(context), IViPrescriptionRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
