namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class AppointmentsController(IRepositoryWrapper repo) : ControllerBase
{
    #region CRUD Operations
    [HttpGet]
    [EndpointSummary("List All")]
    [EndpointDescription("Lists all appointments without deleted data.")]
    public async Task<IActionResult> Get(long branchId)
        => ResponseHelper.OK_Result(
            await repo.ViAppointments.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);

    [HttpGet("doctors-on-duty")]
    [EndpointSummary("Doctors on Duty")]
    [EndpointDescription("Lists all doctors who have duty on the selected day.")]
    public async Task<IActionResult> GetDoctorsOnDuty(long branchId, string dayOfWeek)
    {
        if (string.IsNullOrWhiteSpace(dayOfWeek))
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Day of week is required.", ""));

        // Optional: Normalize day string
        string normalizedDay = dayOfWeek.Trim().ToLowerInvariant();

        IReadOnlyList<DoctorSchedule>? doctorsOnDuty = await repo.DoctorSchedules.GetAsync(x =>
            x.BranchId == branchId &&
            !x.DeletedOn.HasValue &&
            x.DayOfWeek.ToLower() == normalizedDay);

        return ResponseHelper.OK_Result(doctorsOnDuty, null);
    }

    [HttpGet("doctor-appointments")]
    [EndpointSummary("Doctor's Appointments")]
    [EndpointDescription("Lists all Appointments for a specific doctor on the selected date.")]
    public async Task<IActionResult> GetDoctorAppointments(long branchId, DateOnly appointmentDate)
         => ResponseHelper.OK_Result(
              await repo.ViAppointments.GetAsync(x =>
                  x.BranchId == branchId &&
                  x.AppointmentDate == appointmentDate &&
                  !x.DeletedOn.HasValue), null);

    [HttpGet("{id:long}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Gets an Appointment with specified id.")]
    public async Task<IActionResult> Get(long id, long branchId)
        => ResponseHelper.OK_Result(
            await repo.Appointments.GetFirstAsync(x => x.Ano == id && x.BranchId == branchId), null);

    [HttpGet("auto-id")]
    [EndpointSummary("Get Auto Id")]
    [EndpointDescription("Gets an Appointment max id.")]
    public async Task<IActionResult> GetAutoId(long branchId)
    {
        Appointment? lastRecord = await repo.Appointments.GetFirstAsync(
            x => x.BranchId == branchId,
            q => q.OrderByDescending(x => x.Ano));

        long nextId = (lastRecord?.Ano ?? 0) + 1;
        return ResponseHelper.OK_Result(nextId, null);
    }

    [HttpGet("{patientId}")]
    [EndpointSummary("Get By Patient Id")]
    [EndpointDescription("Gets an Appointment with specified patient id.")]
    public async Task<IActionResult> GetByPatientId(string patientId, long branchId, long doctorId)
        => ResponseHelper.OK_Result(
            await repo.ViAppointments.GetAsync(x => x.PatientId == patientId && x.BranchId == branchId && x.DoctorId==doctorId), null);

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Creates new Appointment.")]
    public async Task<IActionResult> Create(Appointment model)
    {
        DoctorSchedule? selectedSchedule = await repo.DoctorSchedules.GetFirstAsync(x =>
            x.ScheduleId == model.ScheduleId && x.BranchId == model.BranchId);

        if (selectedSchedule == null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Invalid schedule selected.", ""));
        }

        ViAppointment? existingBooking = await repo.ViAppointments.GetFirstAsync(x =>
            x.PatientId == model.PatientId &&
            x.DoctorId == selectedSchedule.DoctorId &&
            x.AppointmentDate == model.AppointmentDate &&
            !x.DeletedOn.HasValue &&
            x.AppointmentStatus != "Cancelled");

        if (existingBooking != null)
        {
            return ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("This patient already has an appointment with this doctor on this date.", ""));
        }

        if (selectedSchedule.MaxPatient.HasValue)
        {
            int count = await repo.Appointments.CountAsync(x =>
                x.ScheduleId == model.ScheduleId &&
                x.AppointmentDate == model.AppointmentDate &&
                !x.DeletedOn.HasValue);

            if (count >= selectedSchedule.MaxPatient.Value)
            {
                return ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel("This time slot is full. Please select another.", ""));
            }
        }

        model.Status = "Confirmed";
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;

        repo.Appointments.Create(model);

        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("api/master", null, new DefaultResponseMessageModel("Successfully created.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create Appointment", ""));
    }

    [HttpDelete("{ano:long}/{branchId:long}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Deletes Appointment.")]
    public async Task<IActionResult> Delete(long ano, long branchId)
    {
        Appointment? appointment = await repo.Appointments.GetFirstAsync(x =>
            x.Ano == ano &&
            x.BranchId == branchId);
        if (appointment is null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Unable to find Appointment", ""));
        }

        appointment.Status = "Cancelled";
        appointment.UpdatedOn = DateTime.Now;
        appointment.UpdatedBy = User.Identity?.Name ?? string.Empty;

        repo.Appointments.Update(appointment);

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Appointment has been cancelled successfully.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to cancel Appointment", ""));
    }

    [HttpGet("report")]
    [EndpointSummary("Appointment Report")]
    [EndpointDescription("Gets appointment report data within a specific date range.")]
    public async Task<IActionResult> GetReport(long branchId, [FromQuery] DateOnly? startDate, [FromQuery] DateOnly? endDate)
    {
        IReadOnlyList<ViAppointment>? appointments = await repo.ViAppointments.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId);

        if (startDate.HasValue)
        {
            appointments = appointments.Where(x => x.AppointmentDate >= startDate.Value).ToList();
        }

        if (endDate.HasValue)
        {
            appointments = appointments.Where(x => x.AppointmentDate <= endDate.Value).ToList();
        }

        List<ViAppointment> sortedAppointments = appointments.OrderByDescending(x => x.AppointmentDate).ToList();

        return ResponseHelper.OK_Result(sortedAppointments, null);
    }
    #endregion
}
