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
        IPharmacyVoucherRepo PharmacyVouchers { get; }
        IPharmacyVoucherDetailRepo PharmacyVoucherDetails { get; }
        IPatientRepo Patients { get; }
        IAppointmentRepo Appointments { get; }

        #endregion

        #region Views Variables

        IViMainStockRepo ViMainStocks { get; }
        IViPurchaseRepo ViPurchases { get; }
        IViPurchaseDetailRepo ViPurchaseDetails { get; }
        IViPharmacyVoucherRepo ViPharmacyVouchers { get; }
        IViPharmacyVoucherDetailRepo ViPharmacyVoucherDetails { get; }
        IViPatientRepo ViPatients { get; }
        IViAppointmentRepo ViAppointments { get; }
        IVISupplierRepo ViSuppliers { get; }

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