using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViPurchaseDetail
{
    [Column("PurchaseVNo")]
    [StringLength(50)]
    public string PurchaseVno { get; set; } = null!;

    public long BranchId { get; set; }

    [Column("ManualVNO")]
    [StringLength(50)]
    public string? ManualVno { get; set; }

    [Column("SupplierID")]
    public long? SupplierId { get; set; }

    [StringLength(200)]
    public string? SupplierCompanyName { get; set; }

    [StringLength(200)]
    public string? SupplierName { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? PurchaseDate { get; set; }

    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    [StringLength(200)]
    public string? ItemName { get; set; }

    public long TypeCode { get; set; }

    [StringLength(200)]
    public string? TypeName { get; set; }

    public int Qty { get; set; }

    public double Price { get; set; }

    public DateOnly ExpireDate { get; set; }
}
