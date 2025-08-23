using WOMS.Server.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.Services.AddOpenApi();

// Db Config
builder.Services.AddDbAndIdentityConfig(builder.Configuration);

// JWT Auth Config
builder.Services.AddJWTAuthConfig(builder.Configuration);

// MISC Config
builder.Services.AddMiscConfig();

// Core
builder.Services.AddCoreScopedConfig();

var app = builder.Build();

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
        _ = options.AddServer(new ScalarServer("https://localhost:7150") { Description = "Developer Mode" });

    if (app.Environment.IsDevelopment())
        _ = options.AddServer(new ScalarServer("https://localhost:7150")
        { Description = "UAT Local Mode" }); // THis is  Testing Mode For Analystic

});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
