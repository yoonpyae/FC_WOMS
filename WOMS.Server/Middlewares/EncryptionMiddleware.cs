namespace WOMS.Server.Middlewares
{
    public class EncryptionMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next;

        // Whenever we call any action method then call this before call the action method
        public async Task Invoke(HttpContext context)
        {
            string? referer = context.Request.Headers.Referer;
            if (!GLOBAL.GetEncryptionExcludeURLs().Contains(context.Request.Path.Value ?? "") &&
                !GLOBAL.GetEncryptionExcludeURLs().Any(x => (context.Request.Path.Value ?? "").StartsWith(x)) &&
                context.Request.Method != "OPTIONS" &&
                string.IsNullOrEmpty(context.Request.Headers["Postman-Token"]) &&
                string.IsNullOrEmpty(context.Request.Headers["Mobile-Request"]) &&
                !(referer ?? "").Contains("localhost:7126") &&
                    !(referer ?? "").Contains("13.212.76.8:5003:5003"))
            {
                context.Request.EnableBuffering();
                context.Request.Body = EncryptionService.DecryptStream(context.Request.Body);
                if (context.Request.QueryString.HasValue)
                {
                    string decryptedString = EncryptionService.DecryptString(context.Request.QueryString.Value[1..]);
                    context.Request.QueryString = new QueryString($"?{decryptedString}");
                }
            }

            await _next(context);
        }
    }
}