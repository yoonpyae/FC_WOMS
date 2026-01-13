namespace WOMS.Server.Controllers.Stock
{
    [Authorize]
    [Route("api/stock/[controller]")]
    [ApiController]
    public class MainStocksController(IRepositoryWrapper repo) : ControllerBase
    {
        #region CRUD Operation
        [HttpGet]
        [EndpointSummary("List")]
        [EndpointDescription("List all Main Stocks by Clinic and Branch")]
        public async Task<IActionResult> Get(long clinicId, long branchId)
        {
            return ResponseHelper.OK_Result(
                await repo.ViMainStocks.GetAsync(x =>
                    x.ClinicId == clinicId &&
                    x.BranchId == branchId &&
                    !x.DeletedOn.HasValue
                ), null);
        }

        [HttpGet("code")]
        [EndpointSummary("Get By Code")]
        [EndpointDescription("Get a Main Stock with specified code")]
        public async Task<IActionResult> GetById(string code, long clinicId)
        {
            return ResponseHelper.OK_Result(
                    await repo.MainStocks.GetFirstAsync(x => x.ItemCode == code && x.ClinicId == clinicId), null);
        }

        [HttpGet("active")]
        [EndpointSummary("List Active")]
        [EndpointDescription("List all Main Stock with Status true")]
        public async Task<IActionResult> GetActive(long branchId)
        {
            return ResponseHelper.OK_Result(
                await repo.ViMainStocks.GetAsync(
                    x => x.BranchId == branchId && !x.DeletedOn.HasValue && x.Status == true
                ),
                null
            );
        }

        [HttpPost]
        [ValidateModel]
        [EndpointSummary("Create")]
        [EndpointDescription("Create a new Main Stock")]
        public async Task<IActionResult> Create(MainStock model)
        {
            model.CreatedOn = DateTime.Now;
            model.CreatedBy = User.Identity?.Name;

            MainStock? mainStock = await repo.MainStocks.GetFirstAsync(x => x.ItemCode == model.ItemCode);
            if (mainStock != null)
            {
                return ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel("Main Stock already exists.", ""));
            }

            repo.MainStocks.Create(model);
            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("api/MainStocks", null,
                new DefaultResponseMessageModel("Successfully created new Main Stock.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create Main Stock.", ""));
        }

        [HttpPut]
        [ValidateModel]
        [EndpointSummary("Update")]
        [EndpointDescription("Update a Main Stock")]
        public async Task<IActionResult> Edit(MainStock model)
        {
            MainStock? mainStock = await repo.MainStocks.GetFirstAsync(x => x.ItemCode == model.ItemCode);
            if (mainStock == null)
            {
                return ResponseHelper.NotFound_Request(null,
                    new DefaultResponseMessageModel("Main Stock not found.", ""));
            }

            mainStock.PurchasePrice = model.PurchasePrice;
            mainStock.SalePrice = model.SalePrice;
            mainStock.GroundBalance = model.GroundBalance;
            mainStock.TypeCode = model.TypeCode;
            mainStock.Status = model.Status;
            mainStock.Remark = model.Remark;
            mainStock.UpdatedOn = DateTime.Now;
            mainStock.UpdatedBy = User.Identity?.Name ?? string.Empty;

            repo.MainStocks.Update(mainStock);
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated Main Stock.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update Main Stock.", ""));
        }

        [HttpDelete("code")]
        [EndpointSummary("Delete")]
        [EndpointDescription("Delete a Main Stock")]
        public async Task<IActionResult> Delete(string code)
        {
            MainStock? mainStock = await repo.MainStocks.GetFirstAsync(x => x.ItemCode == code);
            if (mainStock == null)
            {
                return ResponseHelper.NotFound_Request(null,
                    new DefaultResponseMessageModel("Main Stock not found.", ""));
            }
            mainStock.DeletedOn = DateTime.Now;
            mainStock.DeletedBy = User.Identity?.Name ?? string.Empty;

            repo.MainStocks.Update(mainStock);
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted Main Stock.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete Main Stock.", ""));
        }
    }
    #endregion
}
