using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("Ano", "DoctorId", "AppointmentDate", "BranchId")]
[Table("Appointment")]
public partial class Appointment
{
    [Key]
    [Column("ANo")]
    public int Ano { get; set; }

    [Key]
    [Column("DoctorID")]
    public long DoctorId { get; set; }

    [StringLength(20)]
    public string? PatientId { get; set; }

    [Key]
    public DateOnly AppointmentDate { get; set; }

    [Key]
    public long BranchId { get; set; }

    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(50)]
    public string PhoneNo { get; set; } = null!;

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
