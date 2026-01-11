using WOMS.Server.Models.Stock.Sales;

namespace WOMS.Server.Controllers.Stock;

[Authorize]
[Route("api/stock/[controller]")]
[ApiController]
public class SalesController(IRepositoryWrapper repo, IIdGenerateService idGenerateService) : ControllerBase
{

    #region CRUD Operations

    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("List all sales without deleted data, filtered by date range.")]
    public async Task<IActionResult> Get(long BranchId, DateOnly startDate, DateOnly endDate)
    {
        IReadOnlyList<ViSale> Sales = await repo.ViSales.GetAsync(
            x => x.BranchId == BranchId && !x.DeletedOn.HasValue &&
            (x.SaleDate >= startDate.ToDateTime(TimeOnly.MinValue)) &&
            (x.SaleDate <= endDate.ToDateTime(TimeOnly.MaxValue))) ?? [];
        IReadOnlyList<ViSaleDetail> SaleDetails = await repo.ViSaleDetails.GetAsync(x => x.BranchId == BranchId) ?? [];

        List<SaleListModel> records = [];
        foreach (ViSale Sale in Sales)
        {
            records.Add(new SaleListModel().ConstructFromView(
                Sale,
                [.. SaleDetails.Where(x => x.SaleVno == Sale.SaleVno)]));
        }

        return ResponseHelper.OK_Result(records, null);
    }

    [HttpGet("{id}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Gets a Sale with specified id.")]
    public async Task<IActionResult> Get(string id, long BranchId)
       => ResponseHelper.OK_Result(await repo.Sales.GetFirstAsync(x => x.SaleVno == id && x.BranchId == BranchId), null);

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates a new Sale and updates SalePrice and SalePrice in MainStock.")]
    public async Task<IActionResult> CreateSale(SaleEntryModel model)
    {
        try
        {
            string SaleVno = idGenerateService.GetSaleVno(model.BranchId);

            Sale voucher = new()
            {
                SaleVno = SaleVno,
                CreatedOn = DateTime.Now,
                CreatedBy = User.Identity?.Name,
                ManualVno = model.ManualVno,
                PatientId = model.PatientId,
                BranchId = model.BranchId,
                SaleDate = model.SaleDate,
                TotalAmount = model.TotalAmount,
                DiscountAmount = model.DiscountAmount,
                NetAmount = model.NetAmount,
                PaymentType = model.PaymentType,
                Status = model.Status ?? true,
                Remark = model.Remark,
                PaidDate = DateTime.Now
            };
            repo.Sales.Create(voucher);

            IReadOnlyList<MainStock> mainStockList = await repo.MainStocks.GetAsync(x => x.BranchId == model.BranchId) ?? [];

            foreach (SaleEntryDetailModel item in model.Detail)
            {
                item.SaleVno = SaleVno;

                MainStock? mainStock = mainStockList.FirstOrDefault(x => x.ItemCode == item.ItemCode &&
                                                                         x.TypeCode == item.TypeCode);

                if (mainStock == null)
                {
                    return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel($"Item with ItemCode {item.ItemCode} and TypeCode {item.TypeCode} is not available in MainStock.", ""));
                }

                if (mainStock.GroundBalance < item.Qty)
                {
                    return ResponseHelper.Bad_Request(null,
                        new DefaultResponseMessageModel(
                            $"Insufficient stock for ItemCode {item.ItemCode} and TypeCode {item.TypeCode}. Available: {mainStock.GroundBalance}, Requested: {item.Qty}", ""));
                }

                mainStock.GroundBalance -= item.Qty;
                mainStock.UpdatedBy = User.Identity?.Name ?? string.Empty;
                mainStock.UpdatedOn = DateTime.Now;
                repo.MainStocks.Update(mainStock);

                SaleDetail itemDetail = new()
                {
                    SaleVno = voucher.SaleVno,
                    ItemCode = item.ItemCode,
                    TypeCode = item.TypeCode,
                    Qty = item.Qty,
                    Price = item.Price,
                    ExpireDate = item.ExpireDate
                };
                repo.SaleDetails.Create(itemDetail);
            }


            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("api/Sales", null,
                    new DefaultResponseMessageModel("Successfully created new Sale and updated SalePrice and SalePrice in MainStock and PharmacyStock.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create Sale.", ""));
        }
        catch (Exception ex)
        {
            return ResponseHelper.InternalServerError_Request(null,
                new DefaultResponseMessageModel("An error occurred while creating the Sale.", ex.Message));
        }
    }

    [HttpDelete("{id}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Deletes Sale along with its details and updates MainStock GroundBalance.")]
    public async Task<IActionResult> Delete(string id, string remark)
    {
        Sale? Sale = await repo.Sales.GetFirstAsync(x => x.SaleVno == id);

        if (Sale == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Sale not found.", ""));
        }

        if (Sale.DeletedOn != null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Sale is already deleted.", ""));
        }

        IReadOnlyList<SaleDetail> SaleDetails = await repo.SaleDetails.GetAsync(x => x.SaleVno == id) ?? [];

        foreach (SaleDetail detail in SaleDetails)
        {
            MainStock? mainStock = await repo.MainStocks.GetFirstAsync(
                x => x.ItemCode == detail.ItemCode && x.TypeCode == detail.TypeCode);

            if (mainStock == null)
            {
                return ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel($"MainStock not found for ItemCode {detail.ItemCode} and TypeCode {detail.TypeCode}.", ""));
            }
        }

        foreach (SaleDetail detail in SaleDetails)
        {
            // Update MainStock GroundBalance  
            MainStock? mainStock = await repo.MainStocks.GetFirstAsync(x => x.ItemCode == detail.ItemCode && x.TypeCode == detail.TypeCode);
            if (mainStock != null)
            {
                mainStock.GroundBalance += detail.Qty;
                mainStock.UpdatedBy = User.Identity?.Name ?? string.Empty;
                mainStock.UpdatedOn = DateTime.Now;
                repo.MainStocks.Update(mainStock);
            }

            repo.SaleDetails.Delete(detail);
        }

        Sale.DeletedOn = DateTime.Now;
        Sale.DeletedBy = User.Identity?.Name ?? string.Empty;
        Sale.Remark = remark;

        repo.Sales.Update(Sale);

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted Sale and its details, and updated MainStock.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete Sale.", ""));
    }
    #endregion
}
