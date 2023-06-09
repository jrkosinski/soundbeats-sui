/*using Suinet.Wallet;
using UnityEngine;

/// <summary>
/// Simple wallet implementation. Uses PlayerPrefs as store.
/// </summary>
public class SuiWallet
{
    private const string MnemonicsKey = "MnemonicsKey";

    public static string GetActiveAddress()
    {
        var keypair = GetActiveKeyPair();
        if (keypair != null)
        {
            return keypair.PublicKeySuiAddress;
        }

        return "0x";
    }

    public static string CreateNewWallet()
    {
        var mnemo = Mnemonics.GenerateMnemonic();
        RestoreWalletFromMnemonics(mnemo);
        return mnemo;
    }

    public static bool RestoreWalletFromMnemonics(string mnemo)
    {
        if (!Mnemonics.ValidateMnemonic(mnemo)) return false;

        PlayerPrefs.SetString(MnemonicsKey, mnemo);
        PlayerPrefs.Save();
        return true;
    }

    public static Ed25519KeyPair GetActiveKeyPair()
    {
        if (PlayerPrefs.HasKey(MnemonicsKey))
        {
            var mnemo = PlayerPrefs.GetString(MnemonicsKey);
            return Mnemonics.GetKeypairFromMnemonic(mnemo);
        }

        return null;
    }

    public static void Logout()
    {
        PlayerPrefs.DeleteKey(MnemonicsKey);
        PlayerPrefs.Save();
    }
}
*/