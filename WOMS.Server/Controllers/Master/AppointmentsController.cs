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
    public async Task<IActionResult> GetDoctorsOnDuty(long branchId, int dayOfWeek)
    {
        if (dayOfWeek < 0 || dayOfWeek > 6)
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Invalid day of the week.", ""));

        string? dutyDayProperty = ((DayOfWeek)dayOfWeek) switch
        {
            DayOfWeek.Monday => nameof(Doctor.MonTime),
            DayOfWeek.Tuesday => nameof(Doctor.TueTime),
            DayOfWeek.Wednesday => nameof(Doctor.WedTime),
            DayOfWeek.Thursday => nameof(Doctor.ThuTime),
            DayOfWeek.Friday => nameof(Doctor.FriTime),
            DayOfWeek.Saturday => nameof(Doctor.SatTime),
            DayOfWeek.Sunday => nameof(Doctor.SunTime),
            _ => null
        };

        IReadOnlyList<Doctor>? doctorsOnDuty = await repo.Doctors.GetAsync(x =>
            x.BranchId == branchId &&
            !string.IsNullOrEmpty(EF.Property<string>(x, dutyDayProperty!)) &&
            !x.DeletedOn.HasValue);

        return ResponseHelper.OK_Result(doctorsOnDuty, null);
    }

    [HttpGet("doctor-appointments")]
    [EndpointSummary("Doctor's Appointments")]
    [EndpointDescription("Lists all Appointments for a specific doctor on the selected date.")]
    public async Task<IActionResult> GetDoctorAppointments(long branchId, long doctorId, DateOnly appointmentDate)
         => ResponseHelper.OK_Result(
              await repo.ViAppointments.GetAsync(x =>
                  x.BranchId == branchId &&
                  x.DoctorId == doctorId &&
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
