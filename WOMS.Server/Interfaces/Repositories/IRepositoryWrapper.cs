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
        IBranchRepo Branches { get; }
        ISupplierRepo Suppliers { get; }
        IPacketTypeRepo PacketTypes { get; }
        IMainStockRepo MainStocks { get; }
        IStockItemRepo StockItems { get; }
        IDoctorRepo Doctors { get; }
        IPurchaseRepo Purchases { get; }
        IPurchaseDetailRepo PurchaseDetails { get; }
        ISaleRepo Sales { get; }
        ISaleDetailRepo SaleDetails { get; }
        IPatientRepo Patients { get; }

        #endregion

        #region Views Variables

        IViMainStockRepo ViMainStocks { get; }
        IViPurchaseRepo ViPurchases { get; }
        IViPurchaseDetailRepo ViPurchaseDetails { get; }
        IViSaleRepo ViSales { get; }
        IViSaleDetailRepo ViSaleDetails { get; }

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