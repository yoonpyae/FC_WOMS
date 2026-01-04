using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("PurchaseVno", "ItemCode", "TypeCode")]
[Table("PurchaseDetail")]
public partial class PurchaseDetail
{
    [Key]
    [Column("PurchaseVNo")]
    [StringLength(50)]
    public string PurchaseVno { get; set; } = null!;

    [Key]
    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    [Key]
    public long TypeCode { get; set; }

    public int Qty { get; set; }

    public double Price { get; set; }

    public DateOnly ExpireDate { get; set; }
}
