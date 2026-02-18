using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("PrescriptionId", "ConsultationId")]
[Table("Prescription")]
public partial class Prescription
{
    [Key]
    public long PrescriptionId { get; set; }

    [Key]
    [StringLength(20)]
    public string ConsultationId { get; set; } = null!;

    public long BranchId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? Date { get; set; }

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

    public bool Status { get; set; }
}
