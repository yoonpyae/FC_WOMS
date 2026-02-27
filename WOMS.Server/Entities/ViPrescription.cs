using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViPrescription
{
    public long PrescriptionId { get; set; }

    [StringLength(20)]
    public string ConsultationId { get; set; } = null!;

    public long BranchId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? Date { get; set; }

    [StringLength(200)]
    public string? DoctorName { get; set; }

    public long DoctorId { get; set; }

    [StringLength(5)]
    public string ItemCode { get; set; } = null!;

    public long? Dosage { get; set; }

    public long? Frequency { get; set; }

    public long? Duration { get; set; }

    public long? Quantity { get; set; }

    [StringLength(50)]
    public string? Instruction { get; set; }

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
