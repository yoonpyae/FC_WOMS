using Microsoft.EntityFrameworkCore.Storage;

namespace WOMS.Server.Interfaces.Repositories
{
    public interface IRepositoryWrapper
    {
        #region Tables Variables

        IAspNetUserRepo AspNetUsers { get; }
        IAspNetRoleRepo AspNetRoles { get; }

        ITokenClaimRepo TokenClaims { get; }
        IClinicRepo Clinics { get; }
        IStateRepo States { get; }
        ITownshipRepo Townships { get; }
        IBranchRepo Branchs { get; }

        #endregion

        #region Views Variables



        #endregion

        #region General Methods

        void Save();
        Task<bool> SaveAsync();
        Task<bool> ExecuteRawAsync(string formattedSql);
        IDbContextTransaction TransactionBegin();
        Task<IDbContextTransaction> TransactionBeginAsync();

        #endregion
    }
}