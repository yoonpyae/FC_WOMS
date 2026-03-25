namespace WOMS.Server.Controllers.Stock
{
    [Authorize]
    [Route("api/stock/[controller]")]
    [ApiController]
    public class PacketTypesController(IRepositoryWrapper repo) : ControllerBase
    {
        #region CRUD Operation

        [HttpGet]
        [EndpointSummary("List")]
        [EndpointDescription("List all Packet Types")]
        public async Task<IActionResult> Get(long branchId)
        {
            return ResponseHelper.OK_Result(
                await repo.PacketTypes.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId), null);
        }

        [HttpGet("auto-code")]
        [EndpointSummary("Get Auto Code")]
        [EndpointDescription("Get Auto Code for Packet Type")]
        public async Task<IActionResult> GetAutoCode(long branchId)
        {
            PacketType? lastRecord = await repo.PacketTypes.GetFirstAsync(x => x.BranchId == branchId,
                q => q.OrderByDescending(x => x.TypeCode));

            long maxCode = lastRecord?.TypeCode ?? 0;
            maxCode++;

            return ResponseHelper.OK_Result(maxCode, null);
        }

        [HttpPost]
        [ValidateModel]
        [EndpointSummary("Create")]
        [EndpointDescription("Create new Packet Type")]
        public async Task<IActionResult> Create(PacketType model)
        {
            bool exists = await repo.PacketTypes.AnyAsync(x =>
        x.TypeName.ToLower() == model.TypeName.ToLower() &&
        x.BranchId == model.BranchId &&
        !x.DeletedOn.HasValue);

            if (exists)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("A packet type with this name already exists in this branch.", ""));
            }

            model.CreatedOn = DateTime.Now;
            model.CreatedBy = User.Identity?.Name;

            repo.PacketTypes.Create(model);
            return await repo.SaveAsync()
                ? ResponseHelper.Created_Result("api/PacketTypes", null,
                    new DefaultResponseMessageModel("Successfully created new Packet Type.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to create Packet Type", ""));
        }

        [HttpPut]
        [ValidateModel]
        [EndpointSummary("Update")]
        [EndpointDescription("Update Packet Type")]
        public async Task<IActionResult> Edit(PacketType model)
        {
            bool nameConflict = await repo.PacketTypes.AnyAsync(x =>
        x.TypeName.ToLower() == model.TypeName.ToLower() &&
        x.BranchId == model.BranchId &&
        x.TypeCode != model.TypeCode &&
        !x.DeletedOn.HasValue);

            if (nameConflict)
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Another packet type already uses this name.", ""));
            }

            PacketType? packetType = await repo.PacketTypes.GetFirstAsync(x =>
                    x.TypeCode == model.TypeCode &&
                    x.BranchId == model.BranchId);

            if (packetType == null)
            {
                return ResponseHelper.NotFound_Request(
                    null,
                    new DefaultResponseMessageModel("Packet Type not found.", ""));
            }

            packetType.Capacity = model.Capacity;
            packetType.TypeName = model.TypeName;
            packetType.Status = model.Status;
            packetType.Remark = model.Remark;
            packetType.UpdatedOn = DateTime.Now;
            packetType.UpdatedBy = User.Identity?.Name;

            repo.PacketTypes.Update(packetType);
            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null,
                    new DefaultResponseMessageModel("Successfully updated Packet Type.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update Packet Type", ""));
        }

        [HttpDelete("{TypeCode:long}")]
        [EndpointSummary("Delete")]
        [EndpointDescription("Delete Packet Type")]
        public async Task<IActionResult> Delete(long typeCode)
        {
            PacketType? packetType = await repo.PacketTypes.GetFirstAsync(x => x.TypeCode == typeCode);

            if (packetType == null)
            {
                return ResponseHelper.NotFound_Request(
                    null,
                    new DefaultResponseMessageModel("Packet Type not found.", ""));
            }

            bool isUsedInMainStock = await repo.MainStocks.AnyAsync(x => x.TypeCode == typeCode && x.DeletedOn == null);

            if (isUsedInMainStock)
            {
                return ResponseHelper.Bad_Request(
                    null,
                    new DefaultResponseMessageModel("Cannot delete. Packet Type is in use in Main Stock.", ""));
            }

            packetType.DeletedOn = DateTime.Now;
            packetType.DeletedBy = User.Identity?.Name;

            repo.PacketTypes.Update(packetType);

            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null,
                    new DefaultResponseMessageModel("Successfully deleted Packet Type.", ""))
                : ResponseHelper.Bad_Request(null,
                    new DefaultResponseMessageModel("Unable to delete Packet Type.", ""));
        }
    }

    #endregion
}
