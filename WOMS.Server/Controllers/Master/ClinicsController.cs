namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class ClinicsController(IRepositoryWrapper repo) : ControllerBase
{

    #region CRUD Operation

    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("Lists all Hospital without deleted data.")]
    public async Task<IActionResult> Get()
    {
        return ResponseHelper.OK_Result(
            await repo.Clinics.GetAsync(x => !x.DeletedOn.HasValue),
            null);
    }

    [HttpGet("{id:long}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Gets an Hospital Test with specified id.")]
    public async Task<IActionResult> Get(long id)
    {
        return ResponseHelper.OK_Result(
            await repo.Clinics.GetAsync(x => x.ClinicId == id),
            null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates new Hospital Test.")]
    public async Task<IActionResult> Create(Clinic model)
    {
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;

        repo.Clinics.Create(model);
        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("/api/hospital", null,
                new DefaultResponseMessageModel("Successfully created new Hospital.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create Hospital", ""));
    }

    #endregion
}


