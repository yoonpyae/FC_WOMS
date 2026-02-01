namespace WOMS.Server.Services.Repository
{
    public class ViAppointmentRepo(WOMSDbContext context) : RepositoryBase<ViAppointment>(context), IViAppointmentRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
