namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class DoctorsController(
    IRepositoryWrapper repo,
    IFileService fileService,
    IConfiguration config) : ControllerBase
{
    #region CRUD Operation

    [HttpGet]
    [EndpointSummary("List")]
    [EndpointDescription("List all Doctor without deleted data")]
    public async Task<IActionResult> Get(long branchId)
    {
        IReadOnlyList<Doctor>? doctors = await repo.Doctors.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId);
        var result = doctors.Select(x => new
        {
            x.DoctorId,
            x.Id,
            x.BranchId,
            x.Name,
            x.Degree,
            x.Specialized,
            x.ConsultantFee,
            x.Ecgfee,
            x.XrayFee,
            x.UltrasoundFee,
            x.Status,
            x.CreatedOn,
            x.CreatedBy
        });
        return ResponseHelper.OK_Result(result, null);
    }

    [HttpGet("active")]
    [EndpointSummary("List Active Doctors")]
    [EndpointDescription("List all Doctors with Status true and not deleted")]
    public async Task<IActionResult> GetActive(long branchId)
    {
        IReadOnlyList<Doctor>? doctors = await repo.Doctors.GetAsync(x => !x.DeletedOn.HasValue && x.BranchId == branchId && x.Status == true);
        var result = doctors.Select(x => new { x.DoctorId, x.Id, x.Name, x.Specialized, x.Status });
        return ResponseHelper.OK_Result(result, null);
    }

    [HttpGet("{id:long}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Get Doctor by Id")]
    public async Task<IActionResult> Get(long branchId, long id)
    {
        Doctor? doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == id && x.BranchId == branchId);
        if (doctor == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Doctor not found.", ""));
        }

        var result = new
        {
            doctor.DoctorId,
            doctor.Id,
            doctor.Name,
            doctor.Degree,
            doctor.Specialized,
            doctor.ConsultantFee,
            doctor.Ecgfee,
            doctor.XrayFee,
            doctor.UltrasoundFee,
            doctor.Status
        };
        return ResponseHelper.OK_Result(result, null);
    }

    [HttpPost]
    [ValidateModel]
    [EndpointSummary("Create")]
    [EndpointDescription("Create a new Doctors")]
    public async Task<IActionResult> Create(Doctor model)
    {
        //  Prevent Duplicate Doctors in the same branch
        Doctor? existingDoctor = await repo.Doctors.GetFirstAsync(x =>
            x.Name.ToLower() == model.Name.ToLower() &&
            x.BranchId == model.BranchId &&
            !x.DeletedOn.HasValue);

        if (existingDoctor != null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("A doctor with this name already exists in this branch.", ""));
        }

        Doctor? lastRecord = await repo.Doctors.GetFirstAsync(x => x.BranchId == model.BranchId, q => q.OrderByDescending(x => x.DoctorId));
        model.DoctorId = (lastRecord?.DoctorId ?? 0) + 1;

        string userName = model.Name.Replace(" ", "").ToLower() + model.DoctorId;
        string email = $"{userName}@gmail.com";

        //  Prevent Identity Collision
        AspNetUser? userExists = await repo.AspNetUsers.GetFirstAsync(x => x.UserName == userName);
        if (userExists != null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Username collision detected. Please modify the doctor's name slightly.", ""));
        }

        string identityUserId = Guid.NewGuid().ToString();
        AspNetUser newUser = new()
        {
            Id = identityUserId,
            UserName = userName,
            NormalizedUserName = userName.ToUpper(),
            Email = email,
            NormalizedEmail = email.ToUpper(),
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString()
        };

        PasswordHasher<AspNetUser> hasher = new();
        newUser.PasswordHash = hasher.HashPassword(newUser, "FCdoctor@123");

        model.Id = identityUserId;
        model.CreatedOn = DateTime.Now;
        model.CreatedBy = User.Identity?.Name ?? string.Empty;

        AspNetRole? role = await repo.AspNetRoles.GetFirstAsync(x => x.Name == "Doctor");
        if (role == null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("System role 'Doctor' is missing. Please contact admin.", ""));
        }

        AspNetUserRole userRole = new()
        {
            UserId = identityUserId,
            RoleId = role.Id
        };

        repo.AspNetUsers.Create(newUser);
        repo.Doctors.Create(model);
        repo.AspNetUserRoles.Create(userRole);

        return await repo.SaveAsync()
            ? ResponseHelper.Created_Result("/api/doctor", null, new DefaultResponseMessageModel($"Successfully created Doctor #{model.DoctorId}.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Database error while creating doctor.", ""));
    }

    [HttpPut]
    [ValidateModel]
    [EndpointSummary("Update")]
    [EndpointDescription("Update a Doctors")]
    public async Task<IActionResult> Update(Doctor model)
    {
        Doctor? doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == model.DoctorId);
        if (doctor == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Doctor not found", ""));
        }

        //  Prevent renaming to an existing doctor's name
        Doctor? existingDoctor = await repo.Doctors.GetFirstAsync(x =>
            x.Name.ToLower() == model.Name.ToLower() &&
            x.BranchId == model.BranchId &&
            x.DoctorId != model.DoctorId &&
            !x.DeletedOn.HasValue);

        if (existingDoctor != null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Another doctor is already using this name.", ""));
        }

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
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully updated Doctor.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to update Doctor.", ""));
    }

    [HttpDelete("{id:long}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Delete Doctor")]
    public async Task<IActionResult> Delete(long? id)
    {
        Doctor? doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == id);
        if (doctor == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("Doctor not Found.", ""));
        }

        string userName = User.Identity?.Name ?? string.Empty;
        doctor.DeletedOn = DateTime.Now;
        doctor.DeletedBy = userName;
        repo.Doctors.Update(doctor);

        // SECURITY FIX: Lockout the associated login account when a doctor is deleted!
        if (!string.IsNullOrEmpty(doctor.Id))
        {
            AspNetUser? userAccount = await repo.AspNetUsers.GetFirstAsync(x => x.Id == doctor.Id);
            if (userAccount != null)
            {
                userAccount.LockoutEnd = DateTimeOffset.MaxValue; // Permanently locks the account
                repo.AspNetUsers.Update(userAccount);
            }
        }

        return await repo.SaveAsync()
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully deleted Doctor and revoked access.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unable to delete Doctor.", ""));
    }

    #endregion

    #region Image-Upload

    [HttpPut("uploadPhoto")]
    [EndpointSummary("Upload-photo")]
    [EndpointDescription("Upload Image")]
    public async Task<IActionResult> UploadPhoto(long id, IFormFile photo)
    {
        try
        {
            Doctor? doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == id);
            if (doctor != null)
            {
                if (!string.IsNullOrEmpty(doctor.Photo))
                {
                    DeleteExistingFile(doctor.Photo); // Delete the existing file if it exists
                }

                if (photo == null || photo.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }

                string[] allowedExtensions = { ".jpg", ".jpeg", ".png" };
                string extension = Path.GetExtension(photo.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest("Only JPG and PNG images are allowed.");
                }

                if (photo.Length > 2 * 1024 * 1024) // 2MB limit
                {
                    return BadRequest("File size must be less than 2MB.");
                }

                _ = await fileService.WriteFile(
                    photo,
                    $"{id}",
                    "doctor/photo");
                doctor.Photo = @$"files/doctor/photo/{doctor.DoctorId}{GetExtension(photo)}";
                repo.Doctors.Update(doctor);
            }
            else
            {
                return ResponseHelper.NotFound_Request(null,
                    new DefaultResponseMessageModel("Doctor's photo not found.", ""));
            }

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
    public async Task<IActionResult> ImportSignAsync(long id, IFormFile signFile)
    {
        try
        {
            Doctor? doctor = await repo.Doctors.GetFirstAsync(x => x.DoctorId == id);
            if (doctor != null)
            {
                if (!string.IsNullOrEmpty(doctor.Sign))
                {
                    DeleteExistingFile(doctor.Sign); // Delete the existing file if it exists
                }

                if (signFile == null || signFile.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }

                string[] allowedExtensions = { ".jpg", ".jpeg", ".png" };
                string extension = Path.GetExtension(signFile.FileName).ToLower();

                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest("Only JPG and PNG images are allowed.");
                }

                _ = await fileService.WriteFile(
                    signFile,
                    $"{id}",
                    "doctor/sign");
                doctor.Sign = @$"files/doctor/sign/{doctor.DoctorId}{GetExtension(signFile)}";
                repo.Doctors.Update(doctor);
            }
            else
            {
                return ResponseHelper.NotFound_Request(null,
                    new DefaultResponseMessageModel("Doctor's sign not found.", ""));
            }

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
        return ("." + file.FileName.Split('.')[^1]).ToLower();
    }

    #endregion

}