namespace WOMS.Server.Services.Repository
{
    public class ViConsultationRepo(WOMSDbContext context) : RepositoryBase<ViConsultation>(context), IViConsultationRepo
    {
            private readonly WOMSDbContext _context = context;
    }
}
