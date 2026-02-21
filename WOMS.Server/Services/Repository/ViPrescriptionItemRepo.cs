namespace WOMS.Server.Services.Repository
{
    public class ViPrescriptionItemRepo(WOMSDbContext context) : RepositoryBase<ViPrescriptionItem>(context), IViPrescriptionItemRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
