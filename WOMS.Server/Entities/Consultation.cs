using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Table("Consultation")]
public partial class Consultation
{
    [Key]
    public long ConsultationId { get; set; }

    public long MedicalRecordId { get; set; }

    public long DoctorId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime ConsultationDate { get; set; }

    [StringLength(20)]
    public string? BloodPressure { get; set; }

    [Column(TypeName = "decimal(4, 1)")]
    public decimal? Temperature { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Weight { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Height { get; set; }

    public int? Pulse { get; set; }

    public string? Symptoms { get; set; }

    public string? ClinicalFindings { get; set; }

    public string? Assessment { get; set; }

    public string? PlanToDo { get; set; }

    public DateOnly? FollowUpDate { get; set; }

    public byte Status { get; set; }

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

    [StringLength(250)]
    public string? Remark { get; set; }
}
