using System.Data;

namespace WOMS.Server.Interfaces
{
    public interface IConvertion
    {
        public List<T> DataTableToList<T>(DataTable dt);
        public DataTable ListToDataTable<T>(IList<T> lst);

        public string GetFileExtension(string base64String)
        {
            string data = base64String[..5];

            return data.ToUpper() switch
            {
                "IVBOR" => ".png",
                "/9J/4" => ".jpg",
                "AAAAF" => ".mp4",
                "JVBER" => ".pdf",
                "AAABA" => ".ico",
                "UMFYI" => ".rar",
                "E1XYD" => ".rtf",
                "U1PKC" => ".txt",
                "UESDB" => ".docx",
                "0M8R4" => ".xls",
                "MQOWM" or "77U/M" => ".srt",
                _ => string.Empty,
            };
        }
        public List<T> DataTableAsEnumableToList<T>(DataTable dt);
        public List<dynamic> ConvertDataTableToDynamicList(DataTable dt);
    }
}