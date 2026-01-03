namespace WOMS.Server.Services.Repository;

public class DoctorRepo(WOMSDbContext context) : RepositoryBase<Doctor>(context), IDoctorRepo
{
    private readonly WOMSDbContext _context = context;
}
