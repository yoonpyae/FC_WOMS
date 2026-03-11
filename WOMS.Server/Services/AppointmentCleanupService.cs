namespace WOMS.Server.Services
{
    public class AppointmentCleanupService(IServiceProvider services) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (IServiceScope scope = services.CreateScope())
                {
                    IRepositoryWrapper repo = scope.ServiceProvider.GetRequiredService<IRepositoryWrapper>();

                    try
                    {
                        // 1. Permanent Deletion of old Cancelled appointments (Older than 1 week)
                        DateTime oneWeekAgo = DateTime.Now.AddDays(-7);
                        IReadOnlyList<Appointment>? expiredAppointments = await repo.Appointments.GetAsync(x =>
                            x.Status == "Cancelled" &&
                            x.UpdatedOn <= oneWeekAgo);

                        foreach (Appointment app in expiredAppointments)
                        {
                            repo.Appointments.Delete(app);
                        }

                        // 2. Auto-Cancel missed appointments from previous days
                        DateOnly yesterday = DateOnly.FromDateTime(DateTime.Today.AddDays(-1));
                        IReadOnlyList<Appointment>? missedAppointments = await repo.Appointments.GetAsync(x =>
                            x.AppointmentDate <= yesterday &&
                            x.Status != "Completed" &&
                            x.Status != "Cancelled");

                        foreach (Appointment app in missedAppointments)
                        {
                            app.Status = "Cancelled";
                            app.UpdatedOn = DateTime.Now;
                            app.UpdatedBy = "System_AutoCancel";
                            repo.Appointments.Update(app);
                        }

                        _ = await repo.SaveAsync();
                    }
                    catch (Exception)
                    {
                        // Log error here using a logger if available
                    }
                }

                // Wait for 24 hours before running again
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}