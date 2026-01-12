using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WOMS.Server.Models.Stock.Sales;

namespace WOMS.Server.Controllers.Pharmacy;

[Authorize]
[Route("api/pharmacy/[controller]")]
[ApiController]
public class SlaesController(
    IRepositoryWrapper repo,
    IIdGenerateService idGenerateService) : ControllerBase
{
    #region CRUD Operations

    [HttpGet]
    [EndpointSummary("List All")]
    [EndpointDescription("Lists all pharmacy vouchers without deleted data.")]
    public async Task<IActionResult> Get(long branchId)
        => ResponseHelper.OK_Result(
            await repo.ViSales.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);

    [HttpGet("by-dateRange")]
    [EndpointSummary("List By Date Range")]
    [EndpointDescription("Lists all pharmacy vouchers without deleted data, filtered by date range.")]
    public async Task<IActionResult> GetByDateRange(long branchId, DateOnly startDate, DateOnly endDate)
    {
        DateTime start = startDate.ToDateTime(TimeOnly.MinValue);
        DateTime end = endDate.ToDateTime(TimeOnly.MaxValue);

        IReadOnlyList<ViSale> vouchers = await repo.ViSales.GetAsync(
            x => x.BranchId == branchId &&
                 !x.DeletedOn.HasValue &&
                 x.SaleDate >= start &&
                 x.SaleDate <= end
        ) ?? [];

        List<SaleListModel> records = new();

        foreach (ViSale voucher in vouchers)
        {
            IReadOnlyList<ViSaleDetail> details = await repo.ViSaleDetails.GetAsync(x => x.SaleVno == voucher.SaleVno) ?? [];
            records.Add(new SaleListModel().ConstructFromView(voucher, details.ToList()));
        }

        return ResponseHelper.OK_Result(records, null);
    }

    [HttpGet("credit")]
    [EndpointSummary("Credit Pharmacy Voucher List")]
    [EndpointDescription("List all Pharmacy vouchers with a remaining credit amount (LeftAmount > 0).")]
    public async Task<IActionResult> GetCreditVoucher(long branchId)
    {
        IReadOnlyList<ViSale> Pharmacyvouchers = await repo.ViSales.GetAsync(
            x => !x.DeletedOn.HasValue &&
            x.BranchId == branchId &&
            x.LeftAmount > 0) ?? [];

        List<SaleListModel> records = new();

        foreach (ViSale voucher in Pharmacyvouchers)
        {
            IReadOnlyList<ViSaleDetail> details = await repo.ViSaleDetails.GetAsync(x => x.SaleVno == voucher.SaleVno) ?? [];
            records.Add(new SaleListModel().ConstructFromView(voucher, details.ToList()));
        }

        return ResponseHelper.OK_Result(records, null);
    }

    [HttpGet("{SaleVno}")]
    [EndpointSummary("Detail")]
    [EndpointDescription("Lists all voucher items for a specific Pharmacy voucher using its SaleVno.")]
    public async Task<IActionResult> GetDetailAsync(string saleVno)
    {
        IReadOnlyList<ViSaleDetail> pharmacyVoucherDetails = await repo.ViSaleDetails.GetAsync(x => x.SaleVno == saleVno) ?? [];
        return ResponseHelper.OK_Result(new
        {
            pharmacyVoucherDetails
        }, null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates a new Pharmacy Voucher.")]
    public async Task<IActionResult> CreatePharmacyVoucher(SaleEntryModel model)
    {
        model.SaleVno = idGenerateService.GetSaleVno(model.BranchId);
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;


        IReadOnlyList<MainStock> mainStock = await repo.MainStocks.GetAsync(x => x.BranchId == model.BranchId) ?? [];

        // Check stock for each detail
        foreach (SaleDetail detail in model.Details)
        {
            MainStock? saleDetail = mainStock?
                .FirstOrDefault(x => x.ItemCode == detail.ItemCode && x.BranchId == model.BranchId);

            double groundBalance = saleDetail?.GroundBalance ?? 0;


            if (groundBalance < detail.Qty)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel(
                    $"Insufficient stock for item {detail.ItemCode}. Available: {groundBalance}, Requested: {detail.Qty}", ""));
            }
        }

        // Update Mainstock
        foreach (SaleDetail detail in model.Details)
        {
            MainStock? stock = mainStock?.FirstOrDefault(x => x.ItemCode == detail.ItemCode && x.BranchId == model.BranchId);
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

        Sale voucher = new()
        {
            SaleVno = model.SaleVno,
            BranchId = model.BranchId,
            PatientId = model.PatientId,
            SaleDate = model.SaleDate,
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
        repo.Sales.Create(voucher);

        if (model.Details != null && model.Details.Count > 0)
        {
            model.Details.ForEach(detail => detail.SaleVno = model.SaleVno);
            repo.SaleDetails.CreateRange(model.Details);
        }

        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("api/pharmacy/sales/create", null, new DefaultResponseMessageModel("Sucessfully created Pharmacy Voucher.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Failed to create Pharmacy Voucher.", ""));
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update Credit Amounts")]
    [EndpointDescription("Updates the PaidAmount, and LeftAmount for Pharmacy voucher with a LeftAmount greater than 0.")]
    public async Task<IActionResult> UpdateAmounts(UpdateSaleModel model)
    {
        Sale? SaleVno = await repo.Sales.GetFirstAsync(x => x.SaleVno == model.SaleVno);

        if (SaleVno == null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Pharmacy Voucher not found.", ""));
        }

        if (SaleVno.LeftAmount <= 0)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Cannot update Pharmacy Voucher. LeftAmount must be greater than 0.", ""));
        }

        if (model.PaidAmount.HasValue)
        {
            if (model.PaidAmount > SaleVno.LeftAmount)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("PaidAmount cannot exceed the LeftAmount.", ""));
            }

            SaleVno.LeftAmount -= model.PaidAmount.Value;

            SaleVno.PaidAmount = (SaleVno.PaidAmount) + model.PaidAmount.Value;
        }

        SaleVno.UpdatedOn = DateTime.Now;
        SaleVno.UpdatedBy = User.Identity?.Name ?? string.Empty;

        repo.Sales.Update(SaleVno);

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated pay amounts.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update pay amounts.", ""));
    }

    [HttpDelete("{SaleVno}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Deletes a pharmacy voucher by SaleVno.")]
    public async Task<IActionResult> Delete(string saleVno)
    {
        Sale? pharmacyVoucher = await repo.Sales.GetFirstAsync(x => x.SaleVno == saleVno);
        if (pharmacyVoucher == null)
        {
            return ResponseHelper.NotFound_Request(null,
                new DefaultResponseMessageModel("Pharmacy voucher not found.", ""));
        }
        pharmacyVoucher.DeletedOn = DateTime.Now;
        pharmacyVoucher.DeletedBy = User.Identity?.Name ?? string.Empty;
        repo.Sales.Update(pharmacyVoucher);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted pharmacy voucher.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete pharmacy voucher.", ""));
    }
    #endregion
}
