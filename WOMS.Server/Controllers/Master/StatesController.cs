namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class StatesController(
    IRepositoryWrapper repo) : ControllerBase
{
    #region CRUD Operation
    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("List all States")]
    public async Task<IActionResult> Get()
    {
        return ResponseHelper.OK_Result(await repo.States.GetAsync(), null);
    }

    #endregion
}
