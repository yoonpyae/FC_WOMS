namespace WOMS.Server.Interfaces;

public interface IIdGenerateService
{
    /// <summary>
    /// Item Code => [A0001]
    /// </summary>
    /// <param name="Name"></param>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    Task<string> GetItemCode(string Name, long ClinicId);
    
    /// <summary>
    /// Purchase VNO => [P1-010125-RXYDQC]
    /// </summary>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    string GetPurchaseVno(long BranchId);

    /// <summary>
    /// Sale VNO => [S1-010125-RXYDQC]
    /// </summary>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    string GetSaleVno(long BranchId);

    /// <summary>
    /// Patient ID => [P-010125-RXYDQC]
    /// </summary>
    /// <param name="BranchId"></param>
    /// <returns></returns>
    string GetPatientId(long BranchId);

    /// <summary>
    /// OPD Voucher ID => [VNo-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetOPDVNo(long ClinicId);
   
    /// <summary>
    /// Damange VNO => [D1-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetLabVoucherVno(long ClinicId);
      
}