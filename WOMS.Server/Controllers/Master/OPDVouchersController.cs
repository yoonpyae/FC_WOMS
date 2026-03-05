using WOMS.Server.Models.OPD;

namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class OPDVouchersController(IRepositoryWrapper repo, IIdGenerateService idGenerateService) : ControllerBase
{
    #region CRUD Operations
    [HttpGet]
    [EndpointSummary("List All")]
    [EndpointDescription("Lists all OPD vouchers without deleted data.")]
    public async Task<IActionResult> Get(long branchId)
        => ResponseHelper.OK_Result(
            await repo.ViOPDVouchers.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);

    [HttpGet("{id}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Gets an OPD voucher with specified id.")]
    public async Task<IActionResult> Get(string id, long branchId)
        => ResponseHelper.OK_Result(
            await repo.ViOPDVouchers.GetFirstAsync(x => x.Opdvno == id && x.BranchId == branchId), null);

    [HttpGet("by-dateRange")]
    [EndpointSummary("List By Date Range")]
    [EndpointDescription("Lists all OPD vouchers without deleted data, filtered by date range.")]
    public async Task<IActionResult> GetByDateRange(long branchId, DateOnly startDate, DateOnly endDate)
    {
        DateTime start = startDate.ToDateTime(TimeOnly.MinValue);
        DateTime end = endDate.ToDateTime(TimeOnly.MaxValue);
        IReadOnlyList<ViOPDVoucher> vouchers = await repo.ViOPDVouchers.GetAsync(
            x => x.BranchId == branchId &&
                 !x.DeletedOn.HasValue &&
                 x.Vdate >= start &&
                 x.Vdate <= end
        ) ?? [];
        return ResponseHelper.OK_Result(vouchers, null);
    }

    [HttpGet("{vno}")]
    [EndpointSummary("Detail")]
    [EndpointDescription("Lists all voucher details for a specific OPD voucher using its Vno.")]
    public async Task<IActionResult> GetDetails(string vno)
    {
        IReadOnlyList<ViOPDVoucherItem> details = await repo.ViOPDVoucherItems.GetAsync(x => x.Opdvno == vno) ?? [];
        return ResponseHelper.OK_Result(details, null);
    }

    [HttpPost]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates a new OPD voucher.")]
    public async Task<IActionResult> CreateOPDVoucher(OPDVoucherEntryModel model)
    {
        try
        {
            string vno = idGenerateService.GetOPDVNo(model.BranchId);

            bool isFullyPaid = model.LeftAmount == 0 && model.PaidAmount == model.TotalAmount;

            OPDVoucher voucher = new()
            {
                Opdvno = vno,
                BranchId = model.BranchId,
                DoctorId = model.DoctorId,
                PatientId = model.PatientId,
                Vdate = model.Vdate,
                TotalAmount = model.TotalAmount,
                DiscountAmount = model.DiscountAmount,
                PaidAmount = model.PaidAmount,
                LeftAmount = model.LeftAmount,
                PaymentType = model.PaymentType,
                CreatedOn = DateTime.UtcNow,
                CreatedBy = User.Identity?.Name,
                Status = isFullyPaid ? "Paid" : "Unpaid",
                Remark = model.Remark,
            };

            repo.OPDVouchers.Create(voucher);

            foreach (OPDVoucherItem item in model.Items)
            {
                OPDVoucherItem voucherItem = new()
                {
                    Opdvno = vno,
                    ServiceId = item.ServiceId,
                    ConsultationId = item.ConsultationId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Amount = item.Amount,
                    Result = item.Result,
                    ResultDate = item.ResultDate
                };
                repo.OPDVoucherItems.Create(voucherItem);
            }


            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("api/opdvouchers/create", null,
                    new DefaultResponseMessageModel("Successfully created OPD Voucher.", ""))
                : ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel("Failed to create OPD Voucher.", ""));
        }
        catch (Exception ex)
        {
            return ResponseHelper.InternalServerError_Request(null,
                new DefaultResponseMessageModel("An error occurred while creating the OPD Voucher.", ex.Message));
        }
    }

    [HttpPut("{vno}")]
    [EndpointSummary("Update")]
    [EndpointDescription("Updates an existing OPD voucher and its items.")]
    public async Task<IActionResult> UpdateOPDVoucher(string vno, [FromBody] OPDVoucherEntryModel model)
    {
        try
        {
            // 1. Fetch the existing voucher (Ensure it matches the branch)
            OPDVoucher? existingVoucher = await repo.OPDVouchers.GetFirstAsync(x => x.Opdvno == vno && x.BranchId == model.BranchId);

            if (existingVoucher == null)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Voucher not found.", ""));
            }

            bool isFullyPaid = model.LeftAmount == 0 && model.PaidAmount == model.TotalAmount;

            // 2. Update parent voucher properties
            existingVoucher.DoctorId = model.DoctorId;
            existingVoucher.PatientId = model.PatientId;
            existingVoucher.Vdate = model.Vdate;
            existingVoucher.TotalAmount = model.TotalAmount;
            existingVoucher.DiscountAmount = model.DiscountAmount;
            existingVoucher.PaidAmount = model.PaidAmount;
            existingVoucher.LeftAmount = model.LeftAmount;
            existingVoucher.PaymentType = model.PaymentType;
            existingVoucher.Remark = model.Remark;
            existingVoucher.UpdatedOn = DateTime.UtcNow;
            existingVoucher.UpdatedBy = User.Identity?.Name;
            existingVoucher.Status = isFullyPaid ? "Paid" : "Unpaid";

            repo.OPDVouchers.Update(existingVoucher);

            // 3. Handle Items: Remove old items
            IReadOnlyList<OPDVoucherItem>? existingItems = await repo.OPDVoucherItems.GetAsync(x => x.Opdvno == vno);
            if (existingItems != null)
            {
                foreach (OPDVoucherItem item in existingItems)
                {
                    repo.OPDVoucherItems.Delete(item);
                }
            }

            // 4. Handle Items: Add new items
            if (model.Items != null)
            {
                foreach (OPDVoucherItem item in model.Items)
                {
                    OPDVoucherItem voucherItem = new()
                    {
                        Opdvno = vno,
                        ServiceId = item.ServiceId,
                        ConsultationId = item.ConsultationId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        Amount = item.Amount,
                        Result = item.Result,
                        ResultDate = item.ResultDate
                    };
                    repo.OPDVoucherItems.Create(voucherItem);
                }
            }

            // 5. Save all changes atomically
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated OPD Voucher.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Failed to update OPD Voucher.", ""));
        }
        catch (Exception ex)
        {
            return ResponseHelper.InternalServerError_Request(null,
                new DefaultResponseMessageModel("An error occurred while updating the OPD Voucher.", ex.Message));
        }
    }

    [HttpDelete("{vno}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Soft deletes an existing OPD voucher.")]
    public async Task<IActionResult> DeleteOPDVoucher(string vno, [FromQuery] long branchId)
    {
        try
        {
            // 1. Fetch existing voucher (require branchId for security)
            OPDVoucher? existingVoucher = await repo.OPDVouchers.GetFirstAsync(x => x.Opdvno == vno && x.BranchId == branchId);

            if (existingVoucher == null)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Voucher not found.", ""));
            }

            // 2. Apply Soft Delete fields
            existingVoucher.DeletedOn = DateTime.UtcNow;
            existingVoucher.DeletedBy = User.Identity?.Name;

            repo.OPDVouchers.Update(existingVoucher);

            // 3. Save changes
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted OPD Voucher.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Failed to delete OPD Voucher.", ""));
        }
        catch (Exception ex)
        {
            return ResponseHelper.InternalServerError_Request(null,
                new DefaultResponseMessageModel("An error occurred while deleting the OPD Voucher.", ex.Message));
        }
    }

    #endregion
}
