using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;

        repo.Appointments.Create(model);

        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("api/master", null,
                new DefaultResponseMessageModel("Successfully created new Appointment.", ""))
            : ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("Unable to create Appointment", ""));
    }

    [HttpDelete("{id:long}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Deletes Appointment.")]
    public async Task<IActionResult> Delete(long id)
    {
        Appointment? appointment = await repo.Appointments.GetFirstAsync(x => x.Ano == id);
        if (appointment is null)
            return ResponseHelper.NotFound_Request(null,
                new DefaultResponseMessageModel("Unable to find Appointment", ""));

        appointment.DeletedOn = DateTime.Now;
        appointment.DeletedBy = User.Identity?.Name ?? string.Empty;

        repo.Appointments.Update(appointment);

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null,
                new DefaultResponseMessageModel("Successfully deleted Appointment.", ""))
            : ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("Unable to delete Appointment", ""));
    }
    #endregion
}
