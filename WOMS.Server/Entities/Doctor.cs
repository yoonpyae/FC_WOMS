using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace WOMS.Server.Entities;

[PrimaryKey("DoctorId", "BranchId")]
[Table("Doctor")]
[Index("Id", Name = "IX_Doctors_Id")]
public partial class Doctor
{
    [Key]
    public long DoctorId { get; set; }

    [Key]
    public long BranchId { get; set; }

    [StringLength(200)]
    public string? Name { get; set; }

    [StringLength(500)]
    public string? Degree { get; set; }

    [StringLength(500)]
    public string? Specialized { get; set; }

    [StringLength(200)]
    public string? Photo { get; set; }

    [StringLength(200)]
    public string? Sign { get; set; }

    public double? ConsultantFee { get; set; }

    [Column("ECGFee")]
    public double? Ecgfee { get; set; }

    [Column("XRayFee")]
    public double? XrayFee { get; set; }

    public double? UltrasoundFee { get; set; }

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

    public bool Status { get; set; }

    public string? Remark { get; set; }

    public string? Id { get; set; }

    [ForeignKey("Id")]
    [InverseProperty("Doctors")]
    [System.Text.Json.Serialization.JsonIgnore]
    public virtual AspNetUser? IdNavigation { get; set; }
}
