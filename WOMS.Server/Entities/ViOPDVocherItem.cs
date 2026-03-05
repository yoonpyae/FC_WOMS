using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViOPDVoucherItem
{
    public double? ConsultantFee { get; set; }

    [StringLength(200)]
    public string? ServiceName { get; set; }

    public double? ServiceFee { get; set; }

    [Column("OPDVNo")]
    [StringLength(20)]
    public string Opdvno { get; set; } = null!;

    public long ServiceId { get; set; }

    [StringLength(20)]
    public string ConsultationId { get; set; } = null!;

    [StringLength(200)]
    public string? Result { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ResultDate { get; set; }

    public long? Quantity { get; set; }

    public double? UnitPrice { get; set; }

    public double? TotalItemAmount { get; set; }
}
