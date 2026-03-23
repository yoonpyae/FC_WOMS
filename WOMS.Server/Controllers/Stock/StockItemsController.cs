using WOMS.Server.Models.Stock.StockItems;

namespace WOMS.Server.Controllers.Stock;

[Authorize]
[Route("api/stock/[controller]")]
[ApiController]
public class StockItemsController(
    IRepositoryWrapper repo,
    IIdGenerateService idGenerateService) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("Lists all stock item without deleted data.")]
    public async Task<IActionResult> Get(long branchId)
    {
        return ResponseHelper.OK_Result(await repo.StockItems.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);
    }

    [HttpGet("itemCode")]
    [EndpointSummary("Get By Code")]
    [EndpointDescription("Gets a stock item with specified code and validates name.")]
    public async Task<IActionResult> GetByCode(string itemCode, string itemName, long branchId)
    {
        bool validItem = await repo.StockItems.AnyAsync(x => x.ItemCode == itemCode && x.ItemName != itemName && x.BranchId == branchId);
        return validItem
            ? ResponseHelper.Bad_Request(false,
                new DefaultResponseMessageModel("Item name is already used for another item code.", ""))
            : ResponseHelper.OK_Result(true, new DefaultResponseMessageModel("Item name can be use for item code", ""));
    }

    [HttpGet("auto-id")]
    [EndpointSummary("Get Item Code")]
    [EndpointDescription("Gets a stock item code.")]
    public async Task<IActionResult> GetAutoId(string Name, long BranchId)
    {
        return ResponseHelper.OK_Result(await idGenerateService.GetItemCode(Name, BranchId), null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates new stock item.")]
    public async Task<IActionResult> Create(StockItemEntryModel model)
    {
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;
        repo.StockItems.Create(model);

        MainStock mainStock = new()
        {
            ItemCode = model.ItemCode,
            TypeCode=model.TypeCode,
            PurchasePrice = 0,
            SalePrice = 0,
            GroundBalance = 0,
            BranchId=model.BranchId,
            CreatedBy = model.CreatedBy,
            CreatedOn = model.CreatedOn,
            Status = true,
        };
        repo.MainStocks.Create(mainStock);

        //PharmacyStock pharmacyStock = new()
        //{
        //    ItemCode = model.ItemCode,
        //    HospitalId = model.HospitalId,
        //    TypeCode = model.TypeCode,
        //    PurchasePrice = 0,
        //    SalePrice = 0,
        //    GroundBalance = 0,
        //    CreatedBy = model.CreatedBy,
        //    CreatedOn = model.CreatedOn,
        //    Status = true,
        //};
        //repo.PharmacyStocks.Create(pharmacyStock);

        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("/api/StockItems", null,
                new DefaultResponseMessageModel("Successfully created new stock item.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to created stock item", ""));
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update")]
    [EndpointDescription("Updates stock item.")]
    public async Task<IActionResult> Update(StockItem model)
    {
        StockItem? stockItem = await repo.StockItems.GetFirstAsync(x => x.ItemCode == model.ItemCode);

        if (stockItem == null)
        {
            return ResponseHelper.NotFound_Request(
                null, new DefaultResponseMessageModel("Item code not found.", ""));
        }

        stockItem.ItemName = model.ItemName;
        stockItem.ChemicalName = model.ChemicalName;
        stockItem.Status = model.Status;
        stockItem.UpdatedOn = DateTime.Now;
        stockItem.UpdatedBy = User.Identity?.Name ?? string.Empty;

        repo.StockItems.Update(stockItem);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated stock item.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update stock item", ""));
    }

    //[HttpDelete("{itemCode}")]
    //[EndpointSummary("Delete")]
    //[EndpointDescription("Delete stock item")]
    //public async Task<IActionResult> Delete(string ItemCode)
    //{
    //    bool purchaseDetail = await repo.PurchaseDetails.AnyAsync(x => x.ItemCode == ItemCode);

    //    if (purchaseDetail == false)
    //    {
    //        StockItem? stockItem = await repo.StockItems.GetFirstAsync(x => x.ItemCode == ItemCode);

    //        if (stockItem == null)
    //        {
    //            return ResponseHelper.NotFound_Request(null,
    //                new DefaultResponseMessageModel("Item code not found", ""));
    //        }

    //        stockItem.DeletedOn = DateTime.Now;
    //        stockItem.DeletedBy = User.Identity?.Name ?? string.Empty;
    //        repo.StockItems.Update(stockItem);

    //        MainStock? mainStock = await repo.MainStocks.GetFirstAsync(x => x.ItemCode == ItemCode);
    //        if (mainStock != null)
    //        {
    //            mainStock.DeletedOn = DateTime.Now;
    //            mainStock.DeletedBy = User.Identity?.Name ?? string.Empty;
    //            repo.MainStocks.Update(mainStock);
    //        }

    //        PharmacyStock? pharmacyStock = await repo.PharmacyStocks.GetFirstAsync(x => x.ItemCode == ItemCode);
    //        if (pharmacyStock != null)
    //        {
    //            pharmacyStock.DeletedOn = DateTime.Now;
    //            pharmacyStock.DeletedBy = User.Identity?.Name ?? string.Empty;
    //            repo.PharmacyStocks.Update(pharmacyStock);
    //        }

    //        return await repo.SaveAsync()
    //            ? ResponseHelper.OK_Result(null,
    //                new DefaultResponseMessageModel("Successfully delete stock item.", ""))
    //            : ResponseHelper.Bad_Request(null,
    //                new DefaultResponseMessageModel("Unable to delete item item.", ""));
    //    }

    //    return ResponseHelper.Bad_Request(null,
    //        new DefaultResponseMessageModel("Item Code record exists", ""));

    //}
}