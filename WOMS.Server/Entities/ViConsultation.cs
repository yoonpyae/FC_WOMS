using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViConsultation
{
    [StringLength(20)]
    public string ConsultationId { get; set; } = null!;

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

    [StringLength(200)]
    public string? DoctorName { get; set; }

    [StringLength(200)]
    public string PatientName { get; set; } = null!;
}
