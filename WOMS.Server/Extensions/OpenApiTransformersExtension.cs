namespace WOMS.Server.Extensions;

public static class OpenApiTransformersExtension
{
    public static OpenApiOptions UseJwtBearerAuthentication(this OpenApiOptions options)
    {
        OpenApiSecurityScheme scheme = new()
        {
            Type = SecuritySchemeType.Http,
            Name = JwtBearerDefaults.AuthenticationScheme,
            Scheme = JwtBearerDefaults.AuthenticationScheme,
            Reference = new()
            {
                Type = ReferenceType.SecurityScheme,
                Id = JwtBearerDefaults.AuthenticationScheme
            }
        };

        _ = options.AddDocumentTransformer((document, context, ct) =>
        {
            document.Info = new()
            {
                Title = "Fc WOMS Authentication API",
                Version = "v2",
                Description = "API for processing auth for users."
            };
            document.Components ??= new();
            document.Components.SecuritySchemes.Add(JwtBearerDefaults.AuthenticationScheme, scheme);
            return Task.CompletedTask;
        });

        _ = options.AddOperationTransformer((operation, context, ct) =>
        {
            if (context.Description.ActionDescriptor.EndpointMetadata.OfType<IAuthorizeData>().Any())
            {
                operation.Security = [new() { [scheme] = [] }];
            }
            return Task.CompletedTask;
        });

        return options;
    }
}
