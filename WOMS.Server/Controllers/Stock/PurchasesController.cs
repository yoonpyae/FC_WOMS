using WOMS.Server.Models.Stock.Purchases;

namespace WOMS.Server.Controllers.Stock;

[Authorize]
[Route("api/stock/[controller]")]
[ApiController]
public class PurchasesController(
    IRepositoryWrapper repo,
    IIdGenerateService idGenerateService) : ControllerBase
{

    #region CRUD Operations

    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("Lists all purchases without deleted data, filtered by date range.")]
    public async Task<IActionResult> Get(long BranchId, DateOnly startDate, DateOnly endDate)
    {
        IReadOnlyList<ViPurchase> purchases = await repo.ViPurchases.GetAsync(
            x => x.BranchId == BranchId && !x.DeletedOn.HasValue &&
            (x.PurchaseDate >= startDate.ToDateTime(TimeOnly.MinValue)) &&
            (x.PurchaseDate <= endDate.ToDateTime(TimeOnly.MaxValue))) ?? [];
        IReadOnlyList<ViPurchaseDetail> purchaseDetails = await repo.ViPurchaseDetails.GetAsync(x => x.BranchId == BranchId) ?? [];

        List<PurchaseListModel> records = [];
        foreach (ViPurchase purchase in purchases)
        {
            records.Add(new PurchaseListModel().ConstructFromView(
                purchase,
                [.. purchaseDetails.Where(x => x.PurchaseVno == purchase.PurchaseVno)]));
        }

        return ResponseHelper.OK_Result(records, null);
    }

    [HttpGet("{id}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Gets a purchase with specified id.")]
    public async Task<IActionResult> Get(string id, long BranchId)
        => ResponseHelper.OK_Result(await repo.Purchases.GetFirstAsync(x => x.PurchaseVno == id && x.BranchId == BranchId), null);

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates a new purchase and updates SalePrice and PurchasePrice in MainStock.")]
    public async Task<IActionResult> CreatePurchase(PurchaseEntryModel model)
    {
        try
        {
            string purchaseVno = idGenerateService.GetPurchaseVno(model.BranchId);

            bool isFullyPaid = model.LeftAmount == 0 && model.PayAmount == model.NetAmount;

            Purchase voucher = new()
            {
                PurchaseVno = purchaseVno,
                CreatedOn = DateTime.Now,
                CreatedBy = User.Identity?.Name,
                ManualVno = model.ManualVno,
                SupplierId = model.SupplierId,
                BranchId = model.BranchId,
                PurchaseDate = model.PurchaseDate,
                TotalAmount = model.TotalAmount,
                DiscountAmount = model.DiscountAmount,
                NetAmount = model.NetAmount,
                PayAmount = model.PayAmount,
                LeftAmount = model.LeftAmount,
                PaymentType = model.PaymentType,
                Status = model.Status ?? true,
                Remark = model.Remark,
                PaidDate = isFullyPaid ? DateTime.Now : null
            };
            repo.Purchases.Create(voucher);

            IReadOnlyList<MainStock> mainStockList = await repo.MainStocks.GetAsync(x => x.BranchId == model.BranchId) ?? [];

            foreach (PurchaseEntryDetailModel item in model.Detail)
            {
                item.PurchaseVno = purchaseVno;

                MainStock? mainStock = mainStockList.FirstOrDefault(x => x.ItemCode == item.ItemCode &&
                                                                         x.TypeCode == item.TypeCode);

                if (mainStock == null)
                {
                    return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel($"Item with ItemCode {item.ItemCode} and TypeCode {item.TypeCode} is not available in MainStock.", ""));
                }

                // Update MainStock 
                double existingQty = mainStock.GroundBalance;
                double existingCost = mainStock.PurchasePrice;
                double newQty = item.Qty;
                double newCost = item.Price;
                double totalQty = existingQty + newQty;

                mainStock.AvgPrice = totalQty > 0 ? ((existingQty * existingCost) + (newQty * newCost)) / totalQty : 0;

                mainStock.GroundBalance += item.Qty;
                mainStock.SalePrice = item.SalePrice;
                mainStock.PurchasePrice = item.Price;
                mainStock.UpdatedBy = User.Identity?.Name ?? string.Empty;
                mainStock.UpdatedOn = DateTime.Now;
                repo.MainStocks.Update(mainStock);

                PurchaseDetail itemDetail = new()
                {
                    PurchaseVno = voucher.PurchaseVno,
                    ItemCode = item.ItemCode,
                    TypeCode = item.TypeCode,
                    Qty = item.Qty,
                    Price = item.Price,
                    ExpireDate = item.ExpireDate
                };
                repo.PurchaseDetails.Create(itemDetail);
            }


            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("api/Purchases", null,
                    new DefaultResponseMessageModel("Successfully created new Purchase and updated SalePrice and PurchasePrice in MainStock and PharmacyStock.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create Purchase.", ""));
        }
        catch (Exception ex)
        {
            return ResponseHelper.InternalServerError_Request(null,
                new DefaultResponseMessageModel("An error occurred while creating the purchase.", ex.Message));
        }
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update Purchase Amounts")]
    [EndpointDescription("Updates the TotalAmount, PayAmount, and LeftAmount for purchases with a LeftAmount greater than 0.")]
    public async Task<IActionResult> UpdateAmounts(UpdatePurcahseModel model)
    {
        Purchase? purchase = await repo.Purchases.GetFirstAsync(x => x.PurchaseVno == model.PurchaseVno);

        if (purchase == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Purchase not found.", ""));
        }

        if (purchase.LeftAmount <= 0)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Cannot update purchase. LeftAmount must be greater than 0.", ""));
        }

        if (model.PayAmount.HasValue)
        {
            if (model.PayAmount > purchase.LeftAmount)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("PayAmount cannot exceed the LeftAmount.", ""));
            }

            purchase.LeftAmount -= model.PayAmount.Value;

            purchase.PayAmount = (purchase.PayAmount ?? 0) + model.PayAmount.Value;
        }

        if (purchase.LeftAmount == 0 && purchase.PayAmount == purchase.NetAmount)
        {
            purchase.PaidDate = DateTime.Now;
        }

        purchase.UpdatedOn = DateTime.Now;
        purchase.UpdatedBy = User.Identity?.Name ?? string.Empty;

        repo.Purchases.Update(purchase);

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated purchase amounts.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update purchase amounts.", ""));
    }

    [HttpDelete("{id}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Deletes purchase along with its details and updates MainStock GroundBalance.")]
    public async Task<IActionResult> Delete(string id, string remark)
    {
        Purchase? purchase = await repo.Purchases.GetFirstAsync(x => x.PurchaseVno == id);

        if (purchase == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Purchase not found.", ""));
        }

        if (purchase.CreatedOn.HasValue && (DateTime.Now - purchase.CreatedOn.Value).TotalDays > 1)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Purchase deletion is not allowed after 24 hours from the time of creation.", ""));
        }

        IReadOnlyList<PurchaseDetail> purchaseDetails = await repo.PurchaseDetails.GetAsync(x => x.PurchaseVno == id) ?? [];

        foreach (PurchaseDetail detail in purchaseDetails)
        {
            MainStock? mainStock = await repo.MainStocks.GetFirstAsync(x => x.ItemCode == detail.ItemCode && x.TypeCode == detail.TypeCode);
            if (mainStock != null && (detail.Qty > mainStock.GroundBalance))
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel(
                    $"Cannot delete purchase. Qty for item {detail.ItemCode} (Qty: {detail.Qty}) is greater than current MainStock GroundBalance ({mainStock.GroundBalance}).", ""));
            }
        }

        foreach (PurchaseDetail detail in purchaseDetails)
        {
            // Update MainStock GroundBalance  
            MainStock? mainStock = await repo.MainStocks.GetFirstAsync(x => x.ItemCode == detail.ItemCode && x.TypeCode == detail.TypeCode);
            if (mainStock != null)
            {
                mainStock.GroundBalance -= detail.Qty;
                mainStock.UpdatedBy = User.Identity?.Name ?? string.Empty;
                mainStock.UpdatedOn = DateTime.Now;
                repo.MainStocks.Update(mainStock);
            }

            repo.PurchaseDetails.Delete(detail);
        }

        purchase.DeletedOn = DateTime.Now;
        purchase.DeletedBy = User.Identity?.Name ?? string.Empty;
        purchase.Remark = remark;

        repo.Purchases.Update(purchase);

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted purchase and its details, and updated MainStock.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete purchase.", ""));
    }

    #endregion
}
