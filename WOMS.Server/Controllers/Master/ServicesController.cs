using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WOMS.Server.Controllers.Master
{
    [Authorize]
    [Route("api/master/[controller]")]
    [ApiController]
    public class ServicesController(IRepositoryWrapper repo) : ControllerBase
    {
        #region CRUD Operations

        //[HttpGet]
        //[EndpointSummary("List All")]
        //[EndpointDescription("Lists all services without deleted data.")]
        //public async Task<IActionResult> Get(long branchId)
        //    => ResponseHelper.OK_Result(
        //        await repo.Services.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);
        #endregion
    }
}
