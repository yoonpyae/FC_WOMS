using WOMS.Server.Models.Consultation_Prescription;

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
        {
            return ResponseHelper.OK_Result(
                        await repo.ViConsultations.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);
        }

        [HttpGet("{id:long}")]
        [EndpointSummary("Get By Id")]
        [EndpointDescription("Gets a consultation with specified id.")]
        public async Task<IActionResult> Get(long id, long branchId)
        {
            return ResponseHelper.OK_Result(
                        await repo.ViConsultations.GetFirstAsync(x => x.Ano == id && x.BranchId == branchId), null);
        }

        [HttpGet("{patientId}")]
        [EndpointSummary("Get By Patient Id")]
        [EndpointDescription("Gets consultations and prescriptions with specified patient id.")]
        public async Task<IActionResult> Get(string patientId, long branchId)
        {
            var consultations = await repo.ViConsultations.GetAsync(x => x.PatientId == patientId && x.BranchId == branchId);

            if (consultations == null || !consultations.Any())
            {
                return ResponseHelper.OK_Result(new List<object>(), null);
            }

            var consultationIds = consultations.Select(c => c.ConsultationId).ToList();
            var prescriptions = await repo.ViPrescriptions.GetAsync(x => consultationIds.Contains(x.ConsultationId) && x.BranchId == branchId);

            var result = consultations.Select(c => new
            {
                Consultation = c,
                Prescriptions = prescriptions.Where(p => p.ConsultationId == c.ConsultationId).ToList()
            });

            return ResponseHelper.OK_Result(result, null);
        }

        [HttpGet("getpatient-info")]
        [EndpointSummary("Get Patient Info")]
        public async Task<IActionResult> GetPatientInfo(string patientId, long branchId, int doctorId)
        {
            // Get today's date to ensure we don't grab future appointments!
            var today = DateOnly.FromDateTime(DateTime.Today);

            // CRITICAL FIX: Added DoctorId and AppointmentDate checks!
            var app = await repo.ViAppointments.GetFirstAsync(x =>
                x.PatientId == patientId &&
                x.BranchId == branchId &&
                x.DoctorId == doctorId &&
                x.AppointmentStatus == "Confirmed" &&
                x.AppointmentDate == today);

            var patient = await repo.Patients.GetFirstAsync(x => x.PatientId == patientId && x.BranchId == branchId);

            // If app is null, it means they are a Walk-in for this specific doctor today.
            if (app == null)
            {
                return ResponseHelper.OK_Result(new
                {
                    Patient = patient,
                    Appointment = (object)null
                }, new DefaultResponseMessageModel("Patient is a Walk-in.", ""));
            }

            return ResponseHelper.OK_Result(new
            {
                Patient = patient,
                Appointment = app
            }, null);
        }

        [HttpPost]
        [EndpointSummary("Create")]
        [EndpointDescription("Creates a new consultation record with multiple prescriptions.")]
        public async Task<IActionResult> CreateConsultation(ConsultationEntryModel payload)
        {
            Consultation consultation = payload.Consultation;
            List<Prescription> prescriptions = payload.Prescriptions;

            // 1. Setup Consultation
            consultation.ConsultationId = idGenerateService.GetConsultationId(consultation.BranchId);
            consultation.CreatedOn = DateTime.Now;
            consultation.CreatedBy = User.Identity?.Name ?? string.Empty;

            if (consultation.Ano != null)
            {
                Appointment? appointment = await repo.Appointments.GetFirstAsync(
                    x => x.Ano == consultation.Ano && x.BranchId == consultation.BranchId);

                if (appointment != null)
                {
                    appointment.Status = "Completed";
                    appointment.UpdatedOn = DateTime.Now;
                    appointment.UpdatedBy = User.Identity?.Name ?? string.Empty;
                    repo.Appointments.Update(appointment);
                }
            }

            repo.Consultations.Create(consultation);

            // 2. Setup Prescriptions
            if (prescriptions != null && prescriptions.Any())
            {
                Prescription? lastRecord = await repo.Prescriptions.GetFirstAsync(
                    x => x.BranchId == consultation.BranchId,
                    q => q.OrderByDescending(x => x.PrescriptionId));

                long currentMaxId = lastRecord?.PrescriptionId ?? 0;

                foreach (Prescription p in prescriptions)
                {
                    currentMaxId++;
                    p.PrescriptionId = currentMaxId;
                    p.ConsultationId = consultation.ConsultationId;
                    p.BranchId = consultation.BranchId;
                    p.Date = consultation.VisitDate;
                    p.CreatedOn = DateTime.Now;
                    p.CreatedBy = User.Identity?.Name ?? string.Empty;

                    repo.Prescriptions.Create(p);
                }
            }

            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("/api/consultations", null,
                    new DefaultResponseMessageModel("Successfully created consultation and prescriptions.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to save records.", ""));
        }

        [HttpPut]
        [EndpointSummary("Update")]
        [EndpointDescription("Updates an existing consultation record and syncs its prescriptions.")]
        public async Task<IActionResult> UpdateConsultation(ConsultationEntryModel payload)
        {
            Consultation model = payload.Consultation;
            List<Prescription> incomingPrescriptions = payload.Prescriptions;

            Consultation? consultation = await repo.Consultations.GetFirstAsync(x => x.ConsultationId == model.ConsultationId && x.BranchId == model.BranchId);
            if (consultation == null)
            {
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Consultation record not found.", ""));
            }

            // 1. Update Consultation fields
            consultation.Ano = model.Ano;
            consultation.DoctorId = model.DoctorId;
            consultation.Symptoms = model.Symptoms;
            consultation.Diagnosis = model.Diagnosis;
            consultation.Notes = model.Notes;
            consultation.Status = model.Status;
            consultation.UpdatedOn = DateTime.Now;
            consultation.UpdatedBy = User.Identity?.Name ?? string.Empty;
            repo.Consultations.Update(consultation);

            // 2. Handle Prescriptions Sync
            // Fetch all existing active prescriptions for this consultation
            var existingPrescriptions = await repo.Prescriptions.GetAsync(x => x.ConsultationId == model.ConsultationId && x.BranchId == model.BranchId && !x.DeletedOn.HasValue);

            // A. Find Prescriptions to Delete (Removed from the frontend array)
            var incomingItemCodes = incomingPrescriptions.Select(p => p.ItemCode).ToList();
            var prescriptionsToDelete = existingPrescriptions.Where(e => !incomingItemCodes.Contains(e.ItemCode)).ToList();

            foreach (var del in prescriptionsToDelete)
            {
                del.DeletedOn = DateTime.Now;
                del.DeletedBy = User.Identity?.Name ?? string.Empty;
                repo.Prescriptions.Update(del);
            }

            // Grab the highest PrescriptionId in case we need to add new ones
            Prescription? lastRecord = await repo.Prescriptions.GetFirstAsync(
                x => x.BranchId == model.BranchId,
                q => q.OrderByDescending(x => x.PrescriptionId));
            long currentMaxId = lastRecord?.PrescriptionId ?? 0;

            // B. Find Prescriptions to Update or Add
            foreach (var incoming in incomingPrescriptions)
            {
                // Check if the medication already exists in this consultation by ItemCode
                var existing = existingPrescriptions.FirstOrDefault(e => e.ItemCode == incoming.ItemCode);

                if (existing != null)
                {
                    // UPDATE existing medication
                    existing.Dosage = incoming.Dosage;
                    existing.Frequency = incoming.Frequency;
                    existing.Duration = incoming.Duration;
                    existing.Instruction = incoming.Instruction;
                    existing.Quantity = incoming.Quantity;
                    existing.UpdatedOn = DateTime.Now;
                    existing.UpdatedBy = User.Identity?.Name ?? string.Empty;
                    repo.Prescriptions.Update(existing);
                }
                else
                {
                    // ADD new medication
                    currentMaxId++;
                    incoming.PrescriptionId = currentMaxId;
                    incoming.ConsultationId = model.ConsultationId;
                    incoming.BranchId = model.BranchId;
                    incoming.Date = consultation.VisitDate;
                    incoming.CreatedOn = DateTime.Now;
                    incoming.CreatedBy = User.Identity?.Name ?? string.Empty;
                    repo.Prescriptions.Create(incoming);
                }
            }

            // 3. Save everything in one transaction
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated consultation and prescriptions.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update records.", ""));
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Delete")]
        [EndpointDescription("Deletes a consultation record and its associated prescriptions.")]
        public async Task<IActionResult> Delete(string id)
        {
            // 1. Soft-Delete Consultation
            Consultation? consultation = await repo.Consultations.GetFirstAsync(x => x.ConsultationId == id);
            if (consultation == null)
            {
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Consultation record not found.", ""));
            }

            consultation.DeletedOn = DateTime.Now;
            consultation.DeletedBy = User.Identity?.Name ?? string.Empty;
            repo.Consultations.Update(consultation);

            // 2. Soft-Delete Associated Prescriptions
            var prescriptions = await repo.Prescriptions.GetAsync(x => x.ConsultationId == id && !x.DeletedOn.HasValue);

            if (prescriptions != null && prescriptions.Any())
            {
                foreach (var p in prescriptions)
                {
                    p.DeletedOn = DateTime.Now;
                    p.DeletedBy = User.Identity?.Name ?? string.Empty;
                    repo.Prescriptions.Update(p);
                }
            }

            // 3. Save changes
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted consultation and prescriptions.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete records.", ""));
        }
        #endregion
    }
}
