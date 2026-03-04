namespace WOMS.Server.Models.Consultation_Prescription
{
    public class ConsultationEntryModel
    {
        public Consultation Consultation { get; set; } = null!;
        public List<Prescription> Prescriptions { get; set; } = [];
    }
}
