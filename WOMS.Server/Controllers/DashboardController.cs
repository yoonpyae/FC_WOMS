namespace WOMS.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class DashboardController(IRepositoryWrapper repo) : ControllerBase
{
    [HttpGet("kpis")]
    [EndpointSummary("Dashboard KPIs")]
    [EndpointDescription("Gets high-level KPIs for the Admin Dashboard.")]
    public async Task<IActionResult> GetKpis([FromQuery] long branchId)
    {
        DateTime today = DateTime.Today;
        DateTime tomorrow = today.AddDays(1);
        DateOnly todayDateOnly = DateOnly.FromDateTime(today);

        // 1. Today's Appointments
        IReadOnlyList<ViAppointment>? appointments = await repo.ViAppointments.GetAsync(x =>
            x.BranchId == branchId &&
            x.AppointmentDate == todayDateOnly &&
            !x.DeletedOn.HasValue);

        int appointmentsCount = appointments?.Count ?? 0;

        // 2. Today's Income (OPD + Pharmacy Paid Amounts)
        IReadOnlyList<ViOPDVoucher>? opdVouchers = await repo.ViOPDVouchers.GetAsync(x =>
            x.BranchId == branchId && x.Vdate >= today && x.Vdate < tomorrow && !x.DeletedOn.HasValue);
        IReadOnlyList<ViPharmacyVoucher>? pharmVouchers = await repo.ViPharmacyVouchers.GetAsync(x =>
            x.BranchId == branchId && x.Vdate >= today && x.Vdate < tomorrow && !x.DeletedOn.HasValue);

        // FIXED: Removed the internal ?? 0 since PaidAmount is a non-nullable double
        double todayIncome = (opdVouchers?.Sum(x => x.PaidAmount) ?? 0) +
                             (pharmVouchers?.Sum(x => x.PaidAmount) ?? 0);

        // 3. Today's Expenses (Purchases)
        IReadOnlyList<ViPurchase>? purchases = await repo.ViPurchases.GetAsync(x =>
            x.BranchId == branchId && x.PurchaseDate >= today && x.PurchaseDate < tomorrow && !x.DeletedOn.HasValue);

        // FIXED: Removed the internal ?? 0 since PayAmount is a non-nullable double
        double todayExpense = purchases?.Sum(x => x.PayAmount) ?? 0;

        // 4. Low Stock Alerts (Ground balance between 1 and 100)
        IReadOnlyList<ViMainStock>? mainStocks = await repo.ViMainStocks.GetAsync(x =>
            x.BranchId == branchId && !x.DeletedOn.HasValue && x.GroundBalance > 0 && x.GroundBalance <= 100);

        int lowStockCount = mainStocks?.Count ?? 0;

        return ResponseHelper.OK_Result(new
        {
            AppointmentsCount = appointmentsCount,
            TodayIncome = todayIncome,
            TodayExpense = todayExpense,
            LowStockCount = lowStockCount
        }, null);
    }

    [HttpGet("revenue-chart")]
    [EndpointSummary("7-Day Revenue")]
    [EndpointDescription("Gets daily income for the last 7 days.")]
    public async Task<IActionResult> GetRevenueChart([FromQuery] long branchId)
    {
        DateTime startDate = DateTime.Today.AddDays(-6);
        DateTime endDate = DateTime.Today.AddDays(1);

        IReadOnlyList<ViOPDVoucher> opdVouchers = await repo.ViOPDVouchers.GetAsync(x =>
            x.BranchId == branchId && x.Vdate >= startDate && x.Vdate < endDate && !x.DeletedOn.HasValue) ?? [];
        IReadOnlyList<ViPharmacyVoucher> pharmVouchers = await repo.ViPharmacyVouchers.GetAsync(x =>
            x.BranchId == branchId && x.Vdate >= startDate && x.Vdate < endDate && !x.DeletedOn.HasValue) ?? [];

        List<object> chartData = new();

        // Loop through the last 7 days to group income
        for (int i = 0; i < 7; i++)
        {
            DateTime targetDate = startDate.AddDays(i);

            // FIXED: Added .HasValue and .Value.Date to safely handle nullable DateTimes
            double opdDaily = opdVouchers
                .Where(x => x.Vdate.HasValue && x.Vdate.Value.Date == targetDate.Date)
                .Sum(x => x.PaidAmount);

            double pharmDaily = pharmVouchers
                .Where(x => x.Vdate.HasValue && x.Vdate.Value.Date == targetDate.Date)
                .Sum(x => x.PaidAmount);

            chartData.Add(new
            {
                Date = targetDate.ToString("MMM dd"),
                Income = opdDaily + pharmDaily
            });
        }

        return ResponseHelper.OK_Result(chartData, null);
    }
}