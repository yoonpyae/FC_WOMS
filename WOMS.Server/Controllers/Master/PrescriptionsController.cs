namespace WOMS.Server.Controllers.Master
{
    [Authorize]
    [Route("api/master/[controller]")]
    [ApiController]
    public class PrescriptionsController(IRepositoryWrapper repo) : ControllerBase
    {
        #region CRUD Operations
        [HttpGet]
        [EndpointSummary("List All")]
        [EndpointDescription("Lists all prescriptions without deleted data.")]
        public async Task<IActionResult> Get(long branchId)
        {
            return ResponseHelper.OK_Result(
                        await repo.ViPrescriptions.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);
        }

        [HttpGet("{id:long}")]
        [EndpointSummary("Get By Id")]
        [EndpointDescription("Gets a prescription with specified id.")]
        public async Task<IActionResult> Get(long id, long branchId)
        {
            return ResponseHelper.OK_Result(
                        await repo.ViPrescriptions.GetFirstAsync(x => x.PrescriptionId == id && x.BranchId == branchId), null);
        }

        [HttpGet("auto-id")]
        [EndpointSummary("Get Auto Id")]
        [EndpointDescription("Gets a prescription max id.")]
        public async Task<IActionResult> GetAutoId(long branchId)
        {
            Prescription? lastRecord = await repo.Prescriptions.GetFirstAsync(
                x => x.BranchId == branchId,
                q => q.OrderByDescending(x => x.PrescriptionId));
            long maxId = lastRecord?.PrescriptionId ?? 0;
            maxId++;
            return ResponseHelper.OK_Result(maxId, null);
        }

        [HttpGet("{ConsultationId}")]
        [EndpointSummary("Get By Consultation Id")]
        [EndpointDescription("Gets prescriptions with specified consultation id.")]
        public async Task<IActionResult> GetByConsultationId(string consultationId)
        {
            IReadOnlyList<ViPrescription> prescriptions = await repo.ViPrescriptions.GetAsync(x => x.ConsultationId == consultationId) ?? [];
            return ResponseHelper.OK_Result(new
            {
                prescriptions
            }, null);
        }
        #endregion
    }
}
