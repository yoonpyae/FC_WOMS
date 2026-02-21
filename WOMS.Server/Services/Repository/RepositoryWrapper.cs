using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage;

namespace WOMS.Server.Services.Repository
{
    public class RepositoryWrapper(
        WOMSDbContext context,
        ILogger<RepositoryWrapper> logger,
        IHttpContextAccessor accessor,
        IConfiguration configuration) : IRepositoryWrapper
    {
        private readonly ILogger<RepositoryWrapper> _logger = logger ?? throw new Exception("Logger is null");
        private readonly IHttpContextAccessor _accessor = accessor ?? throw new Exception("Http Context is null");
        private readonly IConfiguration _configuration = configuration ?? throw new Exception("Configuration is null");

        #region Tables Variables

        private IAspNetUserRepo? _aspNetUser;
        private IAspNetRoleRepo? _aspNetRole;
        private ITokenClaimRepo? _tokenClaim;
        private IStateRepo? _state;
        private ITownshipRepo? _township;
        private IBranchRepo? _branch;
        private ISupplierRepo? _supplier;
        private IPacketTypeRepo? _packetType;
        private IMainStockRepo? _mainStock;
        private IStockItemRepo? _stockItem;
        private IDoctorRepo? _doctor;
        private IDoctorScheduleRepo? _doctorSchedule;
        private IPurchaseRepo? _purchase;
        private IPurchaseDetailRepo? _purchaseDetail;
        private IPharmacyVoucherRepo? _pharmacyVoucher;
        private IPharmacyVoucherDetailRepo? _pharmacyVoucherDetail;
        private IPatientRepo? _patient;
        private IAppointmentRepo? _appointment;
        private IConsultationRepo? _consultation;
        private IPrescriptionRepo? _prescription;
        private IPrescriptionItemRepo? _prescriptionItem;

        #endregion

        #region View Variables
        private IViMainStockRepo? _viMainStock;
        private IViPurchaseRepo? _viPurchase;
        private IViPurchaseDetailRepo? _viPurchaseDetail;
        private IViPharmacyVoucherRepo? _viPharmacyVoucher;
        private IViPharmacyVoucherDetailRepo? _viPharmacyVoucherDetail;
        private IViPatientRepo? _viPatient;
        private IViAppointmentRepo? _viAppointment;
        private IVISupplierRepo? _viSupplier;
        private IViConsultationRepo? _viConsultation;
        private IViPrescriptionRepo? _viPrescription;
        private IViPrescriptionItemRepo? _viPrescriptionItem;

        #endregion


        #region Tables Properties

        public IAspNetUserRepo AspNetUsers
        {
            get
            {
                _aspNetUser ??= new AspNetUserRepo(Context);
                return _aspNetUser;
            }
        }

        public IAspNetRoleRepo AspNetRoles
        {
            get
            {
                _aspNetRole ??= new AspNetRoleRepo(Context);
                return _aspNetRole;
            }
        }


        public ITokenClaimRepo TokenClaims
        {
            get
            {
                _tokenClaim ??= new TokenClaimRepo(Context);
                return _tokenClaim;
            }
        }

        public IStateRepo States
        {
            get
            {
                _state ??= new StateRepo(Context);
                return _state;
            }
        }

        public ITownshipRepo Townships
        {
            get
            {
                _township ??= new TownshipRepo(Context);
                return _township;
            }
        }

        public IBranchRepo Branches
        {
            get
            {
                _branch ??= new BranchRepo(Context);
                return _branch;
            }
        }

        public ISupplierRepo Suppliers
        {
            get
            {
                _supplier ??= new SupplierRepo(Context);
                return _supplier;
            }
        }

        public IPacketTypeRepo PacketTypes
        {
            get
            {
                _packetType ??= new PacketTypeRepo(Context);
                return _packetType;
            }
        }

        public IMainStockRepo MainStocks
        {
            get
            {
                _mainStock ??= new MainStockRepo(Context);
                return _mainStock;
            }
        }

        public IStockItemRepo StockItems
        {
            get
            {
                _stockItem ??= new StockItemRepo(Context);
                return _stockItem;
            }
        }

        public IDoctorRepo Doctors
        {
            get
            {
                _doctor ??= new DoctorRepo(Context);
                return _doctor;
            }
        }

        public IDoctorScheduleRepo DoctorSchedules
        {
            get
            {
                _doctorSchedule ??= new DoctorScheduleRepo(Context);
                return _doctorSchedule;
            }
        }


        public IPurchaseRepo Purchases
        {
            get
            {
                _purchase ??= new PurchaseRepo(Context);
                return _purchase;
            }
        }

        public IPurchaseDetailRepo PurchaseDetails
        {
            get
            {
                _purchaseDetail ??= new PurchaseDetailRepo(Context);
                return _purchaseDetail;
            }
        }

        public IPharmacyVoucherRepo PharmacyVouchers
        {
            get
            {
                _pharmacyVoucher ??= new PharmacyVoucherRepo(Context);
                return _pharmacyVoucher;
            }
        }

        public IPharmacyVoucherDetailRepo PharmacyVoucherDetails
        {
            get
            {
                _pharmacyVoucherDetail ??= new PharmacyVoucherDetailRepo(Context);
                return _pharmacyVoucherDetail;
            }
        }

        public IPatientRepo Patients
        {
            get
            {
                _patient ??= new PatientRepo(Context);
                return _patient;
            }
        }

        public IAppointmentRepo Appointments
        {
            get
            {
                _appointment ??= new AppointmentRepo(Context);
                return _appointment;
            }
        }

        public IConsultationRepo Consultations
        {
            get
            {
                _consultation ??= new ConsultationRepo(Context);
                return _consultation;
            }
        }

        public IPrescriptionRepo Prescriptions
        {
            get
            {
                _prescription ??= new PrescriptionRepo(Context);
                return _prescription;
            }
        }

        public IPrescriptionItemRepo PrescriptionItems
        {
            get
            {
                _prescriptionItem ??= new PrescriptionItemRepo(Context);
                return _prescriptionItem;
            }
        }
        #endregion

        #region View Properties

        public IViMainStockRepo ViMainStocks
        {
            get
            {
                _viMainStock ??= new ViMainStockRepo(Context);
                return _viMainStock;
            }
        }

        public IViPurchaseRepo ViPurchases
        {
            get
            {
                _viPurchase ??= new ViPurchaseRepo(Context);
                return _viPurchase;
            }
        }

        public IViPurchaseDetailRepo ViPurchaseDetails
        {
            get
            {
                _viPurchaseDetail ??= new ViPurchaseDetailRepo(Context);
                return _viPurchaseDetail;
            }
        }

        public IViPharmacyVoucherRepo ViPharmacyVouchers
        {
            get
            {
                _viPharmacyVoucher ??= new ViPharmacyVoucherRepo(Context);
                return _viPharmacyVoucher;
            }
        }

        public IViPharmacyVoucherDetailRepo ViPharmacyVoucherDetails
        {
            get
            {
                _viPharmacyVoucherDetail ??= new ViPharmacyVoucherDetailRepo(Context);
                return _viPharmacyVoucherDetail;
            }
        }

        public IViPatientRepo ViPatients
        {
            get
            {
                _viPatient ??= new ViPatientRepo(Context);
                return _viPatient;
            }
        }

        public IViAppointmentRepo ViAppointments
        {
            get
            {
                _viAppointment ??= new ViAppointmentRepo(Context);
                return _viAppointment;
            }
        }

        public IVISupplierRepo ViSuppliers
        {
            get
            {
                _viSupplier ??= new ViSupplierRepo(Context);
                return _viSupplier;
            }
        }

        public IViConsultationRepo ViConsultations
        {
            get
            {
                _viConsultation ??= new ViConsultationRepo(Context);
                return _viConsultation;
            }
        }

        public IViPrescriptionRepo ViPrescriptions
        {
            get
            {
                _viPrescription ??= new ViPrescriptionRepo(Context);
                return _viPrescription;
            }
        }

        public IViPrescriptionItemRepo ViPrescriptionItems
        {
            get
            {
                _viPrescriptionItem ??= new ViPrescriptionItemRepo(Context);
                return _viPrescriptionItem;
            }
        }
        #endregion

        #region General Methods

        public WOMSDbContext Context { get; } = context ?? throw new Exception();


        // Db Action without Async
        public void Save()
        {
            LogChangesStates(Context.ChangeTracker);
            _ = Context.SaveChanges();
        }

        // Db Action with Async
        public async Task<bool> SaveAsync()
        {
            Context.ChangeTracker.AutoDetectChangesEnabled = true;
            Context.ChangeTracker.DetectChanges();
            // Before (Only Modified and Deleted State)
            LogChangesStates(Context.ChangeTracker);
            int res = await Context.SaveChangesAsync();
            return res > 0;
        }

        public async Task<bool> ExecuteRawAsync(string formattedSql)
        {
            return await Context.Database.ExecuteSqlRawAsync(formattedSql) > 0;
        }

        private void LogChangesStates(ChangeTracker tracker)
        {
            string? authorization = _accessor.HttpContext?.Request.Headers.Authorization.ToString();
            if (authorization == null || string.IsNullOrEmpty(authorization) || authorization.Contains("undefined") ||
                authorization.Contains("null"))
            {
                return;
            }

            string? accesstoken = _accessor.HttpContext?.Request.Headers.Authorization[0]?.Split(' ')[1];
            _ = GetPrincipalFromExpiredToken(accesstoken ?? string.Empty).Identity?.Name;
            string[] ExcludedTrackingTables = { "NotificationToken", "TokenClaim", "ActivityChange", "Permission" };
            List<EntityEntry> entries = tracker.Entries().ToList();

            lock (entries)
            {
                foreach (EntityEntry entry in entries)
                {
                    if (ExcludedTrackingTables.Contains(entry.Entity.GetType().Name))
                    {
                        continue;
                    }

                    _logger.LogInformation("Entity: {entName}, State: {entState}", entry.Entity.GetType().Name,
                        entry.State);

                    if (entry.State is EntityState.Modified)
                    {
                        StringBuilder stringBuilder = new(entry.DebugView.ShortView + "\n\n");
                        foreach (Microsoft.EntityFrameworkCore.Metadata.IProperty prop in entry.OriginalValues
                                     .Properties)
                        {
                            string? originalValue = entry.OriginalValues[prop]?.ToString();
                            string? currentValue = entry.CurrentValues[prop]?.ToString();
                            if (originalValue != currentValue) //Only create a log if the value changes
                            {
                                _ = stringBuilder.Append($"{prop.Name}: {currentValue} Originally {originalValue}\n");
                                _logger.LogInformation("{propName}:  {ModifiedValue} Originally {OriginValue}",
                                    prop.Name, originalValue,
                                    currentValue);
                            }
                        }

                        // TODO: Database changes tracking table
                        // PosActivityChange changes = new()
                        // {
                        //     Title = entry.Entity.GetType().Name,
                        //     ChangesOn = DateTime.Now,
                        //     Changes = stringBuilder.ToString(),
                        //     ChangesBy = userId,
                        //     ChangesState = entry.State.ToString()
                        // };
                        // _ = Context.PosActivityChanges.Add(changes);
                    }
                }
            }
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string access_token)
        {
            TokenValidationParameters tokenValidationParameters = new()
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"] ?? "")),
                ValidateLifetime = false,
            };

            JwtSecurityTokenHandler tokenHandler = new();
            ClaimsPrincipal principal =
                tokenHandler.ValidateToken(access_token, tokenValidationParameters, out SecurityToken securityToken);
            return securityToken is not JwtSecurityToken jwtSecurityToken ||
                   !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                       StringComparison.InvariantCultureIgnoreCase)
                ? throw new SecurityTokenException("Invalid token")
                : principal;
        }

        public IDbContextTransaction TransactionBegin()
        {
            return Context.Database.BeginTransaction();
        }

        public async Task<IDbContextTransaction> TransactionBeginAsync()
        {
            return await Context.Database.BeginTransactionAsync();
        }

        #endregion
    }
}