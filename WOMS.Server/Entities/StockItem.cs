using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("ItemCode", "BranchId")]
[Table("StockItem")]
public partial class StockItem
{
    [Key]
    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    [Key]
    public long BranchId { get; set; }

    [StringLength(200)]
    public string? ItemName { get; set; }

    [StringLength(500)]
    public string? ChemicalName { get; set; }

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

    public bool Status { get; set; }

    public string? Remark { get; set; }
}
