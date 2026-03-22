using System.Data;

namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class UsersController(
    UserManager<IdentityUser> userManager,
    RoleManager<IdentityRole> roleManager) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("List Users")]
    public async Task<IActionResult> GetUsers()
    {
        List<IdentityUser> users = await userManager.Users.ToListAsync();
        List<object> userList = new();

        foreach (IdentityUser? user in users)
        {
            IList<string> roles = await userManager.GetRolesAsync(user);

            // Skip Doctors as they are managed elsewhere
            if (roles.Contains("Doctor"))
            {
                continue;
            }

            userList.Add(new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.PhoneNumber,
                Role = roles.FirstOrDefault() ?? "Unassigned"
            });
        }

        return ResponseHelper.OK_Result(userList, null);
    }

    [HttpPost]
    [EndpointSummary("Create User")]
    public async Task<IActionResult> CreateUser([FromBody] UserCreateDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest("Invalid data.");
        }

        //  Explicit Duplicate Checks
        if (await userManager.FindByNameAsync(model.UserName) != null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Username is already taken.", ""));
        }

        if (await userManager.FindByEmailAsync(model.Email) != null)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Email is already registered.", ""));
        }

        //  Role Existence Check
        if (!await roleManager.RoleExistsAsync(model.Role))
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Invalid Role selected.", ""));
        }

        IdentityUser newUser = new()
        {
            UserName = model.UserName,
            Email = model.Email,
            PhoneNumber = model.PhoneNumber,
            EmailConfirmed = true
        };

        IdentityResult result = await userManager.CreateAsync(newUser, model.Password);

        if (result.Succeeded)
        {
            _ = await userManager.AddToRoleAsync(newUser, model.Role);
            return ResponseHelper.Created_Result("/api/master/users", null,
                new DefaultResponseMessageModel($"Successfully created {model.Role} account.", ""));
        }

        string errors = string.Join(", ", result.Errors.Select(e => e.Description));
        return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel(errors, ""));
    }

    [HttpPut("{id}")]
    [EndpointSummary("Update User")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UserUpdateDto model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest("Invalid data.");
        }

        IdentityUser? user = await userManager.FindByIdAsync(id);
        if (user == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("User not found.", ""));
        }

        //  Check if the new email belongs to someone else
        IdentityUser? existingEmailUser = await userManager.FindByEmailAsync(model.Email);
        if (existingEmailUser != null && existingEmailUser.Id != id)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Email is already used by another account.", ""));
        }

        //  Role Check (Don't silently fail if role is invalid)
        if (!await roleManager.RoleExistsAsync(model.Role))
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Invalid Role selected.", ""));
        }

        //  Prevent self-demotion from SuperAdmin
        if (user.UserName == User.Identity?.Name)
        {
            IList<string> currentRolesForSelf = await userManager.GetRolesAsync(user);
            if (currentRolesForSelf.Contains("SuperAdmin") && model.Role != "SuperAdmin")
            {
                return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("You cannot remove your own SuperAdmin privileges.", ""));
            }
        }

        user.Email = model.Email;
        user.PhoneNumber = model.PhoneNumber;

        IdentityResult result = await userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            IList<string> currentRoles = await userManager.GetRolesAsync(user);
            if (!currentRoles.Contains(model.Role))
            {
                _ = await userManager.RemoveFromRolesAsync(user, currentRoles);
                _ = await userManager.AddToRoleAsync(user, model.Role);
            }
            return ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("User updated successfully.", ""));
        }

        string errors = string.Join(", ", result.Errors.Select(e => e.Description));
        return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel(errors, ""));
    }

    [HttpDelete("{id}")]
    [EndpointSummary("Delete User")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        IdentityUser? user = await userManager.FindByIdAsync(id);
        if (user == null)
        {
            return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("User not found.", ""));
        }

        // Prevent self-deletion
        if (user.UserName == User.Identity?.Name)
        {
            return ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("You cannot delete your own account.", ""));
        }

        IdentityResult result = await userManager.DeleteAsync(user);

        return result.Succeeded
            ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("User deleted successfully.", ""))
            : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Failed to delete user.", ""));
    }
}

// DTO for incoming data
public class UserCreateDto
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UserUpdateDto
{
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}