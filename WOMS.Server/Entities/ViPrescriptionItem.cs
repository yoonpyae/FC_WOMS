using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViPrescriptionItem
{
    public long PrescriptionId { get; set; }

    public long? Dosage { get; set; }

    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    public long? Frequency { get; set; }

    public long? Duration { get; set; }

    [StringLength(50)]
    public string? Instruction { get; set; }

    public long? Quantity { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedOn { get; set; }

    [StringLength(50)]
    public string? CreatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedOn { get; set; }

    [StringLength(50)]
    public string? UpdatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DeletedOn { get; set; }

    [StringLength(50)]
    public string? DeletedBy { get; set; }

    [StringLength(500)]
    public string? ChemicalName { get; set; }
}
