using System.Security.Cryptography;

namespace WOMS.Server.Services;

public class EncryptionService
{
    /// <summary>
    /// Encrypts a stream using AES encryption and encodes it in Base64.
    /// </summary>
    /// <param name="responseStream">The stream to be encrypted.</param>
    /// <returns>A CryptoStream containing the encrypted data.</returns>
    public static CryptoStream EncryptStream(Stream responseStream)
    {
        Aes aes = GetEncryptionAlgorithm();
        ToBase64Transform base64Transform = new();
        CryptoStream base64EncodedStream = new(responseStream, base64Transform, CryptoStreamMode.Write);
        ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        return new CryptoStream(base64EncodedStream, encryptor, CryptoStreamMode.Write);
    }

    /// <summary>
    /// Encrypts a plain text string using AES encryption.
    /// </summary>
    /// <param name="plainText">The plain text to encrypt.</param>
    /// <returns>A byte array containing the encrypted data.</returns>
    [Obsolete("This method is obsolete. Consider using EncryptStream for better security.")]
    public static byte[] Encrypt(string plainText)
    {
        using AesManaged aes = new();
        ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using MemoryStream ms = new();
        using CryptoStream cs = new(ms, encryptor, CryptoStreamMode.Write);
        using (StreamWriter sw = new(cs))
        {
            sw.Write(plainText);
        }

        return ms.ToArray();
    }

    /// <summary>
    /// Decrypts a stream encrypted using AES and Base64 encoding.
    /// </summary>
    /// <param name="cipherStream">The encrypted stream.</param>
    /// <returns>A CryptoStream containing the decrypted data.</returns>
    public static CryptoStream DecryptStream(Stream cipherStream)
    {
        Aes aes = GetEncryptionAlgorithm();
        FromBase64Transform base64Transform = new(FromBase64TransformMode.IgnoreWhiteSpaces);
        CryptoStream base64DecodedStream = new(cipherStream, base64Transform, CryptoStreamMode.Read);
        ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        return new CryptoStream(base64DecodedStream, decryptor, CryptoStreamMode.Read);
    }

    /// <summary>
    /// Decrypts a Base64-encoded AES-encrypted string.
    /// </summary>
    /// <param name="cipherText">The encrypted text in Base64 format.</param>
    /// <returns>The decrypted plain text string.</returns>
    public static string DecryptString(string cipherText)
    {
        Aes aes = GetEncryptionAlgorithm();
        byte[] buffer = Convert.FromBase64String(cipherText);
        using MemoryStream memoryStream = new(buffer);
        ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using CryptoStream cryptoStream = new(memoryStream, decryptor, CryptoStreamMode.Read);
        using StreamReader streamReader = new(cryptoStream);
        return streamReader.ReadToEnd();
    }



    /// <summary>
    /// Initializes and returns an AES encryption algorithm instance with a predefined key and IV.
    /// </summary>
    /// <returns>An initialized Aes instance.</returns>
    private static Aes GetEncryptionAlgorithm()
    {
        Aes aes = Aes.Create();
        byte[] secretKey = Encoding.UTF8.GetBytes("5171061885171061");
        byte[] initializationVector = Encoding.UTF8.GetBytes("5171061885171061");
        aes.Key = secretKey;
        aes.IV = initializationVector;
        return aes;
    }
}