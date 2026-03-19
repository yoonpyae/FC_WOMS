using System.Data;

namespace WOMS.Server.Controllers;

[Authorize]
[Route("api/reception-dashboard")]
[ApiController]
public class ReceptionDashboardController(IRepositoryWrapper repo) : ControllerBase
{
    [HttpGet("kpis")]
    [EndpointSummary("Reception KPIs")]
    [EndpointDescription("Gets front-desk KPIs for the Receptionist Dashboard.")]
    public async Task<IActionResult> GetKpis([FromQuery] long branchId)
    {
        DateTime today = DateTime.Today;
        DateTime tomorrow = today.AddDays(1);
        DateOnly todayDateOnly = DateOnly.FromDateTime(today);

        IReadOnlyList<ViAppointment>? appointments = await repo.ViAppointments.GetAsync(x =>
            x.BranchId == branchId &&
            x.AppointmentDate == todayDateOnly &&
            !x.DeletedOn.HasValue);

        int todayAppointmentsCount = appointments?.Count ?? 0;

        IReadOnlyList<Patient>? newPatients = await repo.Patients.GetAsync(x =>
            x.BranchId == branchId &&
            x.CreatedOn >= today &&
            x.CreatedOn < tomorrow &&
            !x.DeletedOn.HasValue);

        int newPatientCount = newPatients?.Count ?? 0;

        IReadOnlyList<ViOPDVoucher>? opdVouchers = await repo.ViOPDVouchers.GetAsync(x =>
            x.BranchId == branchId &&
            x.Vdate >= today &&
            x.Vdate < tomorrow &&
            !x.DeletedOn.HasValue);

        double collectedAmount = opdVouchers?.Sum(x => x.PaidAmount) ?? 0;

        double pendingAmount = opdVouchers?.Sum(x => x.LeftAmount) ?? 0;

        return ResponseHelper.OK_Result(new
        {
            TodayAppointments = todayAppointmentsCount,
            NewPatients = newPatientCount,
            CollectedAmount = collectedAmount,
            PendingAmount = pendingAmount
        }, null);
    }

    [HttpGet("upcoming-appointments")]
    [EndpointSummary("Upcoming Appointments")]
    [EndpointDescription("Gets a list of today's remaining appointments sorted by time.")]
    public async Task<IActionResult> GetUpcomingAppointments([FromQuery] long branchId)
    {
        DateOnly todayDateOnly = DateOnly.FromDateTime(DateTime.Today);
        TimeOnly currentTime = TimeOnly.FromDateTime(DateTime.Now);

        IReadOnlyList<ViAppointment> appointments = await repo.ViAppointments.GetAsync(x =>
            x.BranchId == branchId &&
            x.AppointmentDate == todayDateOnly &&
            x.AppointmentStatus != "Cancelled" &&
            !x.DeletedOn.HasValue) ?? [];

        // Filter for appointments that are happening now or later today, sort by time
        List<ViAppointment> upcoming = appointments
            .Where(a => a.StartTime >= currentTime || a.AppointmentStatus == "Confirmed")
            .OrderBy(a => a.StartTime)
            .Take(10) // Show the next 10 patients
            .ToList();

        return ResponseHelper.OK_Result(upcoming, null);
    }
}