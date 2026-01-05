namespace WOMS.Server.Services.Repository
{
    public class PatientRepo(WOMSDbContext context) : RepositoryBase<Patient>(context), IPatientRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
