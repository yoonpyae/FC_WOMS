using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("PurchaseVno", "BranchId")]
[Table("Purchase")]
public partial class Purchase
{
    [Key]
    [Column("PurchaseVNo")]
    [StringLength(50)]
    public string PurchaseVno { get; set; } = null!;

    [Key]
    public long BranchId { get; set; }

    [Column("ManualVNO")]
    [StringLength(50)]
    public string? ManualVno { get; set; }

    [Column("SupplierID")]
    public long? SupplierId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? PurchaseDate { get; set; }

    public double? TotalAmount { get; set; }

    public double? DiscountAmount { get; set; }

    public double? NetAmount { get; set; }

    public double? PayAmount { get; set; }

    public double? LeftAmount { get; set; }

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

    [StringLength(10)]
    public string? Status { get; set; }

    public string? Remark { get; set; }
}
