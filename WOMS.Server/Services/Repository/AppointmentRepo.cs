namespace WOMS.Server.Services.Repository
{
    public class AppointmentRepo(WOMSDbContext context) : RepositoryBase<Appointment>(context), IAppointmentRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
