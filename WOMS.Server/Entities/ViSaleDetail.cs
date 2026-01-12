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

    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    [StringLength(200)]
    public string? ItemName { get; set; }

    public long TypeCode { get; set; }

    [StringLength(200)]
    public string? TypeName { get; set; }

    public int Qty { get; set; }

    public double Price { get; set; }

    public double Amount { get; set; }

    [StringLength(500)]
    public string? ChemicalName { get; set; }

    public int? Capacity { get; set; }
}
