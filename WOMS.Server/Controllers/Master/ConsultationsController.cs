using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WOMS.Server.Controllers.Master
{
    [Authorize]
    [Route("api/master/[controller]")]
    [ApiController]
    public class ConsultationsController(IRepositoryWrapper repo,
    IIdGenerateService idGenerateService) : ControllerBase
    {

        #region CRUD Operations
        [HttpGet]
        [EndpointSummary("List All")]
        [EndpointDescription("Lists all consultations without deleted data.")]
        public async Task<IActionResult> Get(long branchId)
            => ResponseHelper.OK_Result(
                await repo.ViConsultations.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);

        [HttpGet("{id:long}")]
        [EndpointSummary("Get By Id")]
        [EndpointDescription("Gets a consultation with specified id.")]
        public async Task<IActionResult> Get(long id, long branchId)
            => ResponseHelper.OK_Result(
                await repo.ViConsultations.GetFirstAsync(x => x.Ano == id && x.BranchId == branchId), null);


        [HttpPost]
        [EndpointSummary("Create")]
        [EndpointDescription("Creates a new consultation record.")]
        public async Task<IActionResult> CreateConsultation(Consultation model)
        {
            model.ConsultationId = idGenerateService.GetConsultationId(model.BranchId);
            model.CreatedOn = DateTime.Now;
            model.CreatedBy = User.Identity?.Name ?? string.Empty;

            // If the consultation is linked to an appointment, update its status
            if (model.Ano != null)
            {
                var appointment = await repo.Appointments.GetFirstAsync(
                    x => x.Ano == model.Ano && x.BranchId == model.BranchId);

                if (appointment != null)
                {
                    appointment.Status = "Completed";
                    appointment.UpdatedOn = DateTime.Now;
                    appointment.UpdatedBy = User.Identity?.Name ?? string.Empty;
                    repo.Appointments.Update(appointment);
                }
            }

            repo.Consultations.Create(model);
            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("/api/consultations", null,
                    new DefaultResponseMessageModel("Successfully created new consultation record.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create consultation record.", ""));
        }

        [HttpPut]
        [EndpointSummary("Update")]
        [EndpointDescription("Updates an existing consultation record.")]
        public async Task<IActionResult> UpdateConsultation(Consultation model)
        {
            Consultation? consultation = await repo.Consultations.GetFirstAsync(x => x.ConsultationId == model.ConsultationId && x.BranchId == model.BranchId);
            if (consultation == null)
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Consultation record not found.", ""));
            // Update fields
            consultation.Ano = model.Ano;
            consultation.DoctorId = model.DoctorId;
            consultation.PatientId = model.PatientId;
            consultation.Symptoms = model.Symptoms;
            consultation.Diagnosis = model.Diagnosis;
            consultation.Notes = model.Notes;
            consultation.Status = model.Status;
            consultation.UpdatedOn = DateTime.Now;
            consultation.UpdatedBy = User.Identity?.Name ?? string.Empty;
            repo.Consultations.Update(consultation);
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated consultation record.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update consultation record.", ""));
        }

        [HttpDelete("{id:string}")]
        [EndpointSummary("Delete")]
        [EndpointDescription("Deletes a consultation record.")]
        public async Task<IActionResult> Delete(string id)
        {
            Consultation? consultation = await repo.Consultations.GetFirstAsync(x => x.ConsultationId == id);
            if (consultation == null)
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Consultation record not found.", ""));
            consultation.DeletedOn = DateTime.Now;
            consultation.DeletedBy = User.Identity?.Name ?? string.Empty;
            repo.Consultations.Update(consultation);
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted consultation record.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete consultation record.", ""));
        }
        #endregion
    }
}
