using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Bmp;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using WOMS.Server.Interfaces;

namespace WOMS.Server.Services
{
    public class FileService(
        ILogger<FileService> logger, 
        IConfiguration configuration) : IFileService
    {
        public bool FileDelete(string path)
        {
            FileInfo file = new(path);
            if (file.Exists) //check file exsit or not 
            {
                file.Delete();
                return true;
            }
            else
            {
                return false;
            }
        }

        public async Task<bool> WriteImage(IFormFile file, string name, string folder)
        {
            try
            {
                #region Path Built

                string pathBuilt = Path.Combine(configuration.GetSection("Application_Path").Value ?? "", $"wwwroot/images/{folder}/");

                if (!Directory.Exists(pathBuilt))
                {
                    _ = Directory.CreateDirectory(pathBuilt);
                }

                #endregion

                string extension = ("." + file.FileName.Split('.')[^1]).ToLower();
                string path = pathBuilt + name + extension;

                bool result = await CompressAndSaveImage(file, path, 30);

                //using (FileStream stream = new(path, FileMode.Create))
                //{
                //    await file.CopyToAsync(stream);
                //}

                logger.LogInformation("Image Write Successfully [Route:wwwroot/images/{folder}/{name}]", folder, name);

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError("{message}", ex.Message);
                return false;
            }
        }
        
        public async Task<bool> WriteFile(IFormFile? file, string name, string folder)
        {
            try
            {
                #region Path Built

                string pathBuilt = Path.Combine(configuration.GetSection("Application_Path").Value ?? "", $"wwwroot/files/{folder}/");

                if (!Directory.Exists(pathBuilt))
                {
                    _ = Directory.CreateDirectory(pathBuilt);
                }

                #endregion

                string extension = ("." + file?.FileName.Split('.')[^1]).ToLower();
                string path = pathBuilt + name + extension;

                await using (FileStream stream = new(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                logger.LogInformation("Image Write Successfully [Route:wwwroot/files/{folder}/{name}]", folder, name);

                return true;
            }
            catch (Exception ex)
            {
                logger.LogError("{message}", ex.Message);
                return false;
            }
        }
        
        private async Task<bool> CompressAndSaveImage(IFormFile file, string outputPath, int quality)
        {
            try
            {
                if (file.Length == 0)
                    return false;

                string extension = Path.GetExtension(outputPath).ToLower(); // Get target file extension

                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream); // Copy file to memory first
                memoryStream.Position = 0; // Reset position for reading

                using var image = await SixLabors.ImageSharp.Image.LoadAsync(memoryStream);
                await using var outputStream = new FileStream(outputPath, FileMode.Create, FileAccess.Write);
                // Determine the encoder based on the file extension
                IImageEncoder encoder = extension switch
                {
                    ".jpg" or ".jpeg" => new JpegEncoder { Quality = quality },
                    ".png" => new PngEncoder { CompressionLevel = PngCompressionLevel.DefaultCompression },
                    ".gif" => new GifEncoder(),
                    ".bmp" => new BmpEncoder(),
                    _ => throw new NotSupportedException($"The file extension '{extension}' is not supported."),
                };

                // Save the compressed image to the file
                await image.SaveAsync(outputStream, encoder);
                logger.LogInformation("Image saved at: {outputPath}", outputPath);

                return true;
            }
            catch (Exception ex)
            {
                logger.LogError("[Image Compress Error]: {message}", ex.Message);
                return false;
            }
        }
        
        private static async Task<bool> CompressAndSaveBase64Image(string base64String, string outputPath, int quality = 75)
        {
            try
            {
                // Convert Base64 to byte array
                byte[] imageBytes = Convert.FromBase64String(base64String);
                string extension = Path.GetExtension(outputPath).ToLower(); // Get file extension

                using (var ms = new MemoryStream(imageBytes))
                using (SixLabors.ImageSharp.Image image = SixLabors.ImageSharp.Image.Load(ms))
                {
                    // Determine the encoder based on the file extension
                    IImageEncoder encoder = extension switch
                    {
                        ".jpg" or ".jpeg" => new JpegEncoder { Quality = quality },
                        ".png" => new PngEncoder { CompressionLevel = PngCompressionLevel.DefaultCompression },
                        ".gif" => new GifEncoder(),
                        ".bmp" => new BmpEncoder(),
                        _ => throw new NotSupportedException($"The file extension '{extension}' is not supported."),
                    };

                    // Save the compressed image with the appropriate encoder
                    await using var outputStream = new FileStream(outputPath, FileMode.Create, FileAccess.Write);

                    await image.SaveAsync(outputStream, encoder);
                }

                Console.WriteLine($"Image saved at: {outputPath}");

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return false;
            }
        }

      
    }
}
