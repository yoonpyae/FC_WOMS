using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using WOMS.Server.Entities;

namespace WOMS.Server.Data;

public partial class WOMSDbContext : DbContext
{
    public WOMSDbContext(DbContextOptions<WOMSDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Appointment> Appointments { get; set; }

    public virtual DbSet<AspNetRole> AspNetRoles { get; set; }

    public virtual DbSet<AspNetRoleClaim> AspNetRoleClaims { get; set; }

    public virtual DbSet<AspNetUser> AspNetUsers { get; set; }

    public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }

    public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }

    public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; }

    public virtual DbSet<Branch> Branches { get; set; }

    public virtual DbSet<Consultation> Consultations { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<DoctorSchedule> DoctorSchedules { get; set; }

    public virtual DbSet<MainStock> MainStocks { get; set; }

    public virtual DbSet<OPDVoucher> OPDVouchers { get; set; }

    public virtual DbSet<OPDVoucherItem> OPDVoucherItems { get; set; }

    public virtual DbSet<PacketType> PacketTypes { get; set; }

    public virtual DbSet<Patient> Patients { get; set; }

    public virtual DbSet<PharmacyVoucher> PharmacyVouchers { get; set; }

    public virtual DbSet<PharmacyVoucherDetail> PharmacyVoucherDetails { get; set; }

    public virtual DbSet<Prescription> Prescriptions { get; set; }

    public virtual DbSet<Purchase> Purchases { get; set; }

    public virtual DbSet<PurchaseDetail> PurchaseDetails { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<State> States { get; set; }

    public virtual DbSet<StockItem> StockItems { get; set; }

    public virtual DbSet<Supplier> Suppliers { get; set; }

    public virtual DbSet<TokenClaim> TokenClaims { get; set; }

    public virtual DbSet<Township> Townships { get; set; }

    public virtual DbSet<ViAppointment> ViAppointments { get; set; }

    public virtual DbSet<ViConsultation> ViConsultations { get; set; }

    public virtual DbSet<ViMainStock> ViMainStocks { get; set; }

    public virtual DbSet<ViOPDVoucher> ViOPDVouchers { get; set; }

    public virtual DbSet<ViOPDVoucherItem> ViOPDVoucherItems { get; set; }

    public virtual DbSet<ViPatient> ViPatients { get; set; }

    public virtual DbSet<ViPharmacyVoucher> ViPharmacyVouchers { get; set; }

    public virtual DbSet<ViPharmacyVoucherDetail> ViPharmacyVoucherDetails { get; set; }

    public virtual DbSet<ViPrescription> ViPrescriptions { get; set; }

    public virtual DbSet<ViPurchase> ViPurchases { get; set; }

    public virtual DbSet<ViPurchaseDetail> ViPurchaseDetails { get; set; }

    public virtual DbSet<ViSupplier> ViSuppliers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AspNetRole>(entity =>
        {
            entity.HasIndex(e => e.NormalizedName, "RoleNameIndex")
                .IsUnique()
                .HasFilter("([NormalizedName] IS NOT NULL)");
        });

        modelBuilder.Entity<AspNetUser>(entity =>
        {
            entity.HasIndex(e => e.NormalizedUserName, "UserNameIndex")
                .IsUnique()
                .HasFilter("([NormalizedUserName] IS NOT NULL)");

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "AspNetUserRole",
                    r => r.HasOne<AspNetRole>().WithMany().HasForeignKey("RoleId"),
                    l => l.HasOne<AspNetUser>().WithMany().HasForeignKey("UserId"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("AspNetUserRoles");
                        j.HasIndex(new[] { "RoleId" }, "IX_AspNetUserRoles_RoleId");
                    });
        });

        modelBuilder.Entity<Branch>(entity =>
        {
            entity.Property(e => e.BranchId).ValueGeneratedNever();
        });

        modelBuilder.Entity<Consultation>(entity =>
        {
            entity.HasKey(e => new { e.ConsultationId, e.BranchId }).HasName("PK__Consulta__5D014A98A4A2F895");

            entity.Property(e => e.CreatedOn).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasDefaultValueSql("((1))");
            entity.Property(e => e.VisitDate).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => new { e.DoctorId, e.BranchId }).HasName("PK_Doctor_1");
        });

        modelBuilder.Entity<MainStock>(entity =>
        {
            entity.HasKey(e => new { e.ItemCode, e.TypeCode }).HasName("PK_MainStock_1");

            entity.Property(e => e.BranchId).HasDefaultValue(1L);
        });

        modelBuilder.Entity<OPDVoucher>(entity =>
        {
            entity.Property(e => e.Status).IsFixedLength();
        });

        modelBuilder.Entity<PacketType>(entity =>
        {
            entity.HasKey(e => new { e.TypeCode, e.BranchId }).HasName("PK_PacketType_1");
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => new { e.PatientId, e.BranchId }).HasName("PK_Patient_1");
        });

        modelBuilder.Entity<PharmacyVoucher>(entity =>
        {
            entity.HasKey(e => new { e.Vno, e.BranchId }).HasName("PK_Sale");
        });

        modelBuilder.Entity<PharmacyVoucherDetail>(entity =>
        {
            entity.HasKey(e => new { e.Vno, e.ItemCode, e.TypeCode }).HasName("PK_SaleDetail");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.ServiceId).HasName("PK_LabService");

            entity.Property(e => e.ServiceId).ValueGeneratedNever();
        });

        modelBuilder.Entity<State>(entity =>
        {
            entity.Property(e => e.StateId).ValueGeneratedNever();
        });

        modelBuilder.Entity<StockItem>(entity =>
        {
            entity.HasKey(e => new { e.ItemCode, e.BranchId }).HasName("PK_StockItem_1");
        });

        modelBuilder.Entity<Township>(entity =>
        {
            entity.Property(e => e.TownshipId).ValueGeneratedNever();
        });

        modelBuilder.Entity<ViAppointment>(entity =>
        {
            entity.ToView("VI_Appointment");
        });

        modelBuilder.Entity<ViConsultation>(entity =>
        {
            entity.ToView("VI_Consultation");
        });

        modelBuilder.Entity<ViMainStock>(entity =>
        {
            entity.ToView("VI_MainStock");
        });

        modelBuilder.Entity<ViOPDVoucher>(entity =>
        {
            entity.ToView("VI_OPDVoucher");

            entity.Property(e => e.Status).IsFixedLength();
        });

        modelBuilder.Entity<ViOPDVoucherItem>(entity =>
        {
            entity.ToView("VI_OPDVucherItem");
        });

        modelBuilder.Entity<ViPatient>(entity =>
        {
            entity.ToView("VI_Patient");
        });

        modelBuilder.Entity<ViPharmacyVoucher>(entity =>
        {
            entity.ToView("VI_PharmacyVoucher");
        });

        modelBuilder.Entity<ViPharmacyVoucherDetail>(entity =>
        {
            entity.ToView("VI_PharmacyVoucherDetail");
        });

        modelBuilder.Entity<ViPrescription>(entity =>
        {
            entity.ToView("VI_Prescription");
        });

        modelBuilder.Entity<ViPurchase>(entity =>
        {
            entity.ToView("VI_Purchase");
        });

        modelBuilder.Entity<ViPurchaseDetail>(entity =>
        {
            entity.ToView("VI_PurchaseDetail");
        });

        modelBuilder.Entity<ViSupplier>(entity =>
        {
            entity.ToView("VI_Supplier");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
