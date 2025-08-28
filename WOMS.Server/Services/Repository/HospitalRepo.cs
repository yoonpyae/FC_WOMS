using WOMS.Server.Data;
using WOMS.Server.Entities;
using WOMS.Server.Interfaces.Repositories;
using WOMS.Server.Services.Repository.Base;

namespace WOMS.Server.Services.Repository
{
    public class HospitalRepo(WOMSDbContext context) : RepositoryBase<Hospital>(context), IHospitalRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}