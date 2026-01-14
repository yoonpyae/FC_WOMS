using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("Vno", "BranchId")]
[Table("PharmacyVoucher")]
public partial class PharmacyVoucher
{
    [Key]
    [Column("VNo")]
    [StringLength(50)]
    public string Vno { get; set; } = null!;

    [Key]
    public long BranchId { get; set; }

    [Column("ManualVNO")]
    [StringLength(50)]
    public string? ManualVno { get; set; }

    [StringLength(20)]
    public string? PatientId { get; set; }

    [Column("VDate", TypeName = "datetime")]
    public DateTime? Vdate { get; set; }

    public double TotalAmount { get; set; }

    public double DiscountAmount { get; set; }

    public double NetAmount { get; set; }

    public double PaidAmount { get; set; }

    public double LeftAmount { get; set; }

    [StringLength(50)]
    public string? PaymentType { get; set; }

    [StringLength(50)]
    public string? ProcessStatus { get; set; }

    [StringLength(256)]
    public string? IssuePerson { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? IssueDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedOn { get; set; }

    [StringLength(256)]
    public string? CreatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedOn { get; set; }

    [StringLength(256)]
    public string? UpdatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DeletedOn { get; set; }

    [StringLength(256)]
    public string? DeletedBy { get; set; }

    public bool? Status { get; set; }

    public string? Remark { get; set; }

    [Column("ReferDoctorID")]
    public long? ReferDoctorId { get; set; }
}
