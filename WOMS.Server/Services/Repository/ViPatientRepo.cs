namespace WOMS.Server.Services.Repository
{
    public class ViPatientRepo(WOMSDbContext context) : RepositoryBase<ViPatient>(context), IViPatientRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
