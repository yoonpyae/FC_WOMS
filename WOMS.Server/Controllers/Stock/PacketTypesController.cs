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
        public async Task<IActionResult> Get()
        {
            return ResponseHelper.OK_Result(
                await repo.PacketTypes.GetAsync(x => !x.DeletedOn.HasValue), null);
        }

        //[HttpGet("auto-code")]
        //[EndpointSummary("Get Auto Code")]
        //[EndpointDescription("Get Auto Code for Packet Type")]
        //public async Task<IActionResult> GetAutoCode()
        //{
        //    PacketType? lastRecord = await repo.PacketTypes.GetFirstAsync(
        //        q => q.OrderByDescending(x => x.TypeCode));

        //    long maxCode = lastRecord?.TypeCode ?? 0;
        //    maxCode++;

        //    return ResponseHelper.OK_Result(maxCode, null);
        //}

        [HttpPost]
        [ValidateModel]
        [EndpointSummary("Create")]
        [EndpointDescription("Create new Packet Type")]
        public async Task<IActionResult> Create(PacketType model)
        {
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
            PacketType? packetType = await repo.PacketTypes.GetFirstAsync(x => x.TypeCode == model.TypeCode);

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
