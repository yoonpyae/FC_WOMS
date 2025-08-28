using System.Security.Claims;
using WOMS.Server.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace WOMS.Server.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
    {
        public string? Policy { get; set; } = null;
        public string? Claim { get; set; } = null;

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            // skip authorization if action is decorated with [AllowAnonymous] attribute
            var allowAnonymous = context.ActionDescriptor.EndpointMetadata.OfType<AllowAnonymousAttribute>().Any();
            if (allowAnonymous)
                return;

            try
            {
                using DatabaseContext _dbContext = new();
                List<Claim> claims = context.HttpContext.User.Claims.ToList();
                string? role = claims.FirstOrDefault(x => x.Type == ClaimTypes.Role)?.Value;

                // Break Authorize check If Role Cashire
                if (role == "Cashier") return;

                DateTime expiration = DateTime.Parse(claims?.FirstOrDefault(x => x.Type.Equals("Expiration", StringComparison.OrdinalIgnoreCase))?.Value ?? DateTime.Now.ToString());

                DateTime _d_expiry = new(expiration.Year,
                                     expiration.Month,
                                     expiration.Day,
                                     expiration.Hour,
                                     expiration.Minute,
                                     expiration.Second);

                string userId = claims?.FirstOrDefault(x => x.Type.Equals("UserId", StringComparison.OrdinalIgnoreCase))?.Value ?? string.Empty;

                List<AspNetUserClaim> userClaims = await _dbContext.AspNetUserClaims.Where(x => x.UserId == userId).ToListAsync();

                bool validUser = true;

                if (!string.IsNullOrEmpty(userId))
                {
                    DateTime _d_current = DateTime.Now;
                    validUser = _d_expiry > _d_current;
                }
                else
                {
                    validUser = false;
                }

                if (Policy != null && Claim != null && role != "Cashier")
                {
                    if (!userClaims.Any(x => x.ClaimType == Policy && x.ClaimValue == Claim))
                    {
                        // not logged in
                        context.Result = new JsonResult(new
                        {
                            success = false,
                            code = StatusCodes.Status403Forbidden,
                            data = "",
                            message = $"Request Permission denied. [{Policy}]",
                        })
                        { StatusCode = StatusCodes.Status403Forbidden };
                        return;
                    }
                }

                if (!validUser)
                {
                    // not logged in
                    context.Result = new JsonResult(new
                    {
                        success = false,
                        code = StatusCodes.Status403Forbidden,
                        data = "",
                        message = $"Unauthorized Request. The other device is logged at {_d_expiry:dd-MMM-yyyy hh:mm:ss tt}",
                    })
                    { StatusCode = StatusCodes.Status403Forbidden };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
    }

    internal class DatabaseContext : DbContext
    {
        public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            _ = optionsBuilder.UseSqlServer("Data Source=185.180.223.5;Initial Catalog=WOMS;Persist Security Info=True;TrustServerCertificate=true;User ID=sa;Password=Efficients0ft@1982");
        }
    }
}
