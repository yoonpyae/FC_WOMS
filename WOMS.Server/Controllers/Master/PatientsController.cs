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

    [HttpGet("auto-id")]
    [EndpointSummary("Get Auto Id")]
    [EndpointDescription("Gets an Patient max id.")]
    public async Task<IActionResult> GetAutoId(long branchId)
    {
        Patient? lastRecord =
            await repo.Patients.GetFirstAsync(x => x.BranchId == branchId, q => q.OrderByDescending(x => x.PatientId));
        long maxId = lastRecord?.PatientId ?? 0;
        maxId++;
        return ResponseHelper.OK_Result(maxId, null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Create New Patient")]
    public async Task<IActionResult> Create(Patient model)
    {
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;
        repo.Patients.Create(model);
        return await repo.SaveAsync()
        ? ResponseHelper.Created_Result("/api/patients", null,
        new DefaultResponseMessageModel("Successfully created new Patient.", ""))
        : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to created Patient", ""));
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update")]
    [EndpointDescription("Update Existing Patient")]
    public async Task<IActionResult> Edit(Patient model)
    {
        Patient? patient = await repo.Patients.GetFirstAsync(x => x.PatientId == model.PatientId && x.BranchId == model.BranchId);
        if (patient == null)
            return ResponseHelper.NotFound_Request(
        null,
        new DefaultResponseMessageModel("Patient not found.", ""));
        
        // Update fields
        patient.Name = model.Name;
        patient.Nrc = model.Nrc;
        patient.Dob = model.Dob;
        patient.Age = model.Age;
        patient.StateId = model.StateId;
        patient.TownshipId = model.TownshipId;
        patient.AddressDetail = model.AddressDetail;
        patient.Phone = model.Phone;
        patient.UpdatedOn = DateTime.Now;
        patient.UpdatedBy = User.Identity?.Name ?? string.Empty;
        patient.Status = model.Status;

        repo.Patients.Update(patient);
        return await repo.SaveAsync()
        ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated Patient.", ""))
        : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update Patient.", ""));
    }

    [HttpDelete("{id:long}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Delete Patient by Id")]
    public async Task<IActionResult> Delete(long id, long branchId)
    {
        Patient? patient = await repo.Patients.GetFirstAsync(x => x.PatientId == id && x.BranchId == branchId);
        if (patient == null)
            return ResponseHelper.NotFound_Request(
        null,
        new DefaultResponseMessageModel("Patient not found.", ""));

        bool isUSedInSale = await repo.Sales.AnyAsync(s => s.PatientId == id && s.BranchId == branchId && s.DeletedOn == null);
        if (isUSedInSale)
        {
            return ResponseHelper.Bad_Request(
                null,
                new DefaultResponseMessageModel("Cannot delete Patient as it is referenced in existing Sales.", ""));
        }

        // Soft delete
        patient.DeletedOn = DateTime.Now;
        patient.DeletedBy = User.Identity?.Name ?? string.Empty;
        patient.Status = false;
        repo.Patients.Update(patient);
        return await repo.SaveAsync()
        ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted Patient.", ""))
        : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete Patient.", ""));
    }

    #endregion
}
