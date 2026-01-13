using WOMS.Server.Models.PharmacyVouchers;

namespace WOMS.Server.Controllers.Pharmacy;

[Authorize]
[Route("api/pharmacy/[controller]")]
[ApiController]
public class PharmacyVouchersController(
     IRepositoryWrapper repo,
    IIdGenerateService idGenerateService) : ControllerBase
{
    #region CRUD Operations

    [HttpGet]
    [EndpointSummary("List All")]
    [EndpointDescription("Lists all pharmacy vouchers without deleted data.")]
    public async Task<IActionResult> Get(long branchId)
        => ResponseHelper.OK_Result(
            await repo.ViPharmacyVouchers.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);

    [HttpGet("by-dateRange")]
    [EndpointSummary("List By Date Range")]
    [EndpointDescription("Lists all pharmacy vouchers without deleted data, filtered by date range.")]
    public async Task<IActionResult> GetByDateRange(long branchId, DateOnly startDate, DateOnly endDate)
    {
        DateTime start = startDate.ToDateTime(TimeOnly.MinValue);
        DateTime end = endDate.ToDateTime(TimeOnly.MaxValue);

        IReadOnlyList<ViPharmacyVoucher> vouchers = await repo.ViPharmacyVouchers.GetAsync(
            x => x.BranchId == branchId &&
                 !x.DeletedOn.HasValue &&
                 x.Vdate >= start &&
                 x.Vdate <= end
        ) ?? [];

        List<PharmacyVoucherListModel> records = new();

        foreach (ViPharmacyVoucher voucher in vouchers)
        {
            IReadOnlyList<ViPharmacyVoucherDetail> details = await repo.ViPharmacyVoucherDetails.GetAsync(x => x.Vno == voucher.Vno) ?? [];
            records.Add(new PharmacyVoucherListModel().ConstructFromView(voucher, details.ToList()));
        }

        return ResponseHelper.OK_Result(records, null);
    }

    [HttpGet("credit")]
    [EndpointSummary("Credit Pharmacy Voucher List")]
    [EndpointDescription("List all Pharmacy vouchers with a remaining credit amount (LeftAmount > 0).")]
    public async Task<IActionResult> GetCreditVoucher(long branchId)
    {
        IReadOnlyList<ViPharmacyVoucher> Pharmacyvouchers = await repo.ViPharmacyVouchers.GetAsync(
            x => !x.DeletedOn.HasValue &&
            x.BranchId == branchId &&
            x.LeftAmount > 0) ?? [];

        List<PharmacyVoucherListModel> records = new();

        foreach (ViPharmacyVoucher voucher in Pharmacyvouchers)
        {
            IReadOnlyList<ViPharmacyVoucherDetail> details = await repo.ViPharmacyVoucherDetails.GetAsync(x => x.Vno == voucher.Vno) ?? [];
            records.Add(new PharmacyVoucherListModel().ConstructFromView(voucher, details.ToList()));
        }

        return ResponseHelper.OK_Result(records, null);
    }

    [HttpGet("{vno}")]
    [EndpointSummary("Detail")]
    [EndpointDescription("Lists all voucher details for a specific Pharmacy voucher using its Vno.")]
    public async Task<IActionResult> GetDetailAsync(string vno)
    {
        IReadOnlyList<ViPharmacyVoucherDetail> pharmacyVoucherDetails = await repo.ViPharmacyVoucherDetails.GetAsync(x => x.Vno == vno) ?? [];
        return ResponseHelper.OK_Result(new
        {
            pharmacyVoucherDetails
        }, null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates a new Pharmacy Voucher.")]
    public async Task<IActionResult> CreatePharmacyVoucher(PharmacyVoucherEntryModel model)
    {
        model.Vno = idGenerateService.GetPharmacyVoucherVno(model.BranchId);
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;


        var mainStock = await repo.MainStocks.GetAsync(x => x.BranchId == model.BranchId) ?? [];

        // Check stock for each detail
        foreach (PharmacyVoucherDetail detail in model.Details)
        {
            var mainStockDetail = mainStock?
                .FirstOrDefault(x => x.ItemCode == detail.ItemCode && x.BranchId == model.BranchId);

            double groundBalance = mainStockDetail?.GroundBalance ?? 0;

            if (groundBalance < detail.Qty)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel(
                    $"Insufficient stock for item {detail.ItemCode}. Available: {groundBalance}, Requested: {detail.Qty}", ""));
            }
        }

        // Deduct stock
        foreach (PharmacyVoucherDetail detail in model.Details)
        {
            var stock = mainStock?.FirstOrDefault(x => x.ItemCode == detail.ItemCode && x.BranchId == model.BranchId);
            if (stock != null)
            {
                stock.GroundBalance -= detail.Qty;
                stock.UpdatedBy = User.Identity?.Name ?? string.Empty;
                stock.UpdatedOn = DateTime.Now;
                repo.MainStocks.Update(stock);
            }
            else
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel(
                    $"Item {detail.ItemCode} not found in stock.", ""));
            }
        }

        PharmacyVoucher voucher = new()
        {
            Vno = model.Vno,
            BranchId = model.BranchId,
            PatientId = model.PatientId,
            Vdate = model.Vdate,
            ReferDoctorId = model.ReferDoctorId,
            TotalAmount = model.TotalAmount,
            DiscountAmount = model.DiscountAmount,
            PaidAmount = model.PaidAmount,
            LeftAmount = model.LeftAmount,
            PaymentType = model.PaymentType,
            IssuePerson = model.IssuePerson,
            IssueDate = model.IssueDate,
            CreatedOn = model.CreatedOn,
            CreatedBy = model.CreatedBy,
            Remark = model.Remark,
        };
        repo.PharmacyVouchers.Create(voucher);

        if (model.Details != null && model.Details.Count > 0)
        {
            model.Details.ForEach(detail => detail.Vno = model.Vno);
            repo.PharmacyVoucherDetails.CreateRange(model.Details);

        }

        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("api/pharmacyvo/pharmacyvouchers/create", null, new DefaultResponseMessageModel("Sucessfully created Pharmacy Voucher.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Failed to create Pharmacy Voucher.", ""));
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update Credit Amounts")]
    [EndpointDescription("Updates the PaidAmount, and LeftAmount for Pharmacy voucher with a LeftAmount greater than 0.")]
    public async Task<IActionResult> UpdateAmounts(UpdatePharmacyVoucherModel model)
    {
        PharmacyVoucher? PharmacyVo = await repo.PharmacyVouchers.GetFirstAsync(x => x.Vno == model.Vno);

        if (PharmacyVo == null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Pharmacy Voucher not found.", ""));
        }

        if (PharmacyVo.LeftAmount <= 0)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Cannot update Pharmacy Voucher. LeftAmount must be greater than 0.", ""));
        }

        if (model.PaidAmount.HasValue)
        {
            if (model.PaidAmount > PharmacyVo.LeftAmount)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("PaidAmount cannot exceed the LeftAmount.", ""));
            }

            PharmacyVo.LeftAmount -= model.PaidAmount.Value;

            PharmacyVo.PaidAmount = (PharmacyVo.PaidAmount) + model.PaidAmount.Value;
        }

        PharmacyVo.UpdatedOn = DateTime.Now;
        PharmacyVo.UpdatedBy = User.Identity?.Name ?? string.Empty;

        repo.PharmacyVouchers.Update(PharmacyVo);

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated pay amounts.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update pay amounts.", ""));
    }

    [HttpDelete("{vno}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Deletes a pharmacy voucher by Vno.")]
    public async Task<IActionResult> Delete(string vno)
    {
        PharmacyVoucher? pharmacyVoucher = await repo.PharmacyVouchers.GetFirstAsync(x => x.Vno == vno);
        if (pharmacyVoucher == null)
        {
            return ResponseHelper.NotFound_Request(null,
                new DefaultResponseMessageModel("Pharmacy voucher not found.", ""));
        }
        pharmacyVoucher.DeletedOn = DateTime.Now;
        pharmacyVoucher.DeletedBy = User.Identity?.Name ?? string.Empty;
        repo.PharmacyVouchers.Update(pharmacyVoucher);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted pharmacy voucher.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete pharmacy voucher.", ""));
    }
    #endregion
}
