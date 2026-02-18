namespace WOMS.Server.Services.Repository
{
    public class DoctorScheduleRepo(WOMSDbContext context) : RepositoryBase<DoctorSchedule>(context), IDoctorScheduleRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
