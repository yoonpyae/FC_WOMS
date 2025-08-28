using System.Net;

namespace WOMS.Server.Middlewares
{
    public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<EncryptionMiddleware> logger)
    {
        private readonly RequestDelegate _next = next;
        private readonly ILogger<EncryptionMiddleware> _logger = logger;

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError("Runtime Error: {message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            var model = new
            {
                success = false,
                code = StatusCodes.Status500InternalServerError,
                data = "",
                message = ex.Message
            };

            return context.Response.WriteAsync(JsonConvert.SerializeObject(model));
        }
    }
}