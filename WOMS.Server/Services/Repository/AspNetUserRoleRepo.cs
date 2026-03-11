namespace WOMS.Server.Services.Repository
{
    public class AspNetUserRoleRepo(WOMSDbContext context) : RepositoryBase<AspNetUserRole>(context), IAspNetUserRoleRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
