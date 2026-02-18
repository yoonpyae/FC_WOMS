using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("ItemCode", "TypeCode")]
[Table("MainStock")]
public partial class MainStock
{
    [Key]
    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    [Key]
    public long TypeCode { get; set; }

    public long BranchId { get; set; }

    public double PurchasePrice { get; set; }

    public double AvgPrice { get; set; }

    public double SalePrice { get; set; }

    public double GroundBalance { get; set; }

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
