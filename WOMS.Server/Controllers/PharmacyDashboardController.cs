namespace WOMS.Server.Controllers;

[Authorize]
[Route("api/pharmacy/dashboard")]
[ApiController]
public class PharmacyDashboardController(IRepositoryWrapper repo) : ControllerBase
{
    [HttpGet("kpis")]
    [EndpointSummary("Pharmacy KPIs")]
    [EndpointDescription("Gets high-level stock and sales KPIs for the Pharmacist Dashboard.")]
    public async Task<IActionResult> GetKpis([FromQuery] long branchId)
    {
        DateTime today = DateTime.Today;
        DateTime tomorrow = today.AddDays(1);

        IReadOnlyList<ViPharmacyVoucher>? pharmVouchers = await repo.ViPharmacyVouchers.GetAsync(x =>
            x.BranchId == branchId && x.Vdate >= today && x.Vdate < tomorrow && !x.DeletedOn.HasValue);

        double todaySales = pharmVouchers?.Sum(x => x.PaidAmount) ?? 0;

        IReadOnlyList<ViPurchase>? purchases = await repo.ViPurchases.GetAsync(x =>
            x.BranchId == branchId && x.PurchaseDate >= today && x.PurchaseDate < tomorrow && !x.DeletedOn.HasValue);

        double todayPurchases = purchases?.Sum(x => x.PayAmount) ?? 0;

        IReadOnlyList<ViMainStock>? mainStocks = await repo.ViMainStocks.GetAsync(x =>
            x.BranchId == branchId && !x.DeletedOn.HasValue);

        int lowStockCount = mainStocks?.Count(x => x.GroundBalance is > 0 and <= 100) ?? 0;
        int outOfStockCount = mainStocks?.Count(x => x.GroundBalance <= 0) ?? 0;

        return ResponseHelper.OK_Result(new
        {
            TodaySales = todaySales,
            TodayPurchases = todayPurchases,
            LowStockCount = lowStockCount,
            OutOfStockCount = outOfStockCount
        }, null);
    }

    [HttpGet("sales-chart")]
    [EndpointSummary("7-Day Pharmacy Sales")]
    [EndpointDescription("Gets daily pharmacy sales for the last 7 days.")]
    public async Task<IActionResult> GetSalesChart([FromQuery] long branchId)
    {
        DateTime startDate = DateTime.Today.AddDays(-6);
        DateTime endDate = DateTime.Today.AddDays(1);

        IReadOnlyList<ViPharmacyVoucher> pharmVouchers = await repo.ViPharmacyVouchers.GetAsync(x =>
            x.BranchId == branchId && x.Vdate >= startDate && x.Vdate < endDate && !x.DeletedOn.HasValue) ?? [];

        List<object> chartData = new();

        // Loop through the last 7 days to group income
        for (int i = 0; i < 7; i++)
        {
            DateTime targetDate = startDate.AddDays(i);

            double dailySales = pharmVouchers
                .Where(x => x.Vdate.HasValue && x.Vdate.Value.Date == targetDate.Date)
                .Sum(x => x.PaidAmount);

            chartData.Add(new
            {
                Date = targetDate.ToString("MMM dd"),
                Sales = dailySales
            });
        }

        return ResponseHelper.OK_Result(chartData, null);
    }
}