using WOMS.Server.Data;
using WOMS.Server.Entities;
using WOMS.Server.Interfaces.Repositories;
using WOMS.Server.Services.Repository.Base;

namespace WOMS.Server.Services.Repository
{
    public class TokenClaimRepo(WOMSDbContext context) : RepositoryBase<TokenClaim>(context), ITokenClaimRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
