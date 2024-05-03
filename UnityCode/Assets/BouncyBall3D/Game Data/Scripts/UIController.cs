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
using Unity.VisualScripting;
using WalletConnectUnity.Core.Evm;

public class UIController : MonoBehaviour
{
    public static UIController instance;
    private void Awake()
    {
        instance = this;
    }

    #region UI Components 

    public Button NFTButton;
    public Button WalletButton_Home;
    public Button Mint_Button_Anna;
    public Button Mint_Button_Marshmallow;
    public Button Mint_Button_Taral;
    public Button Mint_Button_Alien;
    public Button Mint_Button_Neon;
    public Button Mint_Button_Robot;
    public Button Mint_Button_Rainbow;
    public Button Mint_Button_Wanderer;

    public Button Mint_SuccessfulScreen_Close;
    public Button MintNFTScreen_Button_Anna;
    public Button MintNFTScreen_Button_Marshmallow;
    public Button MintNFTScreen_Button_Taral;
    public Button MintNFTScreen_Button_Alien;
    public Button MintNFTScreen_Button_Neon;
    public Button MintNFTScreen_Button_Robot;
    public Button MintNFTScreen_Button_Rainbow;
    public Button MintNFTScreen_Button_Wanderer;

    public Button MintNFTScreen_Button_Close;
    public Button ClaimTokens_Button;
    public Button Close_WalletScreen;
    public Button Close_LeaderboardScreen;
    public Button Close_ClaimTokens;
    public Button MintNFT_LinkButton;
    public Button WalletScreen_NFTAdd_Button;
    public Button ClaimScreen_NFTAdd_Button;

    public Button onLogOutButton;

    public TMP_InputField ActiveAddressText;
    public TextMeshProUGUI link_successful;
    public GameObject SuiWalletScreen;
    public GameObject HomeScreen;
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


    public Sprite Character_Anna;
    public Sprite Character_Melloow;
    public Sprite Character_Taral;
    public Sprite Character_Alien;
    public Sprite Character_Neon;
    public Sprite Character_Robot;
    public Sprite Character_Rainbow;
    public Sprite Character_Wanderer;

    public TextMeshProUGUI txtAddressNFT_WalletScreen;
    public TextMeshProUGUI txtAddress_WalletScreen;
    public TextMeshProUGUI txtScore_WalletScreen;
    public TextMeshProUGUI txtScore_ClaimScreen;
    public TextMeshProUGUI txtAddressNFT_ClaimScreen;
    public TextMeshProUGUI txtUserName_WalletScreen;
    public TextMeshProUGUI txtLevel_WalletScreen;

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
    public TextMeshProUGUI Mint_Text_Wanderer;

    public TextMeshProUGUI MintNFTScreen_Text_Anna;
    public TextMeshProUGUI MintNFTScreen_Text_Mellow;
    public TextMeshProUGUI MintNFTScreen_Text_Taral;
    public TextMeshProUGUI MintNFTScreen_Text_Alien;
    public TextMeshProUGUI MintNFTScreen_Text_Neon;
    public TextMeshProUGUI MintNFTScreen_Text_Robot;
    public TextMeshProUGUI MintNFTScreen_Text_Rainbow;
    public TextMeshProUGUI MintNFTScreen_Text_Wanderer;

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
            this.MintNftScreenButton.GetComponent<Image>().color = this.Locked ? Color.red : Color.white;
            this.MintButton.GetComponent<Image>().color = this.Locked ? Color.red : Color.white;

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
                        this.MintNftScreenText.text = "Select";
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
                        this.MintNftScreenText.text = "Select";
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
    //private NftUiElements NftUiElements_Alien = new NftUiElements();
    private NftUiElements NftUiElements_Neon = new NftUiElements();
    private NftUiElements NftUiElements_Robot = new NftUiElements();
    private NftUiElements NftUiElements_Rainbow = new NftUiElements();
    private NftUiElements NftUiElements_Wanderer = new NftUiElements();

    private List<NftUiElements> NftUiList = new List<NftUiElements>();

    private void Start()
    {
        //get user owned NFTs
        NetworkManager.Instance.GetUserOwnedBeatsNfts(SuiWallet.ActiveWalletAddress, OnSuccessfulGetBeatsNfts, OnErrorGetBeatsNfts);

        ActiveAddressText.text = SuiWallet.ActiveWalletAddress;

        ////group Anna elements together
        NftUiElements_Anna.MintNftScreenText = MintNFTScreen_Text_Anna;
        NftUiElements_Anna.MintText = Mint_Text_Anna;
        NftUiElements_Anna.MintButton = Mint_Button_Anna;
        NftUiElements_Anna.MintNftScreenButton = MintNFTScreen_Button_Anna;
        NftUiElements_Anna.CharacterSprite = Character_Alien;
        NftUiElements_Anna.Name = "Alien";
        NftUiElements_Anna.ImageUrl = GameData.NftImageUrlBase + "Alien.png";
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
        //NftUiElements_Alien.MintNftScreenText = MintNFTScreen_Text_Alien;
        //NftUiElements_Alien.MintText = Mint_Text_Alien;
        //NftUiElements_Alien.MintButton = Mint_Button_Alien;
        //NftUiElements_Alien.MintNftScreenButton = MintNFTScreen_Button_Alien;
        //NftUiElements_Alien.CharacterSprite = Character_Alien;
        //NftUiElements_Alien.Locked = false;
        //NftUiElements_Alien.Name = "Alien";
        //NftUiElements_Alien.ImageUrl = GameData.NftImageUrlBase + "Alien.png";
        //NftUiElements_Alien.SelectedSprite = sprite_Green;
        //NftUiElements_Alien.UnselectedSprite = sprite_Pink;

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

        //group Wanderer elements together
        NftUiElements_Wanderer.MintNftScreenText = MintNFTScreen_Text_Wanderer;
        NftUiElements_Wanderer.MintText = Mint_Text_Wanderer;
        NftUiElements_Wanderer.MintButton = Mint_Button_Wanderer;
        NftUiElements_Wanderer.MintNftScreenButton = MintNFTScreen_Button_Wanderer;
        NftUiElements_Wanderer.CharacterSprite = Character_Wanderer;
        NftUiElements_Wanderer.Locked = false;
        NftUiElements_Wanderer.Name = "Wanderer";
        NftUiElements_Wanderer.ImageUrl = GameData.NftImageUrlBase + "Wanderer.png";
        NftUiElements_Wanderer.SelectedSprite = sprite_Green;
        NftUiElements_Wanderer.UnselectedSprite = sprite_Pink;

        this.NftUiList.Add(NftUiElements_Anna);
        this.NftUiList.Add(NftUiElements_Neon);
        this.NftUiList.Add(NftUiElements_Robot);
        this.NftUiList.Add(NftUiElements_Rainbow);
        this.NftUiList.Add(NftUiElements_Wanderer);

        //Log Out (click logout button)
        onLogOutButton.onClick.AddListener(() =>
        {
            WalletScreen.SetActive(false);
            HomeScreen.SetActive(false);
            SelectCharacterScreen.SetActive(false);

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
            //if (SuiWallet.HasActiveAddress())
            //{
            NetworkManager.Instance.GetTokenBalance(SuiWallet.ActiveWalletAddress, OnSuccessfulGetTokenBalance, OnErrorGetTokenBalance);
            LoadingScreen.SetActive(true);
            //}
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
            //MintButtonClick(1);
        });

        //Mint Taral 
        Mint_Button_Taral.onClick.AddListener(() =>
        {
            //MintButtonClick(2);
        });

        //Mint Alien 
        Mint_Button_Alien.onClick.AddListener(() =>
        {
            MintButtonClick(1);
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

        //Mint Wanderer
        Mint_Button_Wanderer.onClick.AddListener(() =>
        {
            MintButtonClick(4);
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

        MintNFTScreen_Button_Wanderer.onClick.AddListener(() =>
        {
            MintNftScreenButtonClick(4);
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
            txtScore_WalletScreen.text = UserData.TokenBalance.ToString() + " beats";
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

    public void selectLevel(int levelNum)
    {
        var session = WalletConnect.Instance.ActiveSession;
        var sessionNamespace = session.Namespaces;
        var address = WalletConnect.Instance.ActiveSession.CurrentAddress(sessionNamespace.Keys.FirstOrDefault())
            .Address;

        NetworkManager.Instance.postLevel(levelNum, "" + address, OnSuccessfulPostLevel, OnErrorPostLevel);
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

    #region UI Methods 

    /// <summary>
    /// Shows the home screen (after logging in).
    /// </summary>
    private void ShowHomeScreen()
    {
        HomeScreen.SetActive(true);
        //PlaySongScreen.SetActive(true);
        NFTLinkAdd = SuiWallet.ErrorMessage.Length > 0 ? SuiWallet.ErrorMessage : SuiExplorer.FormatAddressUri(SuiWallet.ActiveWalletAddress);
        NFTLinkText = SuiWallet.ActiveWalletAddress;
        txtAddressNFT_WalletScreen.text = NFTLinkText;
        txtAddress_WalletScreen.text = NFTLinkText;
        txtUserName_WalletScreen.text = "Hello " + UserData.UserName;
        txtLevel_WalletScreen.text = "Level " + UserData.currentLevel;
        string nftSignature = PlayerPrefsExtra.GetString("nftSignature");
        link_successful.text = nftSignature;

        SelectCharacterScreen.SetActive(true);
        SelectCharacter_Overlay.SetActive(false);
        txtMintCharacter.SetActive(false);
        LoadingScreen.SetActive(false);

        if (UserData.HasSelectedNft && UserData.OwnedNftCount > 0)
        {
            //this is hiding the NFT minting overlay 
            //blockImage.SetActive(false);
            isOverlayOn = false;
        }
        else
        {
            //this is showing the NFT minting overlay 
            //blockImage.SetActive(true);
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
            NFTLinkAdd = SuiWallet.ErrorMessage.Length > 0 ? SuiWallet.ErrorMessage : SuiExplorer.FormatAddressUri(SuiWallet.ActiveWalletAddress);
            NFTLinkText = SuiWallet.ActiveWalletAddress;
            txtAddress_WalletScreen.text = NFTLinkText;
            txtAddressNFT_WalletScreen.text = NFTLinkText;
            string nftSignature = PlayerPrefsExtra.GetString("nftSignature");
            link_successful.text = nftSignature;

            SelectCharacterScreen.SetActive(true);
            SelectCharacter_Overlay.SetActive(false);
            txtMintCharacter.SetActive(false);

            if (UserData.HasSelectedNft)
            {
                //blockImage.SetActive(false);
                isOverlayOn = false;
            }
            else
            {
                //blockImage.SetActive(true);
                SelectCharacter_Overlay.SetActive(true);
                isOverlayOn = true;
            }

            this.SetSelectedNfts();
        }
        else
        {
            //blockImage.SetActive(true);
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
            //blockImage.SetActive(false);
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
        Player.instance.playerIndex(index);
        Player.instance.characterSelect = index;
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
        Player.instance.playerIndex(index);
        Player.instance.characterSelect = index;
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
        txtScore_WalletScreen.text = getTokenBalanceResponseDto.balance.ToString() + " beats";
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

    private void OnSuccessfulPostLevel(UpdateUserLevelDto updateUserLevelDto)
    {
        Debug.Log("OnSuccessfulPostLevel");
        //set active wallet address 
        if (updateUserLevelDto.status == "success")
        {
            Debug.Log("Post Level data");
        }
    }

    private void OnErrorPostLevel(string error)
    {
        this.ShowError(error);
        GoogleAnalytics.Instance.SendError(error, "PostLevel");
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