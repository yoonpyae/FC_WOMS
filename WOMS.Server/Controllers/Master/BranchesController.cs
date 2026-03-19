using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class BranchesController(IRepositoryWrapper repo) : ControllerBase
{

    #region CRUD Operation

    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("Lists all Branch without deleted data.")]
    public async Task<IActionResult> Get()
    {
        return ResponseHelper.OK_Result(
            await repo.Branches.GetAsync(x => !x.DeletedOn.HasValue),
            null);
    }

    [HttpGet("{id:long}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Gets an Branch Test with specified id.")]
    public async Task<IActionResult> Get(long id)
    {
        return ResponseHelper.OK_Result(
            await repo.Branches.GetAsync(x => x.BranchId == id),
            null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates new Branch Test.")]
    public async Task<IActionResult> Create(Branch model)
    {
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;

        repo.Branches.Create(model);
        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("/api/Branch", null,
                new DefaultResponseMessageModel("Successfully created new Branch.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create Branch", ""));
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update")]
    [EndpointDescription("Updates an existing Branch.")]
    public async Task<IActionResult> Update(Branch model)
    {
        var branch = await repo.Branches.GetFirstAsync(x => x.BranchId == model.BranchId);
        if (branch == null)
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Branch not found.", ""));

        // Update fields
        branch.BranchName = model.BranchName;
        branch.ContactPerson = model.ContactPerson;
        branch.PrimaryPhone = model.PrimaryPhone;
        branch.OtherPhone = model.OtherPhone;
        branch.Email = model.Email;
        branch.AddressDetail = model.AddressDetail;
        branch.TownshipId = model.TownshipId;
        branch.StateId = model.StateId;
        branch.Status = model.Status;
        branch.IsDefault = model.IsDefault;
        branch.Remark = model.Remark;

        // Audit trails
        branch.UpdatedOn = DateTime.Now;
        branch.UpdatedBy = User.Identity?.Name ?? string.Empty;

        repo.Branches.Update(branch);

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated Branch.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update Branch", ""));
    }

    #endregion
}
