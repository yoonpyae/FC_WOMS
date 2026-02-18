using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[PrimaryKey("Ano", "ScheduleId", "AppointmentDate", "BranchId")]
[Table("Appointment")]
public partial class Appointment
{
    [Key]
    [Column("ANo")]
    public long Ano { get; set; }

    [Key]
    public long ScheduleId { get; set; }

    [StringLength(20)]
    public string? PatientId { get; set; }

    [Key]
    public DateOnly AppointmentDate { get; set; }

    [Key]
    public long BranchId { get; set; }

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

    [StringLength(20)]
    public string Status { get; set; } = null!;

    public string? Remark { get; set; }
}
