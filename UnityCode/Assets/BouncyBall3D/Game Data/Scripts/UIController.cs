//FAKE_SIGNIN is for testing without a web front-end, or without a wallet (testing only)
#define FAKE_SIGNIN

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using TMPro;
using UnityEngine.UI;
using WalletConnectSharp.Common.Model.Errors;
using WalletConnectSharp.Common.Utils;
using WalletConnectSharp.Network.Models;
using WalletConnectUnity.Core;
using UnityEngine.Scripting;
using WalletConnectUnity.Modal;

public class UIController : MonoBehaviour
{
    private const int SIGNING_MESSAGE_LENGTH = 32;
    private static string MessageToSign = "";

    public static UIController instance;
    private void Awake()
    {
        instance = this;
        UserName.text = UserData.UserName;
    }

    #region UI Components 

    public Button NewWalletButton;
    public Button NFTButton;
    public Button WalletButton_Home;
    public Button Mint_Button_Anna;
    public Button Mint_Button_Marshmallow;
    public Button Mint_Button_Taral;
    public Button Mint_Button_Alien;
    public Button Mint_Button_Neon;
    public Button Mint_Button_Robot;
    public Button Mint_Button_Rainbow;

    public Button Mint_SuccessfulScreen_Close;
    public Button PlayButton;
    public Button MintNFTScreen_Button_Anna;
    public Button MintNFTScreen_Button_Marshmallow;
    public Button MintNFTScreen_Button_Taral;
    public Button MintNFTScreen_Button_Alien;
    public Button MintNFTScreen_Button_Neon;
    public Button MintNFTScreen_Button_Robot;
    public Button MintNFTScreen_Button_Rainbow;

    public Button MintNFTScreen_Button_Close;
    public Button ClaimTokens_Button;
    public Button Close_WalletScreen;
    public Button Close_LeaderboardScreen;
    public Button Close_ClaimTokens;
    public Button MintNFT_LinkButton;
    public Button WalletScreen_NFTAdd_Button;
    public Button ClaimScreen_NFTAdd_Button;
    public Button ConnectWalletButton;
    public Button onLogOutButton;
    public Button ImportWalletButton;


    public TMP_InputField NewWalletMnemonicsText;
    public TMP_InputField ActiveAddressText;
    public TextMeshProUGUI link_successful;
    public GameObject SuiWalletScreen;
    public GameObject HomeScreen;
    public GameObject PlaySongScreen;
    public GameObject WalletScreen;
    public GameObject LeaderboardScreen;
    public GameObject ClaimTokensScreen;
    public GameObject SelectCharacterScreen;
    public GameObject txtMintCharacter;

    public Sprite sprite_Pink;
    public Sprite sprite_Green;

    public GameObject Mint_SuccessfulScreen;
    public GameObject Mint_NFTScreen;

    public Image Mint_SuccessfulScreen_Image;
    public GameObject SelectCharacter_Overlay;

    public TMP_InputField UserName;

    public Sprite Character_Anna;
    public Sprite Character_Melloow;
    public Sprite Character_Taral;
    public Sprite Character_Alien;
    public Sprite Character_Neon;
    public Sprite Character_Robot;
    public Sprite Character_Rainbow;

    public TextMeshProUGUI txtAddressNFT_WalletScreen;
    public TextMeshProUGUI txtScore_WalletScreen;
    public TextMeshProUGUI txtScore_ClaimScreen;
    public TextMeshProUGUI txtAddressNFT_ClaimScreen;

    public GameObject LoadingScreen;
    public GameObject ErrorScreen;
    public TextMeshProUGUI txtError_ErrorScreen;

    public TextMeshProUGUI Mint_Text_Anna;
    public TextMeshProUGUI Mint_Text_Mellow;
    public TextMeshProUGUI Mint_Text_Taral;
    public TextMeshProUGUI Mint_Text_Alien;
    public TextMeshProUGUI Mint_Text_Neon;
    public TextMeshProUGUI Mint_Text_Robot;
    public TextMeshProUGUI Mint_Text_Rainbow;

    public TextMeshProUGUI MintNFTScreen_Text_Anna;
    public TextMeshProUGUI MintNFTScreen_Text_Mellow;
    public TextMeshProUGUI MintNFTScreen_Text_Taral;
    public TextMeshProUGUI MintNFTScreen_Text_Alien;
    public TextMeshProUGUI MintNFTScreen_Text_Neon;
    public TextMeshProUGUI MintNFTScreen_Text_Robot;
    public TextMeshProUGUI MintNFTScreen_Text_Rainbow;

    public TMP_InputField MnemonicsInputField;
    //public GameObject ImportWalletScreen; (no longer used)
    public GameObject blockImage;
    public GameObject setup1Panel;
    public GameObject setup2Panel;

    #endregion

#pragma warning disable 0414
    private bool isOverlayOn = true;
#pragma warning restore 0414
    private string NFTLinkAdd;
    private string NFTLinkText;
    private int NftMintCandidateIndex = 0;

    private class NftUiElements
    {
        public TextMeshProUGUI MintNftScreenText;
        public TextMeshProUGUI MintText;
        public Button MintButton;
        public Button MintNftScreenButton;
        public Sprite CharacterSprite;
        public Sprite SelectedSprite;
        public Sprite UnselectedSprite;
        public string Name;
        public string ImageUrl;
        public bool Locked;

        public void SetSelected(bool selected)
        {
            bool owned = UserData.OwnsNft(this.Name);
            this.MintNftScreenButton.GetComponent<Image>().sprite = selected && owned ? this.SelectedSprite : this.UnselectedSprite;
            this.MintButton.GetComponent<Image>().sprite = selected && owned ? this.SelectedSprite : this.UnselectedSprite;

            if (selected && owned)
            {
                this.MintNftScreenText.text = "Selected";
                this.MintText.text = "Selected";
            }
            else
            {
                if (this.Locked)
                {
                    if (owned)
                    {
                        this.MintNftScreenText.text = "NFT Owned";
                        this.MintText.text = "Select";
                    }
                    else
                    {
                        this.MintNftScreenText.text = "Locked";
                        this.MintText.text = "Locked";
                    }
                }
                else
                {
                    if (owned)
                    {
                        this.MintNftScreenText.text = "NFT Owned";
                        this.MintText.text = "Select";
                    }
                    else
                    {
                        this.MintNftScreenText.text = "Mint NFT";
                        this.MintText.text = "Mint NFT";
                    }
                }
            }
        }
    }

    private NftUiElements NftUiElements_Anna = new NftUiElements();
    //private NftUiElements NftUiElements_Marshmallow = new NftUiElements();
    //private NftUiElements NftUiElements_Taral = new NftUiElements();
    private NftUiElements NftUiElements_Alien = new NftUiElements();
    private NftUiElements NftUiElements_Neon = new NftUiElements();
    private NftUiElements NftUiElements_Robot = new NftUiElements();
    private NftUiElements NftUiElements_Rainbow = new NftUiElements();

    private List<NftUiElements> NftUiList = new List<NftUiElements>();

    private void Start()
    {
        this.NftUiList.Add(NftUiElements_Anna);
        //this.NftUiList.Add(NftUiElements_Marshmallow);
        //this.NftUiList.Add(NftUiElements_Taral);
        this.NftUiList.Add(NftUiElements_Alien);
        this.NftUiList.Add(NftUiElements_Neon);
        this.NftUiList.Add(NftUiElements_Robot);
        this.NftUiList.Add(NftUiElements_Rainbow);

        ActiveAddressText.text = SuiWallet.ActiveWalletAddress;
        NewWalletButton.gameObject.SetActive(false);

        ////group Anna elements together
        NftUiElements_Anna.MintNftScreenText = MintNFTScreen_Text_Anna;
        NftUiElements_Anna.MintText = Mint_Text_Anna;
        NftUiElements_Anna.MintButton = Mint_Button_Anna;
        NftUiElements_Anna.MintNftScreenButton = MintNFTScreen_Button_Anna;
        NftUiElements_Anna.CharacterSprite = Character_Anna;
        NftUiElements_Anna.Name = "Anna";
        NftUiElements_Anna.ImageUrl = GameData.NftImageUrlBase + "Anna.png";
        NftUiElements_Anna.SelectedSprite = sprite_Green;
        NftUiElements_Anna.UnselectedSprite = sprite_Pink;

        ////group Marshmallow elements together
        //NftUiElements_Marshmallow.MintNftScreenText = MintNFTScreen_Text_Mellow;
        //NftUiElements_Marshmallow.MintText = Mint_Text_Mellow;
        //NftUiElements_Marshmallow.MintButton = Mint_Button_Marshmallow;
        //NftUiElements_Marshmallow.MintNftScreenButton = MintNFTScreen_Button_Marshmallow;
        //NftUiElements_Marshmallow.CharacterSprite = Character_Melloow;
        //NftUiElements_Marshmallow.Name = "Melloow";
        //NftUiElements_Marshmallow.ImageUrl = GameData.NftImageUrlBase + "Melloow.png";
        //NftUiElements_Marshmallow.SelectedSprite = sprite_Green;
        //NftUiElements_Marshmallow.UnselectedSprite = sprite_Pink;

        ////group Taral elements together
        //NftUiElements_Taral.MintNftScreenText = MintNFTScreen_Text_Taral;
        //NftUiElements_Taral.MintText = Mint_Text_Taral;
        //NftUiElements_Taral.MintButton = Mint_Button_Taral;
        //NftUiElements_Taral.MintNftScreenButton = MintNFTScreen_Button_Taral;
        //NftUiElements_Taral.CharacterSprite = Character_Taral;
        //NftUiElements_Taral.Locked = true;
        //NftUiElements_Taral.Name = "Taral";
        //NftUiElements_Taral.ImageUrl = GameData.NftImageUrlBase + "Taral.png";
        //NftUiElements_Taral.SelectedSprite = sprite_Green;
        //NftUiElements_Taral.UnselectedSprite = sprite_Pink;

        //group Alien elements together
        NftUiElements_Alien.MintNftScreenText = MintNFTScreen_Text_Alien;
        NftUiElements_Alien.MintText = Mint_Text_Alien;
        NftUiElements_Alien.MintButton = Mint_Button_Alien;
        NftUiElements_Alien.MintNftScreenButton = MintNFTScreen_Button_Alien;
        NftUiElements_Alien.CharacterSprite = Character_Alien;
        NftUiElements_Alien.Locked = false;
        NftUiElements_Alien.Name = "Alien";
        NftUiElements_Alien.ImageUrl = GameData.NftImageUrlBase + "Alien.png";
        NftUiElements_Alien.SelectedSprite = sprite_Green;
        NftUiElements_Alien.UnselectedSprite = sprite_Pink;

        //group Neon elements together
        NftUiElements_Neon.MintNftScreenText = MintNFTScreen_Text_Neon;
        NftUiElements_Neon.MintText = Mint_Text_Neon;
        NftUiElements_Neon.MintButton = Mint_Button_Neon;
        NftUiElements_Neon.MintNftScreenButton = MintNFTScreen_Button_Neon;
        NftUiElements_Neon.CharacterSprite = Character_Neon;
        NftUiElements_Neon.Locked = false;
        NftUiElements_Neon.Name = "Neon";
        NftUiElements_Neon.ImageUrl = GameData.NftImageUrlBase + "Neon.png";
        NftUiElements_Neon.SelectedSprite = sprite_Green;
        NftUiElements_Neon.UnselectedSprite = sprite_Pink;

        //group Robot elements together
        NftUiElements_Robot.MintNftScreenText = MintNFTScreen_Text_Robot;
        NftUiElements_Robot.MintText = Mint_Text_Robot;
        NftUiElements_Robot.MintButton = Mint_Button_Robot;
        NftUiElements_Robot.MintNftScreenButton = MintNFTScreen_Button_Robot;
        NftUiElements_Robot.CharacterSprite = Character_Robot;
        NftUiElements_Robot.Locked = false;
        NftUiElements_Robot.Name = "Robot";
        NftUiElements_Robot.ImageUrl = GameData.NftImageUrlBase + "Robot.png";
        NftUiElements_Robot.SelectedSprite = sprite_Green;
        NftUiElements_Robot.UnselectedSprite = sprite_Pink;

        //group Rainbow elements together
        NftUiElements_Rainbow.MintNftScreenText = MintNFTScreen_Text_Rainbow;
        NftUiElements_Rainbow.MintText = Mint_Text_Rainbow;
        NftUiElements_Rainbow.MintButton = Mint_Button_Rainbow;
        NftUiElements_Rainbow.MintNftScreenButton = MintNFTScreen_Button_Rainbow;
        NftUiElements_Rainbow.CharacterSprite = Character_Rainbow;
        NftUiElements_Rainbow.Locked = false;
        NftUiElements_Rainbow.Name = "Rainbow";
        NftUiElements_Rainbow.ImageUrl = GameData.NftImageUrlBase + "Rainbow.png";
        NftUiElements_Rainbow.SelectedSprite = sprite_Green;
        NftUiElements_Rainbow.UnselectedSprite = sprite_Pink;

        //Connect Wallet (click connect button)
        ConnectWalletButton.onClick.AddListener(() =>
        {
            try
            {
                MessageToSign = GenerateRandomMessage();
                print(MessageToSign);
#if FAKE_SIGNIN
                //SignMessageCallback("AODvvPzbHqQOKnZBqz0+Km66s9TQNNTWtEawg8vQk+tT3k80aP+4mh+taz/+YqYYefPfnlOxNujyetqSWiR9+gKpKGbzUWas+HHgcEN+/d8Etd2QAQrAMMlRsEvIFejUHw==:0x94e666c0de3a5e3e2e730d40030d9ae5c5843c468ee23e49f4717a5cb8e57bfb");
                VerifySignatureResponseDto dto = new VerifySignatureResponseDto();
                dto.verified = true;
                dto.address = "0x0fc4a6096df7a66592ffcd6eedb8bc1965e110fa8d7c6d5aef1b70ebc7ab3938";
                dto.failureReason = "";
                this.OnSuccessfulVerifySignature(dto);
#else
                //CallSuiSignMessage(MessageToSign);
               OnPersonalSignButton();
#endif
            }
            catch (Exception e)
            {
                SuiWallet.ErrorMessage = e.ToString();
            }
        });

        //Log Out (click logout button)
        onLogOutButton.onClick.AddListener(() =>
        {
            WalletScreen.SetActive(false);
            HomeScreen.SetActive(false);
            SelectCharacterScreen.SetActive(false);
            PlaySongScreen.SetActive(false);

            //retain selected index 
            int selectedIndex = -1;

            string walletAddress = SuiWallet.ActiveWalletAddress;
            if (PlayerPrefsExtra.HasKey("selectedIndex"))
                selectedIndex = PlayerPrefsExtra.GetInt("selectedIndex");

            PlayerPrefs.DeleteAll();

            SuiWallet.ActiveWalletAddress = walletAddress;
            if (selectedIndex >= 0)
                PlayerPrefsExtra.SetInt("selectedIndex", selectedIndex);

            UserData.TokenBalance = 0;

            setup2Panel.SetActive(false);
            setup1Panel.SetActive(true);
            SuiWalletScreen.SetActive(true);
        });

        ///Home Screen
        NFTButton.onClick.AddListener(() =>
        {
            Mint_NFTScreen.SetActive(true);
        });

        //Wallet 
        WalletButton_Home.onClick.AddListener(() =>
        {
            if (SuiWallet.HasActiveAddress())
            {
                NetworkManager.Instance.GetTokenBalance(SuiWallet.ActiveWalletAddress, OnSuccessfulGetTokenBalance, OnErrorGetTokenBalance);
                LoadingScreen.SetActive(true);
            }
        });

        //Select Character Screen

        //Mint Anna 
        Mint_Button_Anna.onClick.AddListener(() =>
        {
            MintButtonClick(0);
        });

        //Mint Marshmallow 
        Mint_Button_Marshmallow.onClick.AddListener(() =>
        {
            MintButtonClick(1);
        });

        //Mint Taral 
        Mint_Button_Taral.onClick.AddListener(() =>
        {
            MintButtonClick(2);
        });

        //Mint Alien 
        Mint_Button_Alien.onClick.AddListener(() =>
        {
            MintButtonClick(0);
        });

        //Mint Neon
        Mint_Button_Neon.onClick.AddListener(() =>
        {
            MintButtonClick(1);
        });

        //Mint Robot
        Mint_Button_Robot.onClick.AddListener(() =>
        {
            MintButtonClick(2);
        });

        //Mint Rainbow
        Mint_Button_Rainbow.onClick.AddListener(() =>
        {
            MintButtonClick(3);
        });


        // Mint successful screen
        Mint_SuccessfulScreen_Close.onClick.AddListener(() =>
        {
            Mint_SuccessfulScreen.SetActive(false);
            Mint_NFTScreen.SetActive(false);
            SelectCharacter_Overlay.SetActive(false);
            txtMintCharacter.SetActive(false);
            isOverlayOn = false;
        });

        // Mint NFT Screen
        MintNFTScreen_Button_Anna.onClick.AddListener(() =>
        {
            MintNftScreenButtonClick(0);
        });

        MintNFTScreen_Button_Marshmallow.onClick.AddListener(() =>
        {
            MintNftScreenButtonClick(1);
        });

        MintNFTScreen_Button_Taral.onClick.AddListener(() =>
        {
            //MintNftScreenButtonClick(2);
        });

        MintNFTScreen_Button_Alien.onClick.AddListener(() =>
        {
            MintNftScreenButtonClick(0);
        });

        MintNFTScreen_Button_Neon.onClick.AddListener(() =>
        {
            MintNftScreenButtonClick(1);
        });

        MintNFTScreen_Button_Robot.onClick.AddListener(() =>
        {
            MintNftScreenButtonClick(2);
        });

        MintNFTScreen_Button_Rainbow.onClick.AddListener(() =>
        {
            MintNftScreenButtonClick(3);
        });

        MintNFTScreen_Button_Close.onClick.AddListener(() =>
        {
            Mint_NFTScreen.SetActive(false);
        });

        // Wallet Screen

        ClaimTokens_Button.onClick.AddListener(() =>
        {
            if (SuiWallet.HasActiveAddress())
            {
                WalletScreen.SetActive(false);

                RequestTokenDto requestTokenDto = new RequestTokenDto();
                requestTokenDto.amount = 100;
                requestTokenDto.recipient = SuiWallet.ActiveWalletAddress;
                NetworkManager.Instance.RequestToken(requestTokenDto, OnSuccessfulRequestToken, OnErrorRequestToken);
                LoadingScreen.SetActive(true);
            }
        });

        Close_WalletScreen.onClick.AddListener(() =>
        {
            WalletScreen.SetActive(false);
        });

        Close_LeaderboardScreen.onClick.AddListener(() =>
        {
            LeaderboardScreen.SetActive(false);
        });

        // ClaimTokens
        Close_ClaimTokens.onClick.AddListener(() =>
        {
            ClaimTokensScreen.SetActive(false);
            WalletScreen.SetActive(true);
            txtScore_WalletScreen.text = UserData.TokenBalance.ToString();
        });

        MintNFT_LinkButton.onClick.AddListener(() =>
        {
            string nftSignature = PlayerPrefsExtra.GetString("nftSignature");
            Application.OpenURL(nftSignature);
        });

        WalletScreen_NFTAdd_Button.onClick.AddListener(() =>
        {
            Application.OpenURL(NFTLinkAdd);
        });

        ClaimScreen_NFTAdd_Button.onClick.AddListener(() =>
        {
            string transactionSign = PlayerPrefsExtra.GetString("nftSignature_claim");
            Debug.Log("link claim  " + transactionSign);
            Application.OpenURL(transactionSign);
        });

    }

    public void EVMSelect(bool value)
    {

    }

    public void SUISelect(bool value)
    {

    }

    public async void OnPersonalSignButton()
    {
        var session = WalletConnect.Instance.ActiveSession;
        Debug.Log($"[WalletConnectModalSample] session: {session}");

        var sessionNamespace = session.Namespaces;
        var address = WalletConnect.Instance.ActiveSession.CurrentAddress(sessionNamespace.Keys.FirstOrDefault())
            .Address;

        MessageToSign = GenerateRandomMessage();

        Debug.Log($"[WalletConnectModalSample] MessageToSign: {MessageToSign}");
        Debug.Log($"[WalletConnectModalSample] address: {address}");

        NetworkManager.Instance.StartAuthSession("" + address, OnSuccessfulAuthSession, OnErrorStartAuthSession);
    }

    public void setuserName()
    {
        UserData.UserName = UserName.text;
        ShowHomeScreen();
    }

    private void CreateNFT(string name, string imageUrl)
    {
        CreateNFTRequestDto createNFTRequest = new CreateNFTRequestDto();
        createNFTRequest.name = name;
        createNFTRequest.imageUrl = imageUrl;
        createNFTRequest.quantity = 1;
        createNFTRequest.recipient = SuiWallet.ActiveWalletAddress;
        //NetworkManager.Instance.CreateNFT(createNFTRequest, OnSuccessfulCreateNFT_Modify, OnErrorCreateNFT_Modify);
        NetworkManager.Instance.CreateNFT(createNFTRequest, OnSuccessfulCreateNFT, OnErrorCreateNFT);
        //OnSuccessfulCreateNFT(new CreateNFTResponseDto());
    }

    #region Login Methods 

    /// <summary>
    /// Generates a randomized string of numbers and letters, to be used as a message to sign in order to verify wallet ownership 
    /// (part of login process).
    /// </summary>
    /// <returns>Randomized alphanumeric string</returns>
    private string GenerateRandomMessage()
    {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var stringChars = new char[SIGNING_MESSAGE_LENGTH];
        var random = new System.Random();

        for (int i = 0; i < stringChars.Length; i++)
            stringChars[i] = chars[random.Next(chars.Length)];

        //this is for development only
#if FAKE_SIGNIN
        return "PpMoClvCn6IzrMewxpplO9skITR9vZoG";
#else
        return new String(stringChars);
#endif
    }

    /// <summary>
    /// Called from the Javascript front end after signing a message; passes back the user address and signed message signature.
    /// </summary>
    /// <param name="response">A string of two elements delimited by ':'. First element is the signature, the second element is 
    /// the user's wallet address (which was used to sign the message).</param>
    private void SignMessageCallback(string response)
    {
        Debug.Log("SignMessageCallback response : " + response);
        string[] args = response.Split(':');

        if (args.Length > 0)
        {
            //retrieve the wallet address and signature 
            string signature = args[0];
            var session = WalletConnect.Instance.ActiveSession;
            var sessionNamespace = session.Namespaces;
            var address = WalletConnect.Instance.ActiveSession.CurrentAddress(sessionNamespace.Keys.FirstOrDefault())
            .Address;

            Debug.Log("signed message:" + signature);
            Debug.Log("wallet address:" + address);

            //prepare a request to verify the signature
            AuthVerifyDto request = new AuthVerifyDto();
            request.wallet = "" + address;
            request.walletType = "evm";
            request.action = "verify";
            request.sessionId = UserData.sessionID;
            request.messageToSign = "";
            request.signature = System.Web.HttpUtility.UrlEncode(signature);

            NetworkManager.Instance.VerifyAuthSession(request, OnSuccessfulVerifySession, OnErrorVerifySignature);

            ////prepare a request to verify the signature
            //VerifySignatureDto request = new VerifySignatureDto();
            //request.address = address;
            //request.signature = System.Web.HttpUtility.UrlEncode(signature);
            //request.message = MessageToSign;

            ////call to verify signature
            //NetworkManager.Instance.VerifySignature(request, OnSuccessfulVerifySignature, OnErrorVerifySignature);
            ////this.VerifySignature(request, OnSuccessfulVerifySignature, OnErrorVerifySignature);
        }
    }

    #endregion

    #region UI Methods 

    /// <summary>
    /// Shows the home screen (after logging in).
    /// </summary>
    private void ShowHomeScreen()
    {
        HomeScreen.SetActive(true);
        PlaySongScreen.SetActive(true);
        NFTLinkAdd = SuiWallet.ErrorMessage.Length > 0 ? SuiWallet.ErrorMessage : SuiExplorer.FormatAddressUri(SuiWallet.ActiveWalletAddress);
        NFTLinkText = SuiWallet.ActiveWalletAddress;

        txtAddressNFT_WalletScreen.text = NFTLinkText;
        string nftSignature = PlayerPrefsExtra.GetString("nftSignature");
        link_successful.text = nftSignature;

        SelectCharacterScreen.SetActive(true);
        SelectCharacter_Overlay.SetActive(false);
        txtMintCharacter.SetActive(false);

        if (UserData.HasSelectedNft && UserData.OwnedNftCount > 0)
        {
            //this is hiding the NFT minting overlay 
            blockImage.SetActive(false);
            isOverlayOn = false;
        }
        else
        {
            //this is showing the NFT minting overlay 
            blockImage.SetActive(true);
            SelectCharacter_Overlay.SetActive(true);
            isOverlayOn = true;
        }

        this.SetSelectedNfts();
    }

    /// <summary>
    /// Opens the NFT 
    /// </summary>
    private void ShowNftScreen()
    {
        Mint_NFTScreen.SetActive(true);
    }

    //TODO: (LOW) I don't think this method is ever called 
    public void SelectNfts()
    {
        if (SuiWallet.HasActiveAddress())
        {
            HomeScreen.SetActive(true);
            PlaySongScreen.SetActive(true);
            NFTLinkAdd = SuiWallet.ErrorMessage.Length > 0 ? SuiWallet.ErrorMessage : SuiExplorer.FormatAddressUri(SuiWallet.ActiveWalletAddress);
            NFTLinkText = SuiWallet.ActiveWalletAddress;

            txtAddressNFT_WalletScreen.text = NFTLinkText;
            string nftSignature = PlayerPrefsExtra.GetString("nftSignature");
            link_successful.text = nftSignature;

            SelectCharacterScreen.SetActive(true);
            SelectCharacter_Overlay.SetActive(false);
            txtMintCharacter.SetActive(false);

            if (UserData.HasSelectedNft)
            {
                blockImage.SetActive(false);
                isOverlayOn = false;
            }
            else
            {
                blockImage.SetActive(true);
                SelectCharacter_Overlay.SetActive(true);
                isOverlayOn = true;
            }

            this.SetSelectedNfts();
        }
        else
        {
            blockImage.SetActive(true);
        }
    }

    /// <summary>
    /// Shows the user's wallet and token balance
    /// </summary>
    public void ShowNFTWallet()
    {
        if (SuiWallet.HasActiveAddress())
        {
            NetworkManager.Instance.GetTokenBalance(SuiWallet.ActiveWalletAddress, OnSuccessfulGetTokenBalance, OnErrorGetTokenBalance);
            LoadingScreen.SetActive(true);
        }
    }

    /// <summary>
    /// Shows the screen that allows users to choose an NFT image as their player avatar. 
    /// </summary>
    //TODO: (LOW) not sure when this is ever called
    public void ShowPlayerSelectionScreen()
    {
        this.SetSelectedNfts();
        Mint_NFTScreen.SetActive(true);
    }

    /// <summary>
    /// This handles the Mint NFT or Select button click on the home screen. 
    /// </summary>
    /// <param name="index"></param>
    private void MintButtonClick(int index)
    {
        var selectedNft = this.NftUiList[index];

        //ignore the locked 
        if (selectedNft.Locked)
            return;

        if (!UserData.OwnsNft(selectedNft.Name) && SuiWallet.HasActiveAddress())
        {
            this.NftMintCandidateIndex = index;
            this.CreateNFT(selectedNft.Name, selectedNft.ImageUrl);
            LoadingScreen.SetActive(true);
            blockImage.SetActive(false);
        }
        else
        {
            if (UserData.OwnsNft(selectedNft.Name))
            {
                this.SetSelectedNft(index);
            }
            else
            {
                ShowNftScreen();
            }
        }
    }

    /// <summary>
    /// This handles Mint NFT or Select button click on the NFT pop-up screen that comes up when you click "NFT" in 
    /// the top right corner. 
    /// </summary>
    /// <param name="index">The index of the clicked item.</param>
    private void MintNftScreenButtonClick(int index)
    {
        var selectedItem = this.NftUiList[index];

        if (!UserData.OwnsNft(selectedItem.Name) && SuiWallet.HasActiveAddress())
        {
            this.NftMintCandidateIndex = index;
            this.CreateNFT(selectedItem.Name, selectedItem.ImageUrl);
            LoadingScreen.SetActive(true);
        }
        else
        {
            this.SetSelectedNft(index);
        }
    }

    /// <summary>
    /// Sets the NFT that's currently selected, and updates the UI accordingly. 
    /// </summary>
    /// <param name="index">The index of the selected NFT.</param>
    private void SetSelectedNft(int index)
    {
        if (UserData.OwnsNft(index))
        {
            UserData.SelectedNftIndex = index;
            GoogleAnalytics.Instance.SendSelectedCharacter(UserData.SelectedNftName);
        }
        this.SetSelectedNfts();
    }

    /// <summary>
    /// This goes through the list of NFT UI elements, and sets the correct colors, text, etc. for each one based on 
    /// whether or not the NFT is owned, selected, or locked.
    /// </summary>
    private void SetSelectedNfts()
    {
        for (int n = 0; n < this.NftUiList.Count; n++)
        {
            var item = this.NftUiList[n];
            if (UserData.SelectedNftIndex == n)
            {
                item.SetSelected(true);
            }
            else
            {
                item.SetSelected(false);
            }
        }
    }

    #endregion

    #region API Callbacks
    private void OnSuccessfulRequestToken(RequestTokenResponseDto requestTokenResponseDto)
    {
        //TODO: we really should have the amount be part of the response DTO 
        int tokenAmount = 100;

        GoogleAnalytics.Instance.SendMintedTokens(SuiWallet.ActiveWalletAddress, tokenAmount);

        string transactionLink = SuiExplorer.FormatTransactionUri(requestTokenResponseDto.signature);
        PlayerPrefsExtra.SetString("nftSignature_claim", transactionLink);

        txtAddressNFT_ClaimScreen.text = transactionLink;
        LoadingScreen.SetActive(false);
        ClaimTokensScreen.SetActive(true);

        //TODO: (LOW) this should be gotten from the response; should not be counted manually
        UserData.TokenBalance += tokenAmount;
        txtScore_ClaimScreen.text = tokenAmount.ToString();
        Debug.Log("signature...>" + requestTokenResponseDto.signature + UserData.TokenBalance);
    }

    private void OnErrorRequestToken(string error)
    {
        this.ShowError(error);
        GoogleAnalytics.Instance.SendError(error, "requestToken");
    }

    private void OnSuccessfulGetTokenBalance(GetTokenBalanceResponseDto getTokenBalanceResponseDto)
    {
        LoadingScreen.SetActive(false);
        WalletScreen.SetActive(true);
        Debug.Log(getTokenBalanceResponseDto.balance);
        UserData.TokenBalance = getTokenBalanceResponseDto.balance;
        txtScore_WalletScreen.text = getTokenBalanceResponseDto.balance.ToString();
        Debug.Log(txtScore_WalletScreen.text);
    }

    private void OnErrorGetTokenBalance(string error)
    {
        this.ShowError(error);
        GoogleAnalytics.Instance.SendError(error, "getTokenBalance");
    }

    private void OnSuccessfulGetBeatsNfts(GetBeatsNftsResponseDto getNftsResponseDto)
    {
        UserData.SetOwnedNfts(getNftsResponseDto);
        //allow entry into game
        ShowHomeScreen();
    }

    private void OnErrorGetBeatsNfts(string error)
    {
        ShowHomeScreen();
        this.ShowError(error);
        GoogleAnalytics.Instance.SendError(error, "getBeatsNfts");
    }

    private void OnSuccessfulVerifySignature(VerifySignatureResponseDto verifySignatureResponseDto)
    {
        //set active wallet address 
        if (verifySignatureResponseDto.verified)
        {
#if FAKE_SIGNIN
            verifySignatureResponseDto.address = "0x0fc4a6096df7a66592ffcd6eedb8bc1965e110fa8d7c6d5aef1b70ebc7ab3938";
#endif

            SuiWallet.ActiveWalletAddress = verifySignatureResponseDto.address;

            //get user owned NFTs
            NetworkManager.Instance.GetUserOwnedBeatsNfts(verifySignatureResponseDto.address, OnSuccessfulGetBeatsNfts, OnErrorGetBeatsNfts);
        }
        else
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = verifySignatureResponseDto.address + ", " + verifySignatureResponseDto.failureReason;
        }
    }

    private void OnSuccessfulAuthSession(StartAuthSessionResponseDto startAuthSessionResponseDto)
    {
        Debug.Log("OnSuccessfulAuthSession");
        //set active wallet address 
        if (startAuthSessionResponseDto.sessionId != "")
        {
#if FAKE_SIGNIN
            startAuthSessionResponseDto.sessionId = "0x0fc4a6096df7a66592ffcd6eedb8bc1965e110fa8d7c6d5aef1b70ebc7ab3938";
#endif
            UserData.sessionID = startAuthSessionResponseDto.sessionId;
            MessageToSign = startAuthSessionResponseDto.messageToSign;

            SignMessageCallback(MessageToSign);
        }
        else
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = startAuthSessionResponseDto.sessionId + ", " + startAuthSessionResponseDto.messageToSign;
        }
    }

    private void OnSuccessfulVerifySession(StartAuthSessionResponseDto startAuthSessionResponseDto)
    {
        //set active wallet address 
        if (startAuthSessionResponseDto.sessionId != "")
        {
#if FAKE_SIGNIN
            startAuthSessionResponseDto.sessionId = "0x0fc4a6096df7a66592ffcd6eedb8bc1965e110fa8d7c6d5aef1b70ebc7ab3938";
#endif
            //get user owned NFTs
            NetworkManager.Instance.GetUserOwnedBeatsNfts(startAuthSessionResponseDto.sessionId, OnSuccessfulGetBeatsNfts, OnErrorGetBeatsNfts);
        }
        else
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = startAuthSessionResponseDto.sessionId + ", " + startAuthSessionResponseDto.messageToSign;
        }
    }

    private void OnErrorVerifySignature(string error)
    {
        this.ShowError(error);
        GoogleAnalytics.Instance.SendError(error, "verifySignature");
    }

    private void OnErrorStartAuthSession(string error)
    {
        this.ShowError(error);
        GoogleAnalytics.Instance.SendError(error, "StartAuthSession");
    }

    private void OnSuccessfulCreateNFT(CreateNFTResponseDto createNFTResponseDto)
    {
        GoogleAnalytics.Instance.SendMintedNFT(SuiWallet.ActiveWalletAddress, createNFTResponseDto.addresses.Length > 0 ? createNFTResponseDto.addresses[0] : "");

        //add the new NFT to user data 
        var newNft = this.NftUiList[this.NftMintCandidateIndex];
        UserData.AddNft(newNft.Name);

        //display the transaction link 
        string NFTAdd = SuiExplorer.FormatTransactionUri(createNFTResponseDto.signature);
        link_successful.text = NFTAdd;
        PlayerPrefsExtra.SetString("nftSignature", NFTAdd);

        //UI changes 
        this.SetSelectedNft(this.NftMintCandidateIndex);
        LoadingScreen.SetActive(false);
        Mint_SuccessfulScreen_Image.sprite = this.NftUiList[this.NftMintCandidateIndex].CharacterSprite;
        Mint_SuccessfulScreen.SetActive(true);
    }

    private void OnErrorCreateNFT(string error)
    {
        this.ShowError(error);
        GoogleAnalytics.Instance.SendError(error, "createNFT");
    }

    private void ShowError(string error)
    {
        LoadingScreen.SetActive(false);
        ErrorScreen.SetActive(true);
        txtError_ErrorScreen.text = error;
    }

    #endregion 
}


[RpcMethod("personal_sign")]
[RpcRequestOptions(Clock.ONE_MINUTE, 99998)]
public class PersonalSign : List<string>
{
    public PersonalSign(string hexUtf8, string account) : base(new[] { hexUtf8, account })
    {

    }

    [Preserve]
    public PersonalSign()
    {
    }
}