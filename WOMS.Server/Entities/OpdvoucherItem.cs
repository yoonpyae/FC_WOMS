using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("Opdvno", "ServiceId")]
[Table("OPDVoucherItem")]
public partial class OpdvoucherItem
{
    [Key]
    [Column("OPDVNo")]
    [StringLength(20)]
    public string Opdvno { get; set; } = null!;

    [Key]
    public long ServiceId { get; set; }

    [StringLength(200)]
    public string? Result { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ResultDate { get; set; }

    public long? Quantity { get; set; }

    public double? UnitPrice { get; set; }

    public double? Amount { get; set; }

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
}
