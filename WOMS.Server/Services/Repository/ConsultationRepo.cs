namespace WOMS.Server.Services.Repository
{
    public class ConsultationRepo(WOMSDbContext context) : RepositoryBase<Consultation>(context), IConsultationRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
