using System;
using System.Diagnostics;
using Unity.VisualScripting;

public class UserData
{
    private static string[] _nftNames = { "Alien", "Neon", "Robot", "Rainbow", "Wanderer" };
    private static System.Collections.Generic.Dictionary<string, bool> _nfts = new System.Collections.Generic.Dictionary<string, bool>() {
        { "Alien", true },
        { "Neon", false },
        { "Robot", false },
        { "Rainbow", false },
        { "Wanderer", false}
    };

    public static string WalletAddress
    {
        get { return SuiWallet.ActiveWalletAddress; }
    }

    public static string UserName
    {
        get
        {
            return PlayerPrefsExtra.GetString("LoggedInUserName");
        }
        set
        {
            PlayerPrefsExtra.SetString("LoggedInUserName", value);
        }
    }

    public static int currentLevel
    {
        get
        {
            return PlayerPrefsExtra.GetInt("currentLevel", 0);
        }
        set
        {
            PlayerPrefsExtra.SetInt("currentLevel", value);
        }
    }

    public static string sessionID
    {
        get
        {
            return PlayerPrefsExtra.GetString("AuthsessionID");
        }
        set
        {
            PlayerPrefsExtra.SetString("AuthsessionID", value);
        }
    }

    public static int TokenBalance
    {
        get
        {
            return PlayerPrefsExtra.GetInt("tokenBalance", 0);
        }
        set
        {
            PlayerPrefsExtra.SetInt("tokenBalance", value);
        }
    }

    public static int BestScore
    {
        get
        {
            return PlayerPrefsExtra.GetInt("bestScore", 0);
        }
        set
        {
            PlayerPrefsExtra.SetInt("bestScore", value);
        }
    }

    public static int OwnedNftCount
    {
        get
        {
            int count = 0;
            foreach (string key in _nftNames)
            {
                if (_nfts[key])
                    count++;
            }
            return count;
        }
    }

    public static int SelectedNftIndex
    {
        get
        {
            return PlayerPrefsExtra.GetInt("selectedIndex");
        }
        set
        {
            if (value < 0)
                PlayerPrefsExtra.DeleteKey("selectedIndex");
            else
            {
                if (OwnsNft(value))
                {
                    PlayerPrefsExtra.SetInt("selectedIndex", value);
                }
                else
                {
                    if (OwnedNftCount > 0)
                    {
                        for (int n = _nftNames.Length - 1; n > 0; n--)
                        {
                            if (_nfts[_nftNames[n]])
                            {
                                PlayerPrefsExtra.SetInt("selectedIndex", n);
                            }
                        }
                    }
                }
            }
        }
    }

    public static string SelectedNftName
    {
        get
        {
            if (SelectedNftIndex >= 0)
            {
                return _nftNames[SelectedNftIndex];
            }
            return System.String.Empty;
        }
    }

    public static bool HasSelectedNft
    {
        get
        {
            if (OwnedNftCount == 0)
                return false;
            return PlayerPrefsExtra.HasKey("selectedIndex");
        }
    }

    public static void AddNft(string name)
    {
        if (_nfts.ContainsKey(name))
        {
            _nfts[name] = true;
        }
    }

    public static bool OwnsNft(string name)
    {
        return _nfts[name];
    }

    public static bool OwnsNft(int index)
    {
        if (index < 0 || index >= _nftNames.Length)
            return false;
        return OwnsNft(_nftNames[index]);
    }

    public static void ClearNfts()
    {
        foreach (string key in _nftNames)
        {
            if (key == "Alien")
            {
                _nfts[key] = true;
            }
            else
            {
                _nfts[key] = false;
            }
        }
    }

    public static void SetOwnedNfts(GetBeatsNftsResponseDto getNftsResponseDto)
    {
        ClearNfts();
        foreach (BeatsNftDto dto in getNftsResponseDto.nfts)
        {
            AddNft(dto.name);
        }

        //handle selected index 
        if (!PlayerPrefsExtra.HasKey("selectedIndex") && OwnedNftCount > 0)
        {
            SelectedNftIndex = 0;
        }

        //remove the selected index if no owned nfts
        if (OwnedNftCount == 0)
            SelectedNftIndex = -1;
    }
}