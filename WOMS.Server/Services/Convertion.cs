using System.ComponentModel;
using System.Data;
using System.Dynamic;
using System.Reflection;

namespace WOMS.Server.Services
{
    public class Convertion(ILogger<Convertion> logger) : IConvertion
    {
        #region Converter Datatable to List

        public List<T> DataTableToList<T>(DataTable dt)
        {
            List<T> data = [];
            foreach (DataRow row in dt.Rows)
            {
                T item = GetDataRowItem<T>(row);
                data.Add(item);
            }

            return data;
        }

        private static T GetDataRowItem<T>(DataRow dr)
        {
            Type temp = typeof(T);
            T obj = Activator.CreateInstance<T>();
            foreach (DataColumn column in dr.Table.Columns)
            {
                #region Old Code

                //foreach (PropertyInfo pro in temp.GetProperties())
                //{
                //    string propertName = pro.Name;
                //    string dbColumnName = column.ColumnName.Replace("_", "");
                //    if ((bool)StringExtensions.EqualsIgnoreCase(propertName, dbColumnName))
                //    {
                //        if (!dr[column.ColumnName].Equals(DBNull.Value))
                //        {
                //            pro.SetValue(obj, dr[column.ColumnName], null);
                //        }
                //        else
                //        {
                //            pro.SetValue(obj, null, null);
                //        }
                //    }
                //    else
                //    {
                //        continue;
                //    }
                //}

                #endregion

                PropertyInfo? prop = temp.GetProperties().FirstOrDefault(p
                    => string.Equals(p.Name, column.ColumnName.Replace("_", ""), StringComparison.CurrentCultureIgnoreCase));
                if (prop == null) continue;

                string dbColumnName = column.ColumnName.Replace("_", "").ToLower();
                if (prop.Name.ToLower(System.Globalization.CultureInfo.CurrentCulture).Equals(dbColumnName.ToLower()))
                {
                    prop.SetValue(obj, !dr[column.ColumnName].Equals(DBNull.Value) ? dr[column.ColumnName] : null, null);
                }
            }

            return obj;
        }

        public DataTable ListToDataTable<T>(IList<T> lst)
        {
            DataTable _dt = CreateTable<T>();

            Type entType = typeof(T);

            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(entType);
            foreach (T item in lst)
            {
                DataRow row = _dt.NewRow();
                foreach (PropertyDescriptor prop in properties)
                {
                    if (prop.PropertyType == typeof(decimal?) || prop.PropertyType == typeof(int?) ||
                        prop.PropertyType == typeof(Int64?))
                    {
                        row[prop.Name] = prop.GetValue(item) == null ? 0 : prop.GetValue(item);
                    }
                    else
                    {
                        row[prop.Name] = prop.GetValue(item);
                    }
                }

                _dt.Rows.Add(row);
            }

            return _dt;
        }

        private static DataTable CreateTable<T>()
        {
            Type entType = typeof(T);
            DataTable tbl = new("Temp");
            PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(entType);
            foreach (PropertyDescriptor prop in properties)
            {
                if (prop.PropertyType == typeof(decimal?))
                {
                    _ = tbl.Columns.Add(prop.Name, typeof(decimal));
                }
                else if (prop.PropertyType == typeof(int?))
                {
                    _ = tbl.Columns.Add(prop.Name, typeof(int));
                }
                else if (prop.PropertyType == typeof(Int64?))
                {
                    _ = tbl.Columns.Add(prop.Name, typeof(long));
                }
                else
                {
                    _ = tbl.Columns.Add(prop.Name, prop.PropertyType);
                }
            }

            return tbl;
        }

        public List<T> DataTableAsEnumableToList<T>(DataTable dt)
        {
            List<string> columnNames = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName).ToList();
            PropertyInfo[] properties = typeof(T).GetProperties();
            return dt.AsEnumerable().Select(row =>
            {
                T objT = Activator.CreateInstance<T>();
                foreach (PropertyInfo pro in properties)
                {
                    string res = columnNames.Single(c => c.Replace("_", "").ToLower() == pro.Name.ToLower());
                    if (!string.IsNullOrEmpty(res))
                    {
                        try
                        {
                            pro.SetValue(objT, row[res]);
                        }
                        catch (Exception ex)
                        {
                            logger.LogError($"Convert DataTable Failed : {ex.Message}");
                        }
                    }
                }

                return objT;
            }).ToList();
        }

        public List<dynamic> ConvertDataTableToDynamicList(DataTable dt)
        {
            List<dynamic> dynamicList = [];

            foreach (DataRow row in dt.Rows)
            {
                IDictionary<string, object?> item = new ExpandoObject();

                foreach (DataColumn col in dt.Columns)
                {
                    item.Add(col.ColumnName, row[col]);
                }

                dynamicList.Add(item);
            }

            return dynamicList;
        }

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

        #endregion
    }
}