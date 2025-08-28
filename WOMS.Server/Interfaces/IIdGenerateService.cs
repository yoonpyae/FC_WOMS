namespace WOMS.Server.Interfaces;

public interface IIdGenerateService
{
    /// <summary>
    /// Item Code => [A0001]
    /// </summary>
    /// <param name="Name"></param>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    Task<string> GetItemCode(string Name, long HospitalId);
    
    /// <summary>
    /// Purchase VNO => [P1-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetPurchaseVno(long HospitalId);

    /// <summary>
    /// Stock Issue VNO => [I1-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetStockIssueVno(long HospitalId);

    /// <summary>
    /// Damange VNO => [D1-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetDamageVno(long HospitalId);

    /// <summary>
    /// OPD Registration ID => [P-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetOPDRegId(long HospitalId);

    /// <summary>
    /// OPD Voucher ID => [VNo-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetOPDVNo(long HospitalId);
    
    /// <summary>
    /// Admission No ID => [ADM-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetAdmissionNo(long HospitalId);

    /// <summary>
    /// Damange VNO => [D1-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetLabVoucherVno(long HospitalId);

    /// <summary>
    /// RoomBill VNO => [RVN-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetRoomBill(long HospitalId);

    /// <summary>
    /// Pharmacy Voucher VNO => [PVN-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetPharmacyVoucherVno(long HospitalId);
    
    /// <summary>
    /// RoomBill VNO => [AVN-010125-RXYDQC]
    /// </summary>
    /// <param name="HospitalId"></param>
    /// <returns></returns>
    string GetAdmissionVNo(long HospitalId);
}