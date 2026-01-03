using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViMainStock
{
    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    [StringLength(200)]
    public string? ItemName { get; set; }

    [StringLength(500)]
    public string? ChemicalName { get; set; }

    public long TypeCode { get; set; }

    [StringLength(200)]
    public string? TypeName { get; set; }

    public long ClinicId { get; set; }

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
