using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WOMS.Server.Controllers.Master
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorSchedulesController(IRepositoryWrapper repo) : ControllerBase
    {
        #region CRUD Operation

        [HttpGet]
        [EndpointSummary("List")]
        [EndpointDescription("List all DoctorSchedules without deleted data")]
        public async Task<IActionResult> Get(long branchId)
            => ResponseHelper.OK_Result(
                await repo.DoctorSchedules.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId),
                null);

        [HttpGet("{id:long}")]
        [EndpointSummary("Get By doctor Id")]
        [EndpointDescription("Get DoctorSchedules by doctor Id")]
        public async Task<IActionResult> Get(long branchId, long doctorId)
            => ResponseHelper.OK_Result(
                await repo.DoctorSchedules.GetAsync(x => x.DoctorId == doctorId && x.BranchId == branchId),
                null);

        [HttpGet("auto-id")]
        [EndpointSummary("Get Auto Id")]
        [EndpointDescription("Get an DoctorSchedules max Id")]
        public async Task<IActionResult> GetAutoId(long branchId)
        {
            DoctorSchedule? lastRecord =
                await repo.DoctorSchedules.GetFirstAsync(x => x.BranchId == branchId,
                    q => q.OrderByDescending(x => x.ScheduleId));
            long maxId = lastRecord?.ScheduleId ?? 0;
            maxId++;
            return ResponseHelper.OK_Result(maxId, null);
        }

        [HttpPost]
        [ValidateModel]
        [EndpointSummary("Create")]
        [EndpointDescription("Create a new DoctorSchedules")]
        public async Task<IActionResult> CreateSchedule(DoctorSchedule model)
        {
            model.CreatedOn = DateTime.Now;
            model.CreatedBy = User.Identity?.Name ?? string.Empty;

            // Validate doctor exists
            var doctor = await repo.Doctors.GetAsync(x => x.DoctorId == model.DoctorId);
            if (!doctor.Any())
                return BadRequest("Doctor not found.");

            repo.DoctorSchedules.Create(model);

            return await repo.SaveAsync()
                ? Ok("Schedule created successfully.")
                : BadRequest("Failed to create schedule.");
        }

        [HttpPut("{id:long}")]
        [ValidateModel]
        [EndpointSummary("Update")]
        [EndpointDescription("Update an existing DoctorSchedules")]
        public async Task<IActionResult> UpdateSchedule(long id, DoctorSchedule model)
        {
            var existingSchedule = await repo.DoctorSchedules.GetFirstAsync(x => x.ScheduleId == id);
            if (existingSchedule == null)
                return NotFound("Schedule not found.");
            existingSchedule.DoctorId = model.DoctorId;
            existingSchedule.DayOfWeek = model.DayOfWeek;
            existingSchedule.StartTime = model.StartTime;
            existingSchedule.EndTime = model.EndTime;
            existingSchedule.UpdatedOn = DateTime.Now;
            existingSchedule.UpdatedBy = User.Identity?.Name ?? string.Empty;
            repo.DoctorSchedules.Update(existingSchedule);
            return await repo.SaveAsync()
                ? Ok("Schedule updated successfully.")
                : BadRequest("Failed to update schedule.");
        }

        [HttpDelete("{id:long}")]
        [EndpointSummary("Delete")]
        [EndpointDescription("Soft delete a DoctorSchedules")]
        public async Task<IActionResult> DeleteSchedule(long id)
        {
            var existingSchedule = await repo.DoctorSchedules.GetFirstAsync(x => x.ScheduleId == id);
            if (existingSchedule == null)
                return NotFound("Schedule not found.");
            existingSchedule.DeletedOn = DateTime.Now;
            existingSchedule.DeletedBy = User.Identity?.Name ?? string.Empty;
            repo.DoctorSchedules.Update(existingSchedule);
            return await repo.SaveAsync()
                ? Ok("Schedule deleted successfully.")
                : BadRequest("Failed to delete schedule.");
        }

        #endregion
    }
}
