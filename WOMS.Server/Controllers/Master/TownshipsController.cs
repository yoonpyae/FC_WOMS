namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class TownshipsController(IRepositoryWrapper repo) : ControllerBase
{
    #region CRUD Operation
    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("List all Townships")]
    public async Task<IActionResult> Get()
    {
        return ResponseHelper.OK_Result(await repo.Townships.GetAsync(), null);
    }

    [HttpGet("by-state")]
    [EndpointSummary("List by State")]
    [EndpointDescription("List all Townships by State")]
    public async Task<IActionResult> GetByState(long stateId)
    {
        return ResponseHelper.OK_Result(await repo.Townships.GetAsync(x => x.StateId == stateId), null);
    }

    #endregion
}
