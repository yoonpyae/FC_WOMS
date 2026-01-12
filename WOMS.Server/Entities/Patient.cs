using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("PatientId", "BranchId")]
[Table("Patient")]
public partial class Patient
{
    [Key]
    [StringLength(20)]
    public string PatientId { get; set; } = null!;

    [Key]
    public long BranchId { get; set; }

    public long? DoctorId { get; set; }

    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Column("NRC")]
    [StringLength(50)]
    public string? Nrc { get; set; }

    [Column("DOB")]
    public DateOnly? Dob { get; set; }

    [StringLength(7)]
    public string? Sex { get; set; }

    [StringLength(50)]
    public string? Age { get; set; }

    public int? StateId { get; set; }

    public int? TownshipId { get; set; }

    [StringLength(500)]
    public string? AddressDetail { get; set; }

    [StringLength(50)]
    public string Phone { get; set; } = null!;

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
}
