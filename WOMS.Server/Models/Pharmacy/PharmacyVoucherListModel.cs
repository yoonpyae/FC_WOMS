namespace WOMS.Server.Models.PharmacyVouchers
{
    public class PharmacyVoucherListModel:ViPharmacyVoucher
    {
        public List<ViPharmacyVoucherDetail> Details { get; set; } = null!;
        public PharmacyVoucherListModel ConstructFromView(ViPharmacyVoucher PharmacyVoucher, List<ViPharmacyVoucherDetail> PharmacyVoucherDetails)
        {
            return new PharmacyVoucherListModel()
            {
                Vno = PharmacyVoucher.Vno,
                BranchId = PharmacyVoucher.BranchId,
                ManualVno = PharmacyVoucher.ManualVno,
                Vdate = PharmacyVoucher.Vdate,
                PatientId = PharmacyVoucher.PatientId,
                PatientName = PharmacyVoucher.PatientName,
                ReferDoctorId = PharmacyVoucher.ReferDoctorId,
                ReferDoctorName = PharmacyVoucher.ReferDoctorName,
                TotalAmount = PharmacyVoucher.TotalAmount,
                DiscountAmount = PharmacyVoucher.DiscountAmount,
                NetAmount = PharmacyVoucher.NetAmount,
                PaidAmount = PharmacyVoucher.PaidAmount,
                LeftAmount = PharmacyVoucher.LeftAmount,
                PaymentType = PharmacyVoucher.PaymentType,
                IssuePerson = PharmacyVoucher.IssuePerson,
                IssueDate = PharmacyVoucher.IssueDate,
                CreatedBy = PharmacyVoucher.CreatedBy,
                CreatedOn = PharmacyVoucher.CreatedOn,
                UpdatedBy = PharmacyVoucher.UpdatedBy,
                UpdatedOn = PharmacyVoucher.UpdatedOn,
                DeletedBy = PharmacyVoucher.DeletedBy,
                DeletedOn = PharmacyVoucher.DeletedOn,
                Status = PharmacyVoucher.Status,
                Remark = PharmacyVoucher.Remark,
                Details = PharmacyVoucherDetails
            };
        }
    }
}
