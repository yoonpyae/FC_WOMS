WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.


// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddOpenApi();

// Db Config
builder.Services.AddDbAndIdentityConfig(builder.Configuration);
builder.Services.AddHostedService<AppointmentCleanupService>();

// JWT Auth Config
builder.Services.AddJWTAuthConfig(builder.Configuration);
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", p => p.RequireRole("SuperAdmin"));
    options.AddPolicy("RequireManagerOrAdmin", p => p.RequireRole("Doctor", "SuperAdmin"));
});

// MISC Config
builder.Services.AddMiscConfig();

// Core
builder.Services.AddCoreScopedConfig();

WebApplication app = builder.Build();

app.UseDefaultFiles();

app.UseMiddleware<EncryptionMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
}

_ = app.MapOpenApi("/docs/openapi/{documentName}.json");
app.MapScalarApiReference("/docs", options =>
{
    options.DefaultOpenAllTags = false;

    options.OpenApiRoutePattern = "/docs/openapi/v1.json";

    options.HideClientButton = true;

    options.HideModels = true;

    if (app.Environment.IsStaging())
    {
        _ = options.AddServer(new ScalarServer("https://localhost:7126") { Description = "Developer Mode" });
    }

    if (app.Environment.IsDevelopment())
    {
        _ = options.AddServer(new ScalarServer("http://13.212.76.8:6007")
        { Description = "UAT Local Mode" }); // THis is  Testing Mode For Analystic
    }
});

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseCors("AllowedCorsOrigins");

app.UseAuthentication();
app.UseAuthorization();


app.UseAntiforgery();
app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

