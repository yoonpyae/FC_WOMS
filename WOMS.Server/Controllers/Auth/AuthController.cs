using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using WOMS.Server.Models;

namespace WOMS.Server.Controllers.Auth
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(
        UserManager<IdentityUser> userManager,
        IRepositoryWrapper repo,
        ILogger<AuthController> logger,
        ITokenBuilder tokenBuilder,
        IConfiguration configuration) : ControllerBase
    {
        private readonly ILogger<AuthController> _logger = logger;
        private readonly ITokenBuilder _tokenBuilder = tokenBuilder;
        private readonly UserManager<IdentityUser> _userManager = userManager;
        private readonly IRepositoryWrapper _repo = repo;
        private readonly IConfiguration _configuration = configuration;

        [AllowAnonymous]
        [HttpPost("access-token")]
        [EndpointSummary("Access Token")]
        [EndpointDescription("""
                             Generates an access token for the requested user.
                             <br /> 
                             This token will be valid for one day.
                             <br /> 
                             A refresh token will also be generated, which can be used to obtain a new access token if the original expires.
                             The refresh token will be valid for 30 days.
                             """)]
        [ValidateModel]
        [Produces("application/json")]
        [ProducesResponseType(typeof(LoginModel), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AccessToken([FromBody] LoginModel model)
        {
            try
            {
                // Validate the incoming model
                if (!ModelState.IsValid)
                {
                    return ResponseHelper.Bad_Request(null,
                        new DefaultResponseMessageModel("Please fill data.", ""));
                }

                // Attempt to find the user by username or email
                IdentityUser? user = await _userManager.FindByNameAsync(model.Username) ??
                                     await _userManager.FindByEmailAsync(model.Username);

                // If user is not found, return a not found response
                if (user == null)
                {
                    return ResponseHelper.NotFound_Request(null,
                        new DefaultResponseMessageModel("Invalid username or invalid email. User not found.", ""));
                }

                // Check if the password is correct
                if (await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    // Retrieve user roles
                    IList<string> roles = await _userManager.GetRolesAsync(user);
                    string role = roles.FirstOrDefault() ?? string.Empty;

                    // Generate access and refresh tokens
                    DateTime expiry = DateTime.Now.AddDays(1);
                    DateTime refreshTokeExpiry = DateTime.Now.AddDays(30);
                    string accessToken = _tokenBuilder.GenerateAccessToken(user, role, expiry);
                    string refreshToken = _tokenBuilder.GenerateRefreshToken();

                    // Check if there is an existing token claim for the user
                    TokenClaim? tokenClaim = await _repo.TokenClaims.GetByIdAsync(user.Id);
                    if (tokenClaim != null)
                    {
                        // Update the existing token claim
                        tokenClaim.AccessToken = accessToken;
                        tokenClaim.RefreshToken = refreshToken;
                        tokenClaim.TokenExpiry = refreshTokeExpiry;
                        _repo.TokenClaims.Update(tokenClaim);
                    }
                    else
                    {
                        // Create a new token claim
                        TokenClaim newTokenClaim = new()
                        {
                            UserId = user.Id,
                            RefreshDate = DateTime.Now,
                            AccessToken = accessToken,
                            RefreshToken = refreshToken,
                            TokenExpiry = refreshTokeExpiry
                        };
                        _repo.TokenClaims.Create(newTokenClaim);
                    }

                    // Save changes to the repository
                    await _repo.SaveAsync();

                    // Log the successful token generation
                    _logger.LogInformation("Access token generated! [UserId:{id}] [UserName:{username}]",
                        user.Id,
                        user.UserName);

                    // Return a successful response with the token details
                    return ResponseHelper.OK_Result(
                        new
                        {
                            access_token = accessToken,
                            refresh_token = refreshToken,
                            expiration = 30,
                            user = new
                            {
                                user.Id,
                                user.UserName,
                                user.Email,
                                user.PhoneNumber,
                                user_role = role.ToLower()
                            }
                        },
                        new DefaultResponseMessageModel("Successfully generated access token.", "")
                    );
                }

                // Log the unauthorized request
                _logger.LogInformation("Unauthorized request [UserId:{id}] [UserName:{username}]", user.Id, user.UserName);

                // Return an unauthorized response
                return ResponseHelper.Unauthorized_Request(null,
                    new DefaultResponseMessageModel("The username or password is invalid. Please try again.", ""));
            }
            catch (Exception exp)
            {
                // Log the error
                _logger.LogError("Error: {message}", exp.Message);

                // Return an internal server error response
                return ResponseHelper.InternalServerError_Request(
                    null, new DefaultResponseMessageModel("Error: " + exp.Message, ""));
            }
        }

        [AllowAnonymous]
        [HttpPost("refresh-token")]
        [EndpointSummary("Refrsh Token")]
        [EndpointDescription("""
                             Generates a new access token and refresh token for the requesting user who has a valid previous refresh token. </br>
                             This new refresh token will be valid for 30 days, while the new access token will be valid for 1 day.
                             """)]
        [ValidateModel]
        [Produces("application/json")]
        [ProducesResponseType(typeof(LoginModel), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenModel model)
        {
            try
            {
                string accessToken = model.Access_Token;
                string refreshToken = model.Refresh_Token;

                // Validate the access token
                ClaimsPrincipal principal = _tokenBuilder.GetPrincipalFromExpiredToken(accessToken);

                // Retrieve user and token claim
                IdentityUser? user = await _userManager.FindByNameAsync(principal.Identity?.Name ?? "");
                if (user == null)
                {
                    return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("User not found.", ""));
                }

                TokenClaim? tokenClaim = await _repo.TokenClaims.GetByIdAsync(user.Id);
                if (tokenClaim == null || tokenClaim.RefreshToken != refreshToken || tokenClaim.TokenExpiry <= DateTime.Now)
                {
                    _logger.LogDebug("Unauthorized Refresh Token [Token:{Token}]", refreshToken);
                    return ResponseHelper.Unauthorized_Request(null,
                        new DefaultResponseMessageModel("Invalid refresh token or refresh token has expired.", ""));
                }

                // Generate new tokens
                DateTime expiry = DateTime.Now.AddDays(1);
                DateTime refreshTokenExpiry = DateTime.Now.AddDays(30);

                IList<string> roles = await _userManager.GetRolesAsync(user);
                string newAccessToken = _tokenBuilder.GenerateAccessToken(user, roles.FirstOrDefault() ?? string.Empty, expiry);
                string newRefreshToken = _tokenBuilder.GenerateRefreshToken();

                // Update token claim
                tokenClaim.RefreshDate = DateTime.Now;
                tokenClaim.AccessToken = newAccessToken;
                tokenClaim.RefreshToken = newRefreshToken;
                tokenClaim.TokenExpiry = refreshTokenExpiry;

                _repo.TokenClaims.Update(tokenClaim);
                await _repo.SaveAsync();

                _logger.LogDebug("New Refresh Token generated! [RefreshToken:{Refresh_Token}]", newRefreshToken);

                return ResponseHelper.OK_Result(
                    new
                    {
                        access_token = newAccessToken,
                        refresh_token = newRefreshToken,
                        expiration = 30,
                        user = new
                        {
                            user.Id,
                            user.Email,
                            user.UserName,
                            user.PhoneNumber,
                            user_role = roles.FirstOrDefault()?.ToLower()
                        }
                    },
                    new DefaultResponseMessageModel("Successfully generated new refresh token.", ""));
            }
            catch (Exception exp)
            {
                // Log the error
                _logger.LogError("Error: {message}", exp.Message);

                return ResponseHelper.InternalServerError_Request(null,
                    new DefaultResponseMessageModel("Error: " + exp.Message, ""));
            }
        }

        [HttpPost("revoke-token/{username}")]
        [EndpointSummary("Revoke Token")]
        [EndpointDescription("Revoking token for the specified user. This will log out the user from the current device.")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Revoke(string username)
        {
            try
            {
                IdentityUser? user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("User not found.", ""));
                }

                TokenClaim? tokenClaim = await _repo.TokenClaims.GetByIdAsync(user.Id);
                if (tokenClaim != null)
                {
                    tokenClaim.RefreshDate = DateTime.Now;
                    tokenClaim.AccessToken = null;
                    tokenClaim.RefreshToken = null;
                    tokenClaim.TokenExpiry = null;
                    _repo.TokenClaims.Update(tokenClaim);

                    await _repo.SaveAsync();
                }

                _logger.LogDebug("Revoke Token successfully! [UserId:{UserId}]", user.Id);
                return ResponseHelper.OK_Result(new
                    {
                        user = new
                        {
                            user.Id,
                            user.UserName,
                            user.Email,
                            user.PhoneNumber,
                            user_role = string.Empty
                        }
                    },
                    new DefaultResponseMessageModel("Token revoked successfully.", ""));
            }
            catch (Exception exp)
            {
                // Log the error
                _logger.LogError("Error: {message}", exp.Message);
                return ResponseHelper.InternalServerError_Request(null,
                    new DefaultResponseMessageModel("Error: " + exp.Message, ""));
            }
        }

        /// <summary>
        /// Status
        /// </summary>
        /// <returns></returns>
        [HttpGet("status")]
        [EndpointSummary("Authorize Status")]
        public IActionResult StatusAsync()
        {
            return (User.Identity != null)
                ? ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Authorized.", ""))
                : ResponseHelper.Bad_Request(null, new DefaultResponseMessageModel("Unauthorized.", ""));
        }

        /// <summary>
        /// Claims
        /// </summary>
        /// <returns></returns>
        [HttpPost("claims")]
        [EndpointSummary("User Claims")]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(DefaultResponseModel), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateClaim()
        {
            IdentityUser? user = await _userManager.FindByNameAsync(User.Identity?.Name ?? string.Empty);
            if (user == null)
            {
                return ResponseHelper.NotFound_Request(null, new DefaultResponseMessageModel("User not found", ""));
            }

            await _userManager.AddClaimAsync(user, new Claim("Master_Read", "Branch"));
            return ResponseHelper.OK_Result(null, new DefaultResponseMessageModel("Successfully Created", ""));
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            IdentityUser? user = await _userManager.FindByNameAsync(model.Username);
            if (user == null) return Unauthorized();

            if (!await _userManager.CheckPasswordAsync(user, model.Password)) return Unauthorized();

            IList<string> roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            };
            // Add role claims
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds);

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token), roles });
        }
    }
}