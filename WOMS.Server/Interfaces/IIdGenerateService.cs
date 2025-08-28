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
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetPurchaseVno(long ClinicId);

    /// <summary>
    /// Stock Issue VNO => [I1-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetStockIssueVno(long ClinicId);

    /// <summary>
    /// Damange VNO => [D1-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetDamageVno(long ClinicId);

    /// <summary>
    /// OPD Registration ID => [P-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetOPDRegId(long ClinicId);

    /// <summary>
    /// OPD Voucher ID => [VNo-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetOPDVNo(long ClinicId);
    
    /// <summary>
    /// Admission No ID => [ADM-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetAdmissionNo(long ClinicId);

    /// <summary>
    /// Damange VNO => [D1-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetLabVoucherVno(long ClinicId);

    /// <summary>
    /// RoomBill VNO => [RVN-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetRoomBill(long ClinicId);

    /// <summary>
    /// Pharmacy Voucher VNO => [PVN-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetPharmacyVoucherVno(long ClinicId);
    
    /// <summary>
    /// RoomBill VNO => [AVN-010125-RXYDQC]
    /// </summary>
    /// <param name="ClinicId"></param>
    /// <returns></returns>
    string GetAdmissionVNo(long ClinicId);
}