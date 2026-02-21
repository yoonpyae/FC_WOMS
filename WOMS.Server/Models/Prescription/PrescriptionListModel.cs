namespace WOMS.Server.Models.Prescription
{
    public class PrescriptionListModel:ViPrescription
    {
        public List<ViPrescriptionItem> Details { get; set; } = null!;
    }
}
