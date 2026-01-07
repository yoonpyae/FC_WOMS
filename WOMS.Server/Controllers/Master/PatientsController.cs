using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class PatientsController(IRepositoryWrapper repo) : ControllerBase
{
    #region CRUD Operation
    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("List all Patient without deleted data")]
    public async Task<IActionResult> Get(long branchId)
            => ResponseHelper.OK_Result(
               await repo.Patients.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId),
               null);

    [HttpGet("{id:long}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Get Patient by Id")]
    public async Task<IActionResult> Get(long id, long branchId)
            => ResponseHelper.OK_Result(
        await repo.Patients.GetFirstAsync(x => x.PatientId == id && x.BranchId == branchId) ,
        null);

    #endregion
}
