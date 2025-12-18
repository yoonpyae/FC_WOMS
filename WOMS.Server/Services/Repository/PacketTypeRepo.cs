namespace WOMS.Server.Services.Repository
{
    public class PacketTypeRepo(WOMSDbContext context): RepositoryBase<PacketType>(context), IPacketTypeRepo
    {
        private readonly WOMSDbContext _context = context;
    }
}
