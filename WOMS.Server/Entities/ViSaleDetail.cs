using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViSaleDetail
{
    [Column("SaleVNo")]
    [StringLength(50)]
    public string SaleVno { get; set; } = null!;

    public long BranchId { get; set; }

    [Column("ManualVNO")]
    [StringLength(50)]
    public string? ManualVno { get; set; }

    public long? PatientId { get; set; }

    [StringLength(200)]
    public string PatientName { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? SaleDate { get; set; }

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
