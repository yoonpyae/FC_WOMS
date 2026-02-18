using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("Opdvno", "BranchId")]
[Table("OPDVoucher")]
public partial class Opdvoucher
{
    [Key]
    [Column("OPDVNo")]
    [StringLength(20)]
    public string Opdvno { get; set; } = null!;

    [Key]
    public long BranchId { get; set; }

    [StringLength(20)]
    public string? ConsultationId { get; set; }

    [StringLength(20)]
    public string? PatientId { get; set; }

    [Column("VDate", TypeName = "datetime")]
    public DateTime? Vdate { get; set; }

    public long? DoctorId { get; set; }

    public double TotalAmount { get; set; }

    public double DiscountAmount { get; set; }

    public double PaidAmount { get; set; }

    public double LeftAmount { get; set; }

    [StringLength(50)]
    public string PaymentType { get; set; } = null!;

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

    public string? Remark { get; set; }

    [StringLength(10)]
    public string? Status { get; set; }
}
