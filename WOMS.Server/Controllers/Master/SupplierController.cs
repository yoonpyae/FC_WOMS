namespace ES_HIS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class SupplierController(
    IRepositoryWrapper repo) : ControllerBase
{
    #region CRUD Operation

    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("List all Supplier without deleted data")]
    public async Task<IActionResult> Get(long clinicId)
            => ResponseHelper.OK_Result(
               await repo.Suppliers.GetAsync(x => !x.DeletedOn.HasValue && x.ClinicId == clinicId),
               null);

    [HttpGet("{id:long}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Get Supplier by Id")]
    public async Task<IActionResult> Get(long id, long clinicId)
            => ResponseHelper.OK_Result(
        await repo.Suppliers.GetFirstAsync(x => x.SupplierId == id && x.ClinicId == clinicId) ,
        null);

    [HttpGet("auto-id")]
    [EndpointSummary("Get Auto Id")]
    [EndpointDescription("Gets an Supplier max id.")]
    public async Task<IActionResult> GetAutoId(long clinicId)
    {
        Supplier? lastRecord =
            await repo.Suppliers.GetFirstAsync(x => x.ClinicId == clinicId, q => q.OrderByDescending(x => x.SupplierId));

        long maxId = lastRecord?.SupplierId ?? 0;
        maxId++;
        return ResponseHelper.OK_Result(maxId, null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Create New Supplier")]
    public async Task<IActionResult> Create(Supplier model)
    {
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;

        repo.Suppliers.Create(model);
        return await repo.SaveAsync()
        ? ResponseHelper.Created_Result("/api/suppliers", null,
        new DefaultResponseMessageModel("Successfully created new Supplier.", ""))
        : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to created Supplier", ""));
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update")]
    [EndpointDescription("Update Existing Supplier")]
    public async Task<IActionResult> Edit(Supplier model)
    {
        Supplier? supplier = await repo.Suppliers.GetFirstAsync(x => x.SupplierId == model.SupplierId);

        if (supplier == null)
            return ResponseHelper.NotFound_Request(
                null,
                new DefaultResponseMessageModel("Supplier not found", ""));

        //Re-assign values
        supplier.SupplierId = model.SupplierId;
        supplier.ClinicId = model.ClinicId;
        supplier.CompanyName = model.CompanyName;
        supplier.ContactPerson = model.ContactPerson;
        supplier.Address = model.Address;
        supplier.Phone = model.Phone;
        supplier.Email = model.Email;
        supplier.Balance = model.Balance;
        supplier.UpdatedOn = DateTime.Now;
        supplier.UpdatedBy = User.Identity?.Name ?? string.Empty;
        supplier.Status = model.Status;

        repo.Suppliers.Update(supplier);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated supplier.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update supplier", ""));
    }

    [HttpDelete("{id:long}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Delete Existing Supplier")]
    public async Task<IActionResult> Delete(long? id)
    {
        Supplier? supplier = await repo.Suppliers.GetFirstAsync(x => x.SupplierId == id);

        if (supplier == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Supplier not found.", ""));
        }

        //bool isUsedInPurchase = await repo.Purchases.AnyAsync(p => p.SupplierId == id && p.DeletedOn == null);
        //if (isUsedInPurchase)
        //{
        //    return ResponseHelper.Bad_Request(
        //        null,
        //        new DefaultResponseMessageModel("Cannot delete supplier. It is already used in a purchase record.", "")
        //    );
        //}

        string userName = User.Identity?.Name ?? string.Empty;
        supplier.DeletedOn = DateTime.Now;
        supplier.DeletedBy = userName;

        repo.Suppliers.Update(supplier);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted supplier.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete supplier", ""));
    }

    #endregion
}
