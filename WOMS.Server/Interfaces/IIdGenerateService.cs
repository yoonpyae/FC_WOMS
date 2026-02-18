namespace WOMS.Server.Interfaces;

public interface IIdGenerateService
{
    /// <summary>
    /// Item Code => [A0001]
    /// </summary>
    /// <param name="Name"></param>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    Task<string> GetItemCode(string Name, long BranchId);
    
    /// <summary>
    /// Purchase VNO => [P1-010125-RXYDQC]
    /// </summary>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    string GetPurchaseVno(long BranchId);

    /// <summary>
    /// PharmacyVoucher VNO => [PV-010125-RXYDQC]
    /// </summary>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    string GetPharmacyVoucherVno(long BranchId);

    /// <summary>
    /// Patient ID => [P-010125-RXYDQC]
    /// </summary>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    string GetPatientId(long BranchId);

    /// <summary>
    /// OPD Voucher ID => [VNo-010125-RXYDQC]
    /// </summary>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    string GetOPDVNo(long BranchId);

    /// <summary>
    /// Damange VNO => [D1-010125-RXYDQC]
    /// </summary>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    string GetLabVoucherVno(long BranchId);
      
}