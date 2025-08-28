using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WOMS.Server.Entities;

[Table("Clinic")]
public partial class Clinic
{
    [Key]
    public long ClinicId { get; set; }

    [StringLength(200)]
    public string? ClinicName { get; set; }

    [StringLength(100)]
    public string? ContantPerson { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(50)]
    public string? Phone { get; set; }

    [StringLength(50)]
    public string? Email { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }

    public long? PlanId { get; set; }

    public DateOnly? PlanExpireDate { get; set; }

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

    public bool? Status { get; set; }

    public string? Remark { get; set; }

    [InverseProperty("Clinic")]
    public virtual ICollection<Branch> Branches { get; set; } = new List<Branch>();
}
