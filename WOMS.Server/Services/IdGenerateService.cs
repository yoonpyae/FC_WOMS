using WOMS.Server.Data;
using WOMS.Server.Interfaces;

namespace WOMS.Server.Services;

public class IdGenerateService(
    WOMSDbContext context,
    IRandomizer randomizer) : IIdGenerateService
{
    public async Task<string> GetItemCode(string Name, long HospitalId)
    {
        if (string.IsNullOrWhiteSpace(Name))
            throw new ArgumentException("Item name cannot be null or empty.", nameof(Name));

        char prefix = Name[0];

        List<string> items = await context.StockItems
            .AsNoTracking()
            .Where(x => x.HospitalId == HospitalId)
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
    
    public string GetPurchaseVno(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"P{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetStockIssueVno(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"I{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetDamageVno(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"D{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetOPDRegId(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"P{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetOPDVNo(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"VNo{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetAdmissionNo(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"ADM{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetLabVoucherVno(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"L{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetRoomBill(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"RVN{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }

    public string GetPharmacyVoucherVno(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"PVN{HospitalId}-", "ddMMyy"));
         return stringBuilder.ToString();
    }
    
    public string GetAdmissionVNo(long HospitalId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"AVN{HospitalId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }
}