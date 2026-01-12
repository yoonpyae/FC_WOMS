using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("SaleVno", "ItemCode", "TypeCode")]
[Table("SaleDetail")]
public partial class SaleDetail
{
    [Key]
    [Column("SaleVNo")]
    [StringLength(50)]
    public string SaleVno { get; set; } = null!;

    [Key]
    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    [Key]
    public long TypeCode { get; set; }

    public int Qty { get; set; }

    public double Price { get; set; }

    public double Amount { get; set; }
}
