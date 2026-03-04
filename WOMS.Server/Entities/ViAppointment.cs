using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Keyless]
public partial class ViAppointment
{
    [Column("ANo")]
    public long Ano { get; set; }

    public long BranchId { get; set; }

    public DateOnly AppointmentDate { get; set; }

    [StringLength(20)]
    public string AppointmentStatus { get; set; } = null!;

    public string? AppointmentRemark { get; set; }

    [StringLength(200)]
    public string? PatientName { get; set; }

    [StringLength(50)]
    public string? PatientPhone { get; set; }

    [StringLength(50)]
    public string? DayOfWeek { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    [StringLength(200)]
    public string? DoctorName { get; set; }

    [StringLength(500)]
    public string? Specialized { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? CreatedOn { get; set; }

    [StringLength(256)]
    public string? CreatedBy { get; set; }

    public long ScheduleId { get; set; }

    [StringLength(20)]
    public string? PatientId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedOn { get; set; }

    [StringLength(256)]
    public string? UpdatedBy { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? DeletedOn { get; set; }

    [StringLength(256)]
    public string? DeletedBy { get; set; }

    public long? DoctorId { get; set; }
}
