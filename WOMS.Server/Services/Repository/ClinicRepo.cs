namespace WOMS.Server.Services.Repository
{
    public class ClinicRepo(WOMSDbContext context) : RepositoryBase<Clinic>(context), IClinicRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}