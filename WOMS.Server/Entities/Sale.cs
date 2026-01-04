using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("SaleVno", "BranchId")]
[Table("Sale")]
public partial class Sale
{
    [Key]
    [Column("SaleVNo")]
    [StringLength(50)]
    public string SaleVno { get; set; } = null!;

    [Key]
    public long BranchId { get; set; }

    [Column("ManualVNO")]
    [StringLength(50)]
    public string? ManualVno { get; set; }

    public long? PatientId { get; set; }

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
