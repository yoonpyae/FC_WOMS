namespace WOMS.Server.Interfaces
{
    public interface IFileService
    {
        /// <summary>
        /// Write Image file with IFormFile from html input included compressing feature. Compress Size 40L
        /// </summary>
        /// <param name="file"></param>
        /// <param name="name"></param>
        /// <param name="folder"></param>
        /// <returns></returns>
        Task<bool> WriteImage(IFormFile file, string name, string folder);

        /// <summary>
        /// Write All File Extension not include compressing feature.
        /// </summary>
        /// <param name="file"></param>
        /// <param name="name"></param>
        /// <param name="folder"></param>
        /// <returns></returns>
        Task<bool> WriteFile(IFormFile? file, string name, string folder);

        bool FileDelete(string path);
    }
}
