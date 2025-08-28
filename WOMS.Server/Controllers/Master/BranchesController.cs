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

    #endregion
}
