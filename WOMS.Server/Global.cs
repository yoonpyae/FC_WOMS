//global using WOMS.Server.Attributes;
//global using WOMS.Server.Data;
//global using WOMS.Server.Entities;
//global using WOMS.Server.Extensions;
//global using WOMS.Server.Helper;
//global using WOMS.Server.Interceptors;
//global using WOMS.Server.Interfaces;
//global using WOMS.Server.Interfaces.Repositories;
//global using WOMS.Server.Interfaces.Repositories.Base;
//global using WOMS.Server.Middlewares;
//global using WOMS.Server.Models;
//global using WOMS.Server.Services;
//global using WOMS.Server.Services.Repository;
//global using WOMS.Server.Services.Repository.Base;
//global using WOMS.Server.Validations;

global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.OpenApi;
global using Microsoft.OpenApi.Models;

global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.AspNetCore.Identity;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.AspNetCore.Mvc.Filters;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.EntityFrameworkCore.Query;
global using Microsoft.IdentityModel.Tokens;

global using Newtonsoft.Json;

global using Scalar.AspNetCore;

//global using Serilog;

global using System.Linq.Expressions;
global using System.Net.Mime;
global using System.Text;
global using System.Text.Json.Serialization;

//global using AuthorizeAttribute = WOMS.Server.Attributes.AuthorizeAttribute;

namespace WOMS.Server;

internal class GLOBAL
{
    public static bool IsOriginAllowed(string origin)
    {
        Uri uri = new(origin);
        _ = System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "n/a";

        bool isAllowed = uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);

        return isAllowed;
    }

    public static List<string> GetEncryptionExcludeURLs()
    {
        List<string> excludeURL =
        [
            "localhost:7150",
        ];
        return excludeURL;
    }

    public static List<string> GetHttpLoggingExcludeURLs()
    {
        List<string> excludeURL =
        [
            "/swagger",
            "/assets/",
        ];
        return excludeURL;
    }
}