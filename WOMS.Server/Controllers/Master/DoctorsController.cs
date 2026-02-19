namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class DoctorsController(
    IRepositoryWrapper repo,
    IFileService fileService,
    IConvertion convertion,
    IConfiguration config) : ControllerBase
{
    #region CRUD Operation

    // GET
    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("List all Doctor without deleted data")]
    public async Task<IActionResult> Get(long branchId)
        => ResponseHelper.OK_Result(
            await repo.Doctors.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId),
            null);

    [HttpGet("active")]
    [EndpointSummary("List Active Doctors")]
    [EndpointDescription("List all Doctors with Status true and not deleted")]
    public async Task<IActionResult> GetActive(long branchId)
    {
        IReadOnlyList<Doctor>? doctors = await repo.Doctors.GetAsync(
            x => !x.DeletedOn.HasValue && x.BranchId == branchId && x.Status == true
        );
        return ResponseHelper.OK_Result(doctors, null);
    }

    [HttpGet("{id:long}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Get Doctor by Id")]
    public async Task<IActionResult> Get(long branchId, long id)
        => ResponseHelper.OK_Result(
            await repo.Doctors.GetFirstAsync(x => x.DoctorId == id && x.BranchId == branchId),
            null);

    [HttpGet("auto-id")]
    [EndpointSummary("Get Auto Id")]
    [EndpointDescription("Get an Doctors max Id")]
    public async Task<IActionResult> GetAutoId(long branchId)
    {
        Doctor? lastRecord =
            await repo.Doctors.GetFirstAsync(x => x.BranchId == branchId,
                q => q.OrderByDescending(x => x.DoctorId));

        long maxId = lastRecord?.DoctorId ?? 0;
        maxId++;
        return ResponseHelper.OK_Result(maxId, null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Create a new Doctors")]
    public async Task<IActionResult> Create(Doctor model)
    {
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;

        repo.Doctors.Create(model);
        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("/api/doctor", null,
                new DefaultResponseMessageModel("Successfully created new Doctor.", ""))
            : ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("Unable to created Doctor.", ""));
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update")]
    [EndpointDescription("Update a Doctors")]
    public async Task<IActionResult> Update(Doctor model)
    {
        Doctor? doctor =
            await repo.Doctors.GetFirstAsync(x => x.DoctorId == model.DoctorId);

        if (doctor == null)
            return ResponseHelper.NotFound_Request(
                null,
                new DefaultResponseMessageModel("Doctor not found", ""));

        //Re-assign Values
        doctor.DoctorId = model.DoctorId;
        doctor.BranchId = model.BranchId;
        doctor.Name = model.Name;
        doctor.Degree = model.Degree;
        doctor.Specialized = model.Specialized;
        doctor.Photo = model.Photo;
        doctor.Sign = model.Sign;
        doctor.ConsultantFee = model.ConsultantFee;
        doctor.Ecgfee = model.Ecgfee;
        doctor.XrayFee = model.XrayFee;
        doctor.UltrasoundFee = model.UltrasoundFee;
        doctor.UpdatedOn = DateTime.Now;
        doctor.UpdatedBy = User.Identity?.Name ?? string.Empty;
        doctor.Status = model.Status;

        repo.Doctors.Update(doctor);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null,
                new DefaultResponseMessageModel("Successfully updated Doctor.", ""))
            : ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("Unable to update Doctor.", ""));
    }

    [HttpDelete("{id:long}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Delete Doctor")]
    public async Task<IActionResult> Delete(long? id)
    {
        Doctor? doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == id);

        if (doctor == null)
        {
            return ResponseHelper.NotFound_Request(null,
                new DefaultResponseMessageModel("Doctor not Found.", ""));
        }

        string userName = User.Identity?.Name ?? string.Empty;

        doctor.DeletedOn = DateTime.Now;
        doctor.DeletedBy = userName;

        repo.Doctors.Update(doctor);
        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null,
                new DefaultResponseMessageModel("Successfully deleted Doctor.", ""))
            : ResponseHelper.Bad_Request(null,
                new DefaultResponseMessageModel("Unable to delete Doctor.", ""));
    }

    #endregion

    #region Image-Upload

    [HttpPut("uploadPhoto")]
    [ValidateModel]
    [EndpointSummary("Upload-photo")]
    [EndpointDescription("Upload Image")]
    public async Task<IActionResult> ImportImageAsync(long id, IFormFile photo)
    {
        if (photo == null || photo.Length == 0)
            return BadRequest(new DefaultResponseMessageModel("No photo uploaded.", ""));

        try
        {
            Doctor? doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == id);
            if (doctor == null)
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Doctor not found.", ""));

            if (!string.IsNullOrEmpty(doctor.Photo))
                DeleteExistingFile(doctor.Photo);

            string extension = GetExtension(photo);
            string filePath = $"files/doctor/photo/{doctor.DoctorId}{extension}";

            await fileService.WriteImage(photo, $"{id}", "doctor/photo");
            doctor.Photo = filePath;

            repo.Doctors.Update(doctor);

            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully Uploaded Doctor Photo.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to Upload Doctor Photo.", ""));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                new DefaultResponseMessageModel { EN = ex.Message, MM = ex.Message });
        }
    }

    [HttpPut("uploadSign")]
    [ValidateModel]
    [EndpointSummary("Upload-Sign")]
    [EndpointDescription("Upload Sign")]
    public async Task<IActionResult> ImportSignAsync(DoctorUploadModel model)
    {
        if (string.IsNullOrEmpty(model.File))
            return BadRequest(new DefaultResponseMessageModel("No sign file uploaded.", ""));

        try
        {
            Doctor? doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == model.Id);
            if (doctor == null)
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Doctor not found.", ""));

            if (!string.IsNullOrEmpty(doctor.Sign))
                DeleteExistingFile(doctor.Sign);

            // Get extension and decode Base64
            string extension = convertion.GetFileExtension(model.File);
            byte[] imageBytes;
            try
            {
                imageBytes = DecodeBase64(model.File ?? "");
            }
            catch (FormatException)
            {
                return BadRequest(new DefaultResponseMessageModel("Invalid Base64 string.", ""));
            }

            string fileName = $"{model.Id}{extension}";
            string filePath = $"images/doctor/sign/{fileName}";

            using MemoryStream memoryStream = new(imageBytes);
            IFormFile formFile = new FormFile(memoryStream, 0, memoryStream.Length, "fileUpload", fileName);

            await fileService.WriteImage(formFile, $"{model.Id}", "doctor/sign");
            doctor.Sign = filePath;

            repo.Doctors.Update(doctor);

            return await repo.SaveAsync()
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully Uploaded Doctor Sign.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to Upload Doctor Sign.", ""));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                new DefaultResponseMessageModel { EN = ex.Message, MM = ex.Message });
        }
    }

    [NonAction]
    private void DeleteExistingFile(string existingFile)
    {
        string existingFilePath =
            Path.Combine(config.GetSection("Application_Path").Value ?? "", "wwwroot", existingFile);
        _ = fileService.FileDelete(existingFilePath);
    }

    private string GetExtension(IFormFile file)
    {
        string ext = Path.GetExtension(file.FileName);
        return string.IsNullOrEmpty(ext) ? "" : ext.ToLower();
    }

    private byte[] DecodeBase64(string base64String)
    {
        if (string.IsNullOrWhiteSpace(base64String))
            throw new ArgumentException("Base64 string is empty");

        // Remove data URI prefix if present
        var commaIndex = base64String.IndexOf(',');
        if (commaIndex >= 0)
            base64String = base64String[(commaIndex + 1)..];

        // Remove whitespace / newlines
        base64String = base64String.Trim();
        return Convert.FromBase64String(base64String);
    }

    #endregion

}