using System.Data;

namespace WOMS.Server.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[ApiController]
public class UsersController(
    UserManager<IdentityUser> userManager,
    RoleManager<IdentityRole> roleManager,
    IRepositoryWrapper repo) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("List Users")]
    public async Task<IActionResult> GetUsers()
    {
        List<IdentityUser> users = await userManager.Users.ToListAsync();
        List<object> userList = [];

        foreach (IdentityUser? user in users)
        {
            IList<string> roles = await userManager.GetRolesAsync(user);

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

        user.Email = model.Email;
        user.PhoneNumber = model.PhoneNumber;

        IdentityResult result = await userManager.UpdateAsync(user);

        if (result.Succeeded)
        {
            if (await roleManager.RoleExistsAsync(model.Role))
            {
                IList<string> currentRoles = await userManager.GetRolesAsync(user);
                if (!currentRoles.Contains(model.Role))
                {
                    _ = await userManager.RemoveFromRolesAsync(user, currentRoles); // Remove old roles
                    _ = await userManager.AddToRoleAsync(user, model.Role);         // Add new role
                }
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