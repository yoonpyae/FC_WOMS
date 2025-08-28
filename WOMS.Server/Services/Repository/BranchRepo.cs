namespace WOMS.Server.Services.Repository
{
    public class BranchRepo(WOMSDbContext context) : RepositoryBase<Branch>(context), IBranchRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
