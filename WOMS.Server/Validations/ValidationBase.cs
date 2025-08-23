namespace WOMS.Server.Validations
{
	public class ValidationBase
	{
		public List<ValidationError>? Error { get; set; }
	}

	public class ValidationError(string field, string message)
	{
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string? Field { get; } = field != string.Empty ? field : null;
		[JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
		public string? Message { get; } = message;
	}
}
