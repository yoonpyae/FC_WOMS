FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5003

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["WOMS.Server.csproj", "./"]
RUN dotnet restore "WOMS.Server.csproj"

COPY . .
RUN dotnet build "WOMS.Server.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WOMS.Server.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Development

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WOMS.Server.dll"]