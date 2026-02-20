using WOMS.Server.Entities;

namespace WOMS.Server.Controllers.Master
{
    [Authorize]
    [Route("api/master/[controller]")]
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

        [HttpGet("by-doctor")]
        [EndpointSummary("Get By doctor Id")]
        [EndpointDescription("Get DoctorSchedules by doctor Id")]
        public async Task<IActionResult> GetByDoctor(long branchId, long doctorId)
            => ResponseHelper.OK_Result(
                await repo.DoctorSchedules.GetAsync(x => x.DoctorId == doctorId && x.BranchId == branchId),
                null);

        [HttpGet("by-doctor-day")]
        [EndpointSummary("Get By doctor Id and day")]
        [EndpointDescription("Get DoctorSchedules by doctor Id and day")]
        public async Task<IActionResult> GetByDoctorAndDay(long branchId, long doctorId, string dayOfWeek)
            => ResponseHelper.OK_Result(
                await repo.DoctorSchedules.GetAsync(x => x.DoctorId == doctorId && x.DayOfWeek == dayOfWeek && x.BranchId == branchId),
                null);

        [HttpGet("auto-scheduleId")]
        [EndpointSummary("Get Auto ScheduleId")]
        [EndpointDescription("Get an DoctorSchedules max Id")]
        public async Task<IActionResult> GetAutoScheduleId(long branchId)
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
            IReadOnlyList<Doctor>? doctor = await repo.Doctors.GetAsync(x => x.DoctorId == model.DoctorId);
            if (!doctor.Any())
                return BadRequest("Doctor not found.");

            bool overlap = await repo.DoctorSchedules.AnyAsync(x =>
            x.DoctorId == model.DoctorId &&
            x.BranchId == model.BranchId &&
            x.DayOfWeek == model.DayOfWeek &&
            x.DeletedOn == null &&
            model.StartTime < x.EndTime &&
            model.EndTime > x.StartTime
            );

            if (overlap)
                return BadRequest("Schedule overlaps with existing schedule.");

            if (model.StartTime >= model.EndTime)
                return BadRequest("Start time must be earlier than end time.");


            repo.DoctorSchedules.Create(model);

            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("/api/doctorschedules", null,
                    new DefaultResponseMessageModel("Successfully created new schedule.", ""))
                : ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel("Unable to created schedule.", ""));
        }

        [HttpPut("{id:long}")]
        [ValidateModel]
        [EndpointSummary("Update")]
        [EndpointDescription("Update an existing DoctorSchedules")]
        public async Task<IActionResult> UpdateSchedule(long id, DoctorSchedule model, long branchId)
        {
            DoctorSchedule? existingSchedule = await repo.DoctorSchedules.GetFirstAsync(
            x => x.ScheduleId == id && x.BranchId == branchId && !x.DeletedOn.HasValue);

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
                ? ResponseHelper.OK_Result(null,
                    new DefaultResponseMessageModel("Schedule updated successfully.", ""))
                : ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel("Failed to update schedule.", ""));
        }

        [HttpDelete("{id:long}")]
        [EndpointSummary("Delete")]
        [EndpointDescription("Soft delete a DoctorSchedules")]
        public async Task<IActionResult> DeleteSchedule(long id, long branchId)
        {
            DoctorSchedule? existingSchedule = await repo.DoctorSchedules.GetFirstAsync(x => x.ScheduleId == id && x.BranchId == branchId);
            if (existingSchedule == null)
                return NotFound("Schedule not found.");
            existingSchedule.DeletedOn = DateTime.Now;
            existingSchedule.DeletedBy = User.Identity?.Name ?? string.Empty;
            repo.DoctorSchedules.Update(existingSchedule);
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null,
                    new DefaultResponseMessageModel("Schedule deleted successfully.", ""))
                : ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel("Failed to delete schedule.", ""));
        }

        #endregion
    }
}
