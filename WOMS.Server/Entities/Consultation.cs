using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("ConsultationId", "BranchId")]
[Table("Consultation")]
public partial class Consultation
{
    [Key]
    [StringLength(20)]
    public string ConsultationId { get; set; } = null!;

    [Key]
    public long BranchId { get; set; }

    public long DoctorId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime VisitDate { get; set; }

    [StringLength(20)]
    public string? PatientId { get; set; }

    [Column("ANo")]
    public long? Ano { get; set; }

    public string? Symptoms { get; set; }

    public string? Diagnosis { get; set; }

    public string? Notes { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime? CreatedOn { get; set; }

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
}
