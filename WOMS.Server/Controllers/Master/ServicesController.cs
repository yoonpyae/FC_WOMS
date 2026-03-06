using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class ServicesController(IRepositoryWrapper repo) : ControllerBase
{
    #region CRUD Operations

    [HttpGet]
    [EndpointSummary("List All")]
    [EndpointDescription("Lists all services without deleted data.")]
    public async Task<IActionResult> Get(long branchId)
        => ResponseHelper.OK_Result(
            await repo.Services.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);

    [HttpGet("{id:long}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Gets a service with specified id.")]
    public async Task<IActionResult> Get(long id, long branchId)
        => ResponseHelper.OK_Result(
            await repo.Services.GetFirstAsync(x => x.ServiceId == id && x.BranchId == branchId), null);

    [HttpGet("auto-id")]
    [EndpointSummary("Get Auto Id")]
    [EndpointDescription("Gets a service max id.")]
    public async Task<IActionResult> GetAutoId(long branchId)
    {
        Service? lastRecord = await repo.Services.GetFirstAsync(x => x.BranchId == branchId, x => x.OrderByDescending(s => s.ServiceId));
        long autoId = (lastRecord != null) ? lastRecord.ServiceId + 1 : 1;
        return ResponseHelper.OK_Result(autoId, null);
    }

    [HttpPost]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates a new service.")]
    public async Task<IActionResult> Create(Service model)
    {
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;

        repo.Services.Create(model);

        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("api/master", null,
                new DefaultResponseMessageModel("Successfully created new Service.", ""))
            : ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("Unable to create Service", ""));
        #endregion
    }

    [HttpPut]
    [EndpointSummary("Update")]
    [EndpointDescription("Updates a service with specified id.")]
    public async Task<IActionResult> Update(Service model)
    {
        Service? existingService = await repo.Services.GetFirstAsync(x => x.ServiceId == model.ServiceId && x.BranchId == model.BranchId);
        if (existingService is null)
            return ResponseHelper.NotFound_Request(null,
                new DefaultResponseMessageModel("Unable to find Service", ""));
        existingService.ServiceName = model.ServiceName;
        existingService.Fee = model.Fee;
        existingService.UpdatedOn = DateTime.Now;
        existingService.UpdatedBy = User.Identity?.Name ?? string.Empty;
        repo.Services.Update(existingService);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null,
                new DefaultResponseMessageModel("Successfully updated Service.", ""))
            : ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("Unable to update Service", ""));
    }

    [HttpDelete("{id:long}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Deletes a service with specified id.")]
    public async Task<IActionResult> Delete(long id, long branchId)
    {
        Service? existingService = await repo.Services.GetFirstAsync(x => x.ServiceId == id && x.BranchId == branchId);
        if (existingService is null)
            return ResponseHelper.NotFound_Request(null,
                new DefaultResponseMessageModel("Unable to find Service", ""));
        existingService.DeletedOn = DateTime.Now;
        existingService.DeletedBy = User.Identity?.Name ?? string.Empty;
        repo.Services.Update(existingService);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null,
                new DefaultResponseMessageModel("Successfully deleted Service.", ""))
            : ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("Unable to delete Service", ""));
    }
}
