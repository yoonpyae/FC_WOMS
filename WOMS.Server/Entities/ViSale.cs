using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViSale
{
    [Column("SaleVNo")]
    [StringLength(50)]
    public string SaleVno { get; set; } = null!;

    public long BranchId { get; set; }

    [Column("ManualVNO")]
    [StringLength(50)]
    public string? ManualVno { get; set; }

    [Column("PatientID")]
    public long? PatientId { get; set; }

    [StringLength(200)]
    public string PatientName { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? SaleDate { get; set; }

    public double? TotalAmount { get; set; }

    public double? DiscountAmount { get; set; }

    public double? NetAmount { get; set; }

    [StringLength(50)]
    public string? PaymentType { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? PaidDate { get; set; }

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
}
