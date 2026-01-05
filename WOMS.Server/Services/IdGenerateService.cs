using WOMS.Server.Data;
using WOMS.Server.Interfaces;

namespace WOMS.Server.Services;

public class IdGenerateService(
    WOMSDbContext context,
    IRandomizer randomizer) : IIdGenerateService
{
    public async Task<string> GetItemCode(string Name, long ClinicId)
    {
        if (string.IsNullOrWhiteSpace(Name))
            throw new ArgumentException("Item name cannot be null or empty.", nameof(Name));

        char prefix = Name[0];

        List<string> items = await context.StockItems
            .AsNoTracking()
            .Where(x => x.ClinicId == ClinicId)
            .Select(x=>x.ItemCode)
            .ToListAsync(); // Load filtered data into memory (EF Core limitation)
        
        string? lastItem = items
            .Where(x => x[0] == prefix)
            .OrderByDescending(x => x)
            .FirstOrDefault();

        if (lastItem == null)
        {
            return $"{prefix}0001";
        }

        // Extract numeric part safely
        string numericPart = lastItem.Substring(1);
        if (!int.TryParse(numericPart, out int lastNumber))
        {
            throw new InvalidOperationException($"Invalid item code format: {lastItem}");
        }

        return $"{prefix}{(lastNumber + 1):D4}"; // Ensures 4-digit format
    }
    
    public string GetPurchaseVno(long BranchId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"P{BranchId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetSaleVno(long BranchId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"S{BranchId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetPatientId(long BranchId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"P{BranchId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetOPDVNo(long ClinicId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"VNo{ClinicId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetLabVoucherVno(long ClinicId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"L{ClinicId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }
}