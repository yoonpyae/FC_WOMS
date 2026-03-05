namespace WOMS.Server.Services.Repository
{
    public class ServiceRepo(WOMSDbContext context): RepositoryBase<Service>(context), IServiceRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
