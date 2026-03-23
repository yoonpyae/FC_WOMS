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
                await repo.DoctorSchedules.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);

        [HttpGet("by-doctor")]
        public async Task<IActionResult> GetByDoctor(long branchId, long doctorId)
        {
            IReadOnlyList<DoctorSchedule>? schedules = await repo.DoctorSchedules.GetAsync(x =>
                x.DoctorId == doctorId &&
                x.BranchId == branchId &&
                !x.DeletedOn.HasValue);

            // Define day order for sorting
            List<string> dayOrder = new List<string> { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };

            List<DoctorSchedule> sortedSchedules = schedules
                .OrderBy(s => dayOrder.IndexOf(s.DayOfWeek))
                .ThenBy(s => s.StartTime)
                .ToList();

            return ResponseHelper.OK_Result(sortedSchedules, null);
        }

        [HttpGet("by-doctor-day")]
        [EndpointSummary("Get By doctor Id and day")]
        [EndpointDescription("Get DoctorSchedules by doctor Id and day")]
        public async Task<IActionResult> GetByDoctorAndDay(long branchId, long doctorId, string dayOfWeek)
            => ResponseHelper.OK_Result(
                await repo.DoctorSchedules.GetAsync(x => x.DoctorId == doctorId && x.DayOfWeek == dayOfWeek && x.BranchId == branchId && !x.DeletedOn.HasValue),
                null);

        [HttpGet("auto-scheduleId")]
        [EndpointSummary("Get Auto ScheduleId")]
        [EndpointDescription("Get an DoctorSchedules max Id")]
        public async Task<IActionResult> GetAutoScheduleId(long branchId)
        {
            DoctorSchedule? lastRecord = await repo.DoctorSchedules.GetFirstAsync(x => x.BranchId == branchId, q => q.OrderByDescending(x => x.ScheduleId));
            long maxId = (lastRecord?.ScheduleId ?? 0) + 1;
            return ResponseHelper.OK_Result(maxId, null);
        }

        [HttpPost]
        [ValidateModel]
        [EndpointSummary("Create")]
        [EndpointDescription("Create a new DoctorSchedules")]
        public async Task<IActionResult> CreateSchedule(DoctorSchedule model)
        {
            if (model.StartTime >= model.EndTime)
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Start time must be earlier than end time.", ""));

            if (model.MaxPatient <= 0)
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Max patients must be greater than 0.", ""));

            var doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == model.DoctorId);
            if (doctor == null) return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Doctor not found.", ""));

            bool overlap = await repo.DoctorSchedules.AnyAsync(x =>
                x.DoctorId == model.DoctorId &&
                x.BranchId == model.BranchId &&
                x.DayOfWeek == model.DayOfWeek &&
                !x.DeletedOn.HasValue &&
                model.StartTime < x.EndTime &&
                model.EndTime > x.StartTime);

            if (overlap)
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("This schedule overlaps with an existing schedule for this day.", ""));

            DoctorSchedule? lastRecord = await repo.DoctorSchedules.GetFirstAsync(
                x => x.BranchId == model.BranchId && x.DoctorId == model.DoctorId,
                q => q.OrderByDescending(x => x.ScheduleId));

            model.ScheduleId = (lastRecord?.ScheduleId ?? 0) + 1;

            model.CreatedOn = DateTime.Now;
            model.CreatedBy = User.Identity?.Name ?? string.Empty;

            repo.DoctorSchedules.Create(model);

            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("/api/doctorschedules", null, new DefaultResponseMessageModel("Successfully created new schedule.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create schedule.", ""));
        }

        [HttpPut("{id:long}")]
        [ValidateModel]
        [EndpointSummary("Update")]
        [EndpointDescription("Update an existing DoctorSchedules")]
        public async Task<IActionResult> UpdateSchedule(long id, [FromBody] DoctorSchedule model, [FromQuery] long branchId)
        {
            if (model.StartTime >= model.EndTime)
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Start time must be earlier than end time.", ""));

            DoctorSchedule? existingSchedule = await repo.DoctorSchedules.GetFirstAsync(
                x => x.ScheduleId == id && x.BranchId == branchId && !x.DeletedOn.HasValue);

            if (existingSchedule == null)
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Schedule not found.", ""));

            bool overlap = await repo.DoctorSchedules.AnyAsync(x =>
                x.DoctorId == model.DoctorId &&
                x.BranchId == branchId &&
                x.DayOfWeek == model.DayOfWeek &&
                x.ScheduleId != id &&
                !x.DeletedOn.HasValue &&
                model.StartTime < x.EndTime &&
                model.EndTime > x.StartTime);

            if (overlap)
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Updated time overlaps with another existing schedule.", ""));

            existingSchedule.DayOfWeek = model.DayOfWeek;
            existingSchedule.StartTime = model.StartTime;
            existingSchedule.EndTime = model.EndTime;
            existingSchedule.MaxPatient = model.MaxPatient;
            existingSchedule.UpdatedOn = DateTime.Now;
            existingSchedule.UpdatedBy = User.Identity?.Name ?? string.Empty;

            repo.DoctorSchedules.Update(existingSchedule);
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Schedule updated successfully.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Failed to update schedule.", ""));
        }

        [HttpDelete("{id:long}")]
        [EndpointSummary("Delete")]
        [EndpointDescription("Soft delete a DoctorSchedules")]
        public async Task<IActionResult> DeleteSchedule(long id, long branchId)
        {
            DoctorSchedule? existingSchedule = await repo.DoctorSchedules.GetFirstAsync(x => x.ScheduleId == id && x.BranchId == branchId);
            if (existingSchedule == null) return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Schedule not found.", ""));

            existingSchedule.DeletedOn = DateTime.Now;
            existingSchedule.DeletedBy = User.Identity?.Name ?? string.Empty;

            repo.DoctorSchedules.Update(existingSchedule);
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Schedule deleted successfully.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Failed to delete schedule.", ""));
        }

        #endregion
    }
}