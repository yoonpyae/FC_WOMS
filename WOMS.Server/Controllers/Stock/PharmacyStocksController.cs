//namespace ES_HIS.Server.Controllers.Stock
//{
//    [Authorize]
//    [Route("api/stock/[controller]")]
//    [ApiController]
//    public class PharmacyStocksController(IRepositoryWrapper repo) : ControllerBase
//    {
//        #region CRUD Operation
//        [HttpGet]
//        [EndpointSummary("List")]
//        [EndpointDescription("List all Pharmacy Stock")]
//        public async Task<IActionResult> Get(long hospitalId)
//        {
//            return ResponseHelper.OK_Result(
//                    await repo.ViPharmacyStocks.GetAsync(x => x.HospitalId == hospitalId && !x.DeletedOn.HasValue), null);
//        }

//        [HttpGet("active")]
//        [EndpointSummary("List Active")]
//        [EndpointDescription("List all Pharmacy Stock with Status true")]
//        public async Task<IActionResult> GetActive(long hospitalId)
//        {
//            return ResponseHelper.OK_Result(
//                await repo.ViPharmacyStocks.GetAsync(
//                    x => x.HospitalId == hospitalId && !x.DeletedOn.HasValue && x.Status == true
//                ),
//                null
//            );
//        }

//        [HttpGet("code")]
//        [EndpointSummary("Get By Code")]
//        [EndpointDescription("Get a Pharmacy Stock with specified code")]
//        public async Task<IActionResult> GetById(string code, long hospitalId)
//        {
//            return ResponseHelper.OK_Result(
//                    await repo.ViPharmacyStocks.GetFirstAsync(x => x.ItemCode == code && x.HospitalId == hospitalId), null);
//        }

//        [HttpPost]
//        [ValidateModel]
//        [EndpointSummary("Create")]
//        [EndpointDescription("Create a new Main Stock")]
//        public async Task<IActionResult> Create(PharmacyStock model)
//        {
//            model.CreatedOn = DateTime.Now;
//            model.CreatedBy = User.Identity?.Name;

//            repo.PharmacyStocks.Create(model);
//            return await repo.SaveAsync()
//                ? ResponseHelper.Created_Result("api/PharmacyStocks", null,
//                new DefaultResponseMessageModel("Successfully created new Pharmacy Stock.", ""))
//                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create Pharmacy Stock.", ""));
//        }

//        [HttpPut]
//        [ValidateModel]
//        [EndpointSummary("Update")]
//        [EndpointDescription("Update a Pharmacy Stock")]
//        public async Task<IActionResult> Edit(PharmacyStock model)
//        {
//            PharmacyStock? pharmacyStock = await repo.PharmacyStocks.GetFirstAsync(x => x.ItemCode == model.ItemCode);
//            if (pharmacyStock == null)
//            {
//                return ResponseHelper.NotFound_Request(null,
//                    new DefaultResponseMessageModel("Pharmacy Stock not found.", ""));
//            }

//            pharmacyStock.PurchasePrice = model.PurchasePrice;
//            pharmacyStock.SalePrice = model.SalePrice;
//            pharmacyStock.TypeCode = model.TypeCode;
//            pharmacyStock.Status = model.Status;
//            pharmacyStock.Remark = model.Remark;
//            pharmacyStock.UpdatedOn = DateTime.Now;
//            pharmacyStock.UpdatedBy = User.Identity?.Name ?? string.Empty;

//            repo.PharmacyStocks.Update(pharmacyStock);
//            return await repo.SaveAsync()
//                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated Pharmacy Stock.", ""))
//                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update Pharmacy Stock.", ""));
//        }

//        [HttpDelete("code")]
//        [EndpointSummary("Delete")]
//        [EndpointDescription("Delete a Pharmacy Stock")]
//        public async Task<IActionResult> Delete(string code)
//        {
//            PharmacyStock? pharmacyStock = await repo.PharmacyStocks.GetFirstAsync(x => x.ItemCode == code);
//            if (pharmacyStock == null)
//            {
//                return ResponseHelper.NotFound_Request(null,
//                    new DefaultResponseMessageModel("Pharmacy Stock not found.", ""));
//            }
//            pharmacyStock.DeletedOn = DateTime.Now;
//            pharmacyStock.DeletedBy = User.Identity?.Name ?? string.Empty;

//            repo.PharmacyStocks.Update(pharmacyStock);
//            return await repo.SaveAsync()
//                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted Pharmacy Stock.", ""))
//                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete Pharmacy Stock.", ""));
//        }
//    }
//    #endregion
//}


