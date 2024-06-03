using System.Collections;
using System.Collections.Generic;
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
using System;
using System.Text;
using System.Linq;
using UnityEngine.SceneManagement;

public class LoginManager : MonoBehaviour
{
    public Button ConnectWalletButton;
    public GameObject UserNamePanel;
    public GameObject LoadingScreen;
    public GameObject ErrorScreen;
    public TextMeshProUGUI txtError_ErrorScreen;
    public TMP_InputField UserName;
    public static LoginManager instance;

    private const int SIGNING_MESSAGE_LENGTH = 32;
    private static string MessageToSign = "";


    // Start is called before the first frame update
    void Start()
    {
        if (instance == null)
        {
            instance = this;
        }

        //Connect Wallet (click connect button)
        ConnectWalletButton.onClick.AddListener(() =>
        {
            LoadingScreen.SetActive(true);
            GoogleAnalytics.Instance.SendFakeWalletLogin(SystemInfo.deviceModel + " - " + SystemInfo.operatingSystemFamily);
            StartCoroutine(LoadingSceen());
        });
    }

    // Function to generate a random 32-byte hex-encoded string
    public string GenerateRandomHexString(int length)
    {
        // Length of the byte array
        int byteArrayLength = length / 2;

        // Generate random bytes
        byte[] randomBytes = new byte[byteArrayLength];
        System.Random random = new System.Random();
        random.NextBytes(randomBytes);

        // Convert bytes to hex string
        StringBuilder sb = new StringBuilder(byteArrayLength * 2);
        foreach (byte b in randomBytes)
        {
            sb.AppendFormat("{0:x2}", b);
        }

        return sb.ToString();
    }

    public IEnumerator LoadingSceen()
    {
        yield return new WaitForSeconds(0.0001f);
        try
        {
            MessageToSign = GenerateRandomMessage();
            print(MessageToSign);
            VerifySignatureResponseDto dto = new VerifySignatureResponseDto();
            dto.verified = true;
            dto.wallet = "0x0fc4a6096df7a66592ffcd6eedb8bc1965e110fa8d7c6d5aef1b70ebc7ab3938";
            dto.failureReason = "";
            dto.level = 1;
            this.OnSuccessfulVerifySignature(dto);
        }
        catch (Exception e)
        {
            SuiWallet.ErrorMessage = e.ToString();
        }
    }

    public void generateNonceTokenAndOpenwebView()
    {
        string nonceToken = GenerateRandomHexString(64);
        Debug.Log("Nonce Token: " + nonceToken);
#if UNITY_EDITOR
       startGame();
#else
        GPMWebViewManager.Instance.ShowUrlFullScreen(nonceToken);
#endif
    }

    public void getSUIAddress()
    {
        //startGame();
        //NetworkManager.Instance.GetSUIAddress("a123", OnSuccessfulGetSUIWalletAddress, OnErrorStartAuthSession);
        //NetworkManager.Instance.GetSUIAddress("" + GPMWebViewManager.Instance.nonce_token, OnSuccessfulGetSUIWalletAddress, OnErrorStartAuthSession);
    }

    public void startGame()
    {
        Debug.Log("Start Game");
        LoadingScreen.SetActive(true);
        SceneManager.LoadSceneAsync(SceneManager.GetActiveScene().buildIndex + 1);
    }

    public void setuserName()
    {
        NetworkManager.Instance.CheckUsername("" + UserName.text, OnSuccessfulVerifyUserName, OnErrorStartAuthSession);
    }

    public async void OnPersonalSignButton()
    {
        var session = WalletConnect.Instance.ActiveSession;
        Debug.Log($"[WalletConnectModalSample] session: {session}");

        var sessionNamespace = session.Namespaces;
        var address = WalletConnect.Instance.ActiveSession.CurrentAddress(sessionNamespace.Keys.FirstOrDefault())
            .Address;

        Debug.Log($"[WalletConnectModalSample] address: {address}");
        SuiWallet.ActiveWalletAddress = address;
        NetworkManager.Instance.StartAuthSession("" + address, OnSuccessfulAuthSession, OnErrorStartAuthSession);
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
    private async void SignMessageCallback(string response)
    {
        Debug.Log("SignMessageCallback response : " + response);

        var session = WalletConnect.Instance.ActiveSession;
        var sessionNamespace = session.Namespaces;
        var address = WalletConnect.Instance.ActiveSession.CurrentAddress(sessionNamespace.Keys.FirstOrDefault())
        .Address;

        Debug.Log("SignMessageCallback address : " + address);
        var data = new PersonalSign(response, address);

        Debug.Log("SignMessageCallback PersonalSign : " + data);

        try
        {

            Debug.Log("Generating Signature from Data.");
            var result = await WalletConnect.Instance.RequestAsync<PersonalSign, string>(data);
            Debug.Log("Received response.This app cannot validate signatures yet.\nResponse: " + result);

            Debug.Log("signed message:" + response);
            Debug.Log("wallet address:" + address);

            //prepare a request to verify the signature
            AuthVerifyDto request = new AuthVerifyDto();
            request.wallet = "" + address;
            request.walletType = "evm";
            request.action = "update";
            request.sessionId = UserData.sessionID;
            request.messageToSign = response;
            request.username = UserData.UserName;
            request.signature = System.Web.HttpUtility.UrlEncode(result);
            PlayerPrefsExtra.SetString("nftSignature", System.Web.HttpUtility.UrlEncode(result));
            NetworkManager.Instance.VerifyAuthSession(request, OnSuccessfulVerifySession, OnErrorVerifySignature);

        }
        catch (WalletConnectException e)
        {

            Debug.Log($"[WalletConnectModalSample] Personal Sign Error: {e.Message}");
        }

        Debug.Log("Done with VerifyAuthSession.");

        ////prepare a request to verify the signature
        //VerifySignatureDto request = new VerifySignatureDto();
        //request.address = address;
        //request.signature = System.Web.HttpUtility.UrlEncode(signature);
        //request.message = MessageToSign;

        ////call to verify signature
        //NetworkManager.Instance.VerifySignature(request, OnSuccessfulVerifySignature, OnErrorVerifySignature);
        ////this.VerifySignature(request, OnSuccessfulVerifySignature, OnErrorVerifySignature);

    }

    private void OnSuccessfulVerifySignature(VerifySignatureResponseDto verifySignatureResponseDto)
    {
        //set active wallet address 
        if (verifySignatureResponseDto.verified)
        {
            SuiWallet.ActiveWalletAddress = verifySignatureResponseDto.wallet;
            UserData.currentLevel = verifySignatureResponseDto.level;
            SceneManager.LoadSceneAsync(SceneManager.GetActiveScene().buildIndex + 1);
        }
        else
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = verifySignatureResponseDto.wallet + ", " + verifySignatureResponseDto.failureReason;
        }
    }

    private void OnSuccessfulAuthSession(StartAuthSessionResponseDto startAuthSessionResponseDto)
    {
        Debug.Log("OnSuccessfulAuthSession");
        //set active wallet address 
        if (startAuthSessionResponseDto.sessionId != "")
        {
            //#if FAKE_SIGNIN
            //            startAuthSessionResponseDto.sessionId = "0x0fc4a6096df7a66592ffcd6eedb8bc1965e110fa8d7c6d5aef1b70ebc7ab3938";
            //#endif
            Debug.Log("Received Username : " + startAuthSessionResponseDto.username);
            if (startAuthSessionResponseDto.username != "")
            {
                Debug.Log("Processing for Auth");
                UserName.text = startAuthSessionResponseDto.username;
                UserData.UserName = startAuthSessionResponseDto.username;
                UserData.sessionID = startAuthSessionResponseDto.sessionId;
                MessageToSign = startAuthSessionResponseDto.messageToSign;
                SignMessageCallback(MessageToSign);
            }
            else
            {
                UserData.sessionID = startAuthSessionResponseDto.sessionId;
                MessageToSign = startAuthSessionResponseDto.messageToSign;
                LoadingScreen.SetActive(false);
                Debug.Log("Processing for User Name");
                UserNamePanel.SetActive(true);
            }
        }
        else
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = startAuthSessionResponseDto.sessionId + ", " + startAuthSessionResponseDto.messageToSign;
        }
    }

    private void OnSuccessfulVerifySession(VerifySignatureResponseDto verifySignatureResponseDto)
    {
        Debug.Log("Inside OnSuccessfulVerifySession");
        //set active wallet address 
        if (verifySignatureResponseDto.wallet != "")
        {
            //#if FAKE_SIGNIN
            //            verifySignatureResponseDto.wallet = "0x0fc4a6096df7a66592ffcd6eedb8bc1965e110fa8d7c6d5aef1b70ebc7ab3938";
            //#endif
            UserData.currentLevel = verifySignatureResponseDto.level;
            NetworkManager.Instance.CheckUsername("" + UserData.UserName, isUserNameSaved, null);
            GoogleAnalytics.Instance.SendLoginEvent(verifySignatureResponseDto.wallet, UserData.UserName);
            if (verifySignatureResponseDto.suiWallet != "")
            {
                SuiWallet.ActiveWalletAddress = verifySignatureResponseDto.suiWallet;
            }
            else
            {
                NetworkManager.Instance.GetUserSUIAddress(verifySignatureResponseDto.wallet, OnSuccessfulVerifySession, OnErrorGetUserSUIAddress);
            }
        }
        else
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = verifySignatureResponseDto.wallet + ", " + verifySignatureResponseDto.failureReason;
        }
    }

    private void OnSuccessfulVerifyUserName(CheckUsernameResponseDto checkUsernameResponseDto)
    {
        Debug.Log("OnSuccessfulVerifyUserName");
        //set active wallet address 
        if (!checkUsernameResponseDto.exists)
        {

            //ShowHomeScreen();
            UserData.UserName = UserName.text;
            UserNamePanel.SetActive(false);
            LoadingScreen.SetActive(true);
            SignMessageCallback(MessageToSign);
        }
        else
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = "Username is not available. Please choose another username";
        }
    }

    private void OnSuccessfulGetSUIWalletAddress(UpdateUserLevelDto updateUserLevelDto)
    {
        Debug.Log("OnSuccessfulGetSUIWalletAddress");
        //set active wallet address 
        if (updateUserLevelDto.suiWallet != "")
        {
            LoadingScreen.SetActive(true);
            SuiWallet.ActiveWalletAddress = updateUserLevelDto.suiWallet;
            UserData.UserName = updateUserLevelDto.username;
            UserData.currentLevel = updateUserLevelDto.level;
            SceneManager.LoadSceneAsync(SceneManager.GetActiveScene().buildIndex + 1);
        }
        else
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = "Please try after some time.";
        }
    }

    private void isUserNameSaved(CheckUsernameResponseDto checkUsernameResponseDto)
    {
        Debug.Log(UserData.UserName + " || " + UserName.text + " - isUserNameSaved : " + checkUsernameResponseDto.exists);
        UserData.UserName = UserName.text;
        if (!checkUsernameResponseDto.exists)
        {
            ErrorScreen.SetActive(true);
            txtError_ErrorScreen.text = "Some issue occured during verification of your account.\nPlease Try again after some time.";
        }
        else
        {
            LoadingScreen.SetActive(true);
            SceneManager.LoadSceneAsync(SceneManager.GetActiveScene().buildIndex + 1);
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

    private void OnErrorGetUserSUIAddress(string error)
    {
        this.ShowError(error);
        GoogleAnalytics.Instance.SendError(error, "GetUserSUIAddress");
    }

    private void ShowError(string error)
    {
        LoadingScreen.SetActive(false);
        ErrorScreen.SetActive(true);
        txtError_ErrorScreen.text = error;
    }

    #endregion
}
