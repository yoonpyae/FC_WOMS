using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Table("MedicalRecord")]
public partial class MedicalRecord
{
    [Key]
    public long MedicalRecordId { get; set; }

    [StringLength(20)]
    public string PatientId { get; set; } = null!;

    [Column("DoctorID")]
    public long DoctorId { get; set; }

    public int BranchId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime RecordDate { get; set; }

    [StringLength(500)]
    public string? ChiefComplaint { get; set; }

    public string? HistoryOfPresentIllness { get; set; }

    public string? PastMedicalHistory { get; set; }

    [StringLength(500)]
    public string? AllergyHistory { get; set; }

    public string? Diagnosis { get; set; }

    public string? TreatmentPlan { get; set; }

    public string? Notes { get; set; }

    public byte Status { get; set; }

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

    [StringLength(250)]
    public string? Remark { get; set; }
}
