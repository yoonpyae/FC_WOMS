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
        public async Task<IActionResult> Get(long branchId, long doctorId)
        {
            return ResponseHelper.OK_Result(
                        await repo.ViConsultations.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId && x.DoctorId==doctorId), null);
        }

        [HttpGet("{id:long}")]
        [EndpointSummary("Get By Id")]
        [EndpointDescription("Gets a consultation with specified id.")]
        public async Task<IActionResult> GetById(long id, long branchId)
        {
            return ResponseHelper.OK_Result(
                        await repo.ViConsultations.GetFirstAsync(x => x.Ano == id && x.BranchId == branchId), null);
        }

        [HttpGet("{patientId}")]
        [EndpointSummary("Get By Patient Id")]
        [EndpointDescription("Gets consultations and prescriptions with specified patient id.")]
        public async Task<IActionResult> Get(string patientId, long branchId, long doctorId)
        {
            var consultations = await repo.ViConsultations.GetAsync(x => x.PatientId == patientId && x.BranchId == branchId && x.DoctorId==doctorId);

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

        [HttpGet("monthly-visits")]
        [EndpointSummary("Monthly Visits")]
        [EndpointDescription("Gets the total completed patient visits grouped by month for a specific year.")]
        public async Task<IActionResult> GetMonthlyVisits(long branchId, long doctorId, int year)
        {
            var consultations = await repo.ViConsultations.GetAsync(x =>
                x.BranchId == branchId &&
                x.DoctorId == doctorId &&
                x.Status == "Completed" &&
                x.VisitDate.Year == year &&
                !x.DeletedOn.HasValue);

            var monthlyCounts = consultations
                .GroupBy(c => c.VisitDate.Month)
                .ToDictionary(g => g.Key, g => g.Count());

            var result = new List<int>();
            for (int month = 1; month <= 12; month++)
            {
                result.Add(monthlyCounts.ContainsKey(month) ? monthlyCounts[month] : 0);
            }

            return ResponseHelper.OK_Result(result, null);
        }

        [HttpPost]
        [EndpointSummary("Create")]
        [EndpointDescription("Creates a new consultation record with multiple prescriptions.")]
        public async Task<IActionResult> CreateConsultation(ConsultationEntryModel payload)
        {
            if (payload.Consultation.Ano != null)
            {
                Consultation? existing = await repo.Consultations.GetFirstAsync(x =>
                    x.Ano == payload.Consultation.Ano && !x.DeletedOn.HasValue);
                if (existing != null)
                    return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("A consultation already exists for this appointment.", ""));
            }

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
            if (consultation == null) return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Consultation record not found.", ""));

            // Update Consultation
            consultation.Symptoms = model.Symptoms;
            consultation.Diagnosis = model.Diagnosis;
            consultation.Notes = model.Notes;
            consultation.Status = model.Status;
            consultation.UpdatedOn = DateTime.Now;
            consultation.UpdatedBy = User.Identity?.Name ?? string.Empty;
            repo.Consultations.Update(consultation);

            // Sync Prescriptions using ID instead of ItemCode
            var existingPrescriptions = await repo.Prescriptions.GetAsync(x => x.ConsultationId == model.ConsultationId && !x.DeletedOn.HasValue);

            // Delete ones not in the incoming list
            var incomingIds = incomingPrescriptions.Select(p => p.PrescriptionId).ToList();
            var toDelete = existingPrescriptions.Where(e => !incomingIds.Contains(e.PrescriptionId));
            foreach (var del in toDelete)
            {
                del.DeletedOn = DateTime.Now;
                del.DeletedBy = User.Identity?.Name ?? string.Empty;
                repo.Prescriptions.Update(del);
            }

            // Update or Add
            foreach (var incoming in incomingPrescriptions)
            {
                // If ID <= 0, it's a new item from the frontend
                if (incoming.PrescriptionId <= 0)
                {
                    // Note: Ideally use DB Identity here. If manual, fetch MaxId ONCE outside this loop.
                    incoming.ConsultationId = model.ConsultationId;
                    incoming.BranchId = model.BranchId;
                    incoming.CreatedOn = DateTime.Now;
                    repo.Prescriptions.Create(incoming);
                }
                else
                {
                    var existing = existingPrescriptions.FirstOrDefault(e => e.PrescriptionId == incoming.PrescriptionId);
                    if (existing != null)
                    {
                        existing.ItemCode = incoming.ItemCode;
                        existing.Dosage = incoming.Dosage;
                        existing.Frequency = incoming.Frequency;
                        existing.Quantity = incoming.Quantity;
                        existing.UpdatedOn = DateTime.Now;
                        repo.Prescriptions.Update(existing);
                    }
                }
            }

            return await repo.SaveAsync() ? ResponseHelper.OK_Result(null, null) : ResponseHelper.Bad_Request(null, null);
        }

        [HttpDelete("{id}")]
        [EndpointSummary("Delete")]
        [EndpointDescription("Deletes a consultation record and its associated prescriptions.")]
        public async Task<IActionResult> Delete(string id)
        {
            //  Prevent deletion if the consultation is already billed in an OPD Voucher
            var isBilled = await repo.OPDVoucherItems.GetFirstAsync(x => x.ConsultationId == id);
            if (isBilled != null)
            {
                return ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel("Cannot delete this Consultation because it has already been billed in an OPD Voucher.", ""));
            }

            //  Proceed with soft delete
            Consultation? consultation = await repo.Consultations.GetFirstAsync(x => x.ConsultationId == id);
            if (consultation == null)
            {
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Consultation record not found.", ""));
            }

            consultation.Status = "incomplete";
            consultation.DeletedOn = DateTime.Now;
            consultation.DeletedBy = User.Identity?.Name ?? string.Empty;
            repo.Consultations.Update(consultation);

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

            // Save changes
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted consultation and prescriptions.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete records.", ""));
        }
        #endregion
    }
}
