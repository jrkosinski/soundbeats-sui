using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.Networking;
using System;
using Newtonsoft.Json;
using Unity.VisualScripting;
using System.Text;

/// <summary>
/// This class store server config keys and urls.
/// </summary>
public class ServerConfig
{
    // URL with place to put API method in it.
    public const string SERVER_API_URL_FORMAT = "http://{0}/{1}";
    public const string API_POST_CREATE_NFT = "api/v1/nfts";
    public const string API_POST_REQUEST_NFT = "api/v1/nfts/request";
    public const string API_POST_REQUEST_PRIVATE_TOKEN = "api/v1/token";
    public const string API_GET_PRIVATE_TOKEN_BALANCE = "api/v1/token?wallet=";
    public const string API_GET_BEATS_NFTS = "api/v1/nfts?wallet=";
    public const string API_VERIFY_SIGNATURE = "api/v1/verify?address={0}&signature={1}&message={2}";
    public const string API_POST_AUTH_SESSION = "api/v1/auth";
    public const string API_POST_VERIFY = "api/v1/verify";
    public const string API_GET_USERNAME = "api/v1/username";
    public const string API_GET_ACCOUNT = "api/v1/accounts?authType=evm&authId=";
    public const string API_POST_LEVEL = "api/v1/level";

    //devnet urls
    public const string API_DOMAIN_DEVNET = "54.95.68.79:3000";

    //testnet urls 
    public const string API_DOMAIN_TESTNET = "54.95.68.79:3000";

    //mainnet urls 
    public const string API_DOMAIN_MAINNET = "54.95.68.79:3000";

    //URL of Leaderboard and NFT
    public const string API_POST_LEADERBOARD = "api/v1/leaderboard";
    public const string API_GET_LEADERBOARD = "api/v1/leaderboard";

    public static string GetServerDomain()
    {
        return API_DOMAIN_TESTNET;
    }

    public static string FormatServerUrl(string path = "")
    {
        return String.Format(ServerConfig.SERVER_API_URL_FORMAT, GetServerDomain(), path);
    }
}

public class NetworkManager : Singleton<NetworkManager>
{
    #region API Methods

    /// <summary>
    /// Calls the API to mint an NFT to a user.
    /// </summary>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void CreateNFT(CreateNFTRequestDto body, UnityAction<CreateNFTResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        var json = JsonConvert.SerializeObject(body);
        Debug.Log("Json   " + json);
        var dictionary = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
        //Debug.Log("Dictionary  " + dictionary["signature"]);
        StartCoroutine(SendPostRequest(ServerConfig.FormatServerUrl(ServerConfig.API_POST_CREATE_NFT),
            callbackOnSuccess,
            callbackOnFail, json));
        //SendRequest(
        //    ServerConfig.FormatServerUrl(ServerConfig.API_POST_CREATE_NFT),
        //    callbackOnSuccess,
        //    callbackOnFail,
        //    "post",
        //    dictionary
        //);
    }

    /// <summary>
    /// Calls the API to grant tokens to the user. 
    /// </summary>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void RequestToken(RequestTokenDto body, UnityAction<RequestTokenResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        var json = JsonConvert.SerializeObject(body);
        var dictionary = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
        Debug.Log(json);
        Debug.Log(dictionary.ContainsKey("signature"));
        foreach (KeyValuePair<string, string> items in dictionary)
        {
            Debug.Log("You have " + items.Value + " " + items.Key);
        }
        SendRequest(
            ServerConfig.FormatServerUrl(ServerConfig.API_POST_REQUEST_PRIVATE_TOKEN),
            callbackOnSuccess,
            callbackOnFail,
            "postToken",
            dictionary
        );
    }

    /// <summary>
    /// Calls the API to query the user's token balance.
    /// </summary>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void GetTokenBalance(string wallet, UnityAction<GetTokenBalanceResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        Debug.Log(ServerConfig.API_GET_PRIVATE_TOKEN_BALANCE + wallet);

        SendRequest(
            ServerConfig.FormatServerUrl(ServerConfig.API_GET_PRIVATE_TOKEN_BALANCE + wallet),
            callbackOnSuccess,
            callbackOnFail,
            "get"
        );
    }

    /// <summary>
    /// Gets the list of unique NFT types owned by the given wallet.
    /// </summary>
    /// <param name="wallet">Wallet address to query for NFTs</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void GetUserOwnedBeatsNfts(string wallet, UnityAction<GetBeatsNftsResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        Debug.Log(ServerConfig.API_GET_BEATS_NFTS + wallet);

        SendRequest(
            ServerConfig.FormatServerUrl(ServerConfig.API_GET_BEATS_NFTS + wallet),
            callbackOnSuccess,
            callbackOnFail,
            "get"
        );
    }

    /// <summary>
    /// Gets the SUI address for the EVM wallet.
    /// </summary>
    /// <param name="authId">EVM Wallet address to get SUI Address</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void GetUserSUIAddress(string wallet, UnityAction<VerifySignatureResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        Debug.Log(ServerConfig.API_GET_ACCOUNT + wallet);

        SendRequest(
            ServerConfig.FormatServerUrl(ServerConfig.API_GET_ACCOUNT + wallet),
            callbackOnSuccess,
            callbackOnFail,
            "get"
        );
    }

    /// <summary>
    /// Calls the API to verify a signature passed in from the Javascript front end (from the user's wallet). 
    /// </summary>
    /// <param name="body">Request body containing address, signature, and original message</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void VerifySignature(VerifySignatureDto body, UnityAction<VerifySignatureResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        SendRequest(
            ServerConfig.FormatServerUrl(String.Format(ServerConfig.API_VERIFY_SIGNATURE, body.address, body.signature, body.message)
        ), callbackOnSuccess, callbackOnFail, "get");
    }

    /// <summary>
    /// Sends the latest score for the given user to the leaderboard. 
    /// </summary>
    /// <param name="wallet">User's wallet address</param>
    /// <param name="score">The score to send</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void SendLeaderboardScore(string wallet, int score, UnityAction<LeaderboardScoreDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        CreateLeaderboardDto body = new CreateLeaderboardDto();
        body.authType = "evm";
        body.score = score;
        body.authId = UserData.WalletAddress;
        print("body.wallet : " + body.authId + " - body.score : " + body.score);
        SendLeaderboardScore(body, callbackOnSuccess, callbackOnFail);
    }

    /// <summary>
    /// Sends the latest score for the given user to the leaderboard. 
    /// </summary>
    /// <param name="body">The body of the post.</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void SendLeaderboardScore(CreateLeaderboardDto body, UnityAction<LeaderboardScoreDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        var json = JsonConvert.SerializeObject(body);
        var dictionary = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
        print("json : " + json + " - dictionary : " + dictionary.ToSafeString());
        //SendRequest(ServerConfig.FormatServerUrl(ServerConfig.API_POST_LEADERBOARD), callbackOnSuccess, callbackOnFail, "post", dictionary);
        StartCoroutine(SendPostRequest(ServerConfig.FormatServerUrl(ServerConfig.API_POST_LEADERBOARD), callbackOnSuccess, callbackOnFail, json));
    }

    /// <summary>
    /// Retrieves the current leaderboard data from the server. 
    /// </summary>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void GetLeaderboard(UnityAction<LeaderboardResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        Debug.Log(ServerConfig.API_GET_LEADERBOARD);

        SendRequest(
            ServerConfig.FormatServerUrl(ServerConfig.API_GET_LEADERBOARD),
            callbackOnSuccess,
            callbackOnFail,
            "get"
        );
    }

    #endregion

    #region EVM Auth & Login

    /// <summary>
    /// Starts an auth session, which will return the message to be signed for verification, and a session ID. 
    /// </summary>
    /// <param name="evmWallet">User's EVM wallet address</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void StartAuthSession(string evmWallet, UnityAction<StartAuthSessionResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        StartAuthSessionDto body = new StartAuthSessionDto();
        var json = "{\"evmWallet\":\"" + evmWallet + "\"}";
        print(json);
        StartCoroutine(SendPostRequest(ServerConfig.FormatServerUrl(ServerConfig.API_POST_AUTH_SESSION), callbackOnSuccess, callbackOnFail, json));
    }

    /// <summary>
    /// Starts an auth session, which will return the message to be signed for verification, and a session ID. 
    /// </summary>
    /// <param name="level">User's Level</param>
    /// <param name="evmWallet">User's EVM wallet address</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void postLevel(int level, string evmWallet, UnityAction<UpdateUserLevelDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        StartAuthSessionDto body = new StartAuthSessionDto();
        var json = "{\"authId\":\"" + evmWallet + "\",\"authType\":\"evm\",\"level\": " + level + " }";
        print(json);
        StartCoroutine(SendPostRequest(ServerConfig.FormatServerUrl(ServerConfig.API_POST_LEVEL), callbackOnSuccess, callbackOnFail, json));
    }

    IEnumerator SendPostRequest<T>(string url, UnityAction<T> callbackOnSuccess, UnityAction<string> callbackOnFail, string jsonReqData = null)
    {
        print(url);
        print(jsonReqData);
        // Create a UnityWebRequest object
        UnityWebRequest request = new UnityWebRequest(url, "POST");

        // Set request headers
        request.SetRequestHeader("Content-Type", "application/json");

        // Convert JSON string to byte array
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonReqData);


        // Set request body
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();

        // Send the request
        yield return request.SendWebRequest();

        // Check for errors
        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError(request.ToSafeString());
            Debug.LogError(request.error);
            Debug.LogError(request.error.ToSafeString());
            Debug.LogError(request.result.ToSafeString());
            Debug.LogError(request.downloadHandler.text);
            callbackOnFail?.Invoke(request.error);
        }
        else
        {
            // Print the response body
            Debug.Log("Response: " + request.downloadHandler.text);
            ParseResponse(request.downloadHandler.text, callbackOnSuccess, callbackOnFail);
        }
    }


    /// <summary>
    /// Starts an auth session, which will return the message to be signed for verification, and a session ID. 
    /// </summary>
    /// <param name="evmWallet">User's EVM wallet address</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void VerifyAuthSession(AuthVerifyDto body, UnityAction<VerifySignatureResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        var json = JsonConvert.SerializeObject(body);
        StartCoroutine(SendPostRequest(ServerConfig.FormatServerUrl(ServerConfig.API_POST_VERIFY), callbackOnSuccess, callbackOnFail, json));
    }

    /// <summary>
    /// Starts an auth session, which will return the message to be signed for verification, and a session ID. 
    /// </summary>
    /// <param name="evmWallet">User's EVM wallet address</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    public void CheckUsername(string username, UnityAction<CheckUsernameResponseDto> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        Debug.Log(ServerConfig.API_GET_USERNAME + "?username=" + username);

        SendRequest(
            ServerConfig.FormatServerUrl(ServerConfig.API_GET_USERNAME + "?username=" + username),
            callbackOnSuccess,
            callbackOnFail,
            "get"
        );
    }

    #endregion

    #region Server Communication

    /// <summary>
    /// This method is used to begin the async sending request process.
    /// </summary>
    /// <param name="url">API url.</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    /// <typeparam name="T">Data Model Type.</typeparam>
    private void SendRequest<T>(string url, UnityAction<T> callbackOnSuccess, UnityAction<string> callbackOnFail, string reqType, Dictionary<string, string> body = null, string jsonReqData = null)
    {
        print(reqType + " - " + url);
        if (reqType == "post")
        {
            StartCoroutine(RequestCoroutine_Post(url, callbackOnSuccess, callbackOnFail, body, jsonReqData));
        }
        else if (reqType == "postToken")
        {
            StartCoroutine(RequestTokenCoroutine_Post(url, callbackOnSuccess, callbackOnFail, body));
        }
        else
        {
            StartCoroutine(RequestCoroutine_Get(url, callbackOnSuccess, callbackOnFail));
        }
    }

    /// <summary>
    /// Coroutine that handles communication with REST server For GET Request.
    /// </summary>
    /// <returns>The coroutine.</returns>
    /// <param name="url">API url.</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    /// <typeparam name="T">Data Model Type.</typeparam>
    private IEnumerator RequestCoroutine_Get<T>(string url, UnityAction<T> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        using (var request = UnityWebRequest.Get(url))
        {
            yield return request.SendWebRequest();
            if (request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError || request.result == UnityWebRequest.Result.DataProcessingError)
            {
                Debug.LogError(request.error);
                callbackOnFail?.Invoke(request.error);
            }
            else
            {
                Debug.Log(request.downloadHandler.text);
                ParseResponse(request.downloadHandler.text, callbackOnSuccess, callbackOnFail);
            }
        }
    }

    /// <summary>
    /// Coroutine that handles communication with REST server for POST request.
    /// </summary>
    /// <returns>The coroutine.</returns>
    /// <param name="url">API url.</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    /// <typeparam name="T">Data Model Type.</typeparam>
    private IEnumerator RequestCoroutine_Post<T>(string url, UnityAction<T> callbackOnSuccess, UnityAction<string> callbackOnFail, Dictionary<string, string> body, string jsonReqData)
    {
        WWWForm form = new WWWForm();

        if (body != null)
        {
            foreach (KeyValuePair<string, string> post_arg in body)
            {
                //Debug.Log("key  " + post_arg.Key + "  value " + post_arg.Value);
                form.AddField(post_arg.Key, post_arg.Value);
            }
            body.Clear();
        }

        if (jsonReqData != null)
        {
            print(jsonReqData);
            byte[] byteArray = Encoding.UTF8.GetBytes(jsonReqData);
            form.AddBinaryData("body", byteArray);
        }

        using (var request = UnityWebRequest.Post(url, form))
        {

            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError || request.result == UnityWebRequest.Result.DataProcessingError)
            {
                Debug.LogError(" " + request.error + " -> " + request.isNetworkError + " || " + request.isHttpError + " || " + request.responseCode);
                callbackOnFail?.Invoke(request.error);
            }
            else
            {
                Debug.Log(request.downloadHandler.text);
                ParseResponse(request.downloadHandler.text, callbackOnSuccess, callbackOnFail);
            }

        }
    }

    public class BasicPostRequestBody
    {
        public int amount { get; set; }
        public string recipient { get; set; }
    }

    /// <summary>
    /// Coroutine that handles communication with REST server for POST request.
    /// </summary>
    /// <returns>The coroutine.</returns>
    /// <param name="url">API url.</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    /// <typeparam name="T">Data Model Type.</typeparam>
    private IEnumerator RequestTokenCoroutine_Post<T>(string url, UnityAction<T> callbackOnSuccess, UnityAction<string> callbackOnFail, Dictionary<string, string> body)
    {
        BasicPostRequestBody form = new BasicPostRequestBody();
        int index = 0;

        foreach (KeyValuePair<string, string> post_arg in body)
        {
            Debug.Log("key   " + post_arg.Key + "   value  " + post_arg.Value);
            if (index == 0)
            {
                form.amount = int.Parse(post_arg.Value);
                index++;
            }
            else
                form.recipient = post_arg.Value;
        }
        Debug.Log("key   " + form.amount + "   value  " + form.recipient);

        using (var request = new UnityWebRequest(url, UnityWebRequest.kHttpVerbPOST))
        {
            string json = JsonConvert.SerializeObject(form);
            byte[] bodyRaw = new System.Text.UTF8Encoding().GetBytes(json);

            Debug.Log(bodyRaw);
            Debug.Log(json);

            request.uploadHandler = (UploadHandler)new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = (DownloadHandler)new DownloadHandlerBuffer();
            request.SetRequestHeader("Accept", "application/json");
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            Debug.Log("Status Code: " + request.responseCode);
            if (request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError || request.result == UnityWebRequest.Result.DataProcessingError)
            {
                Debug.LogError(request.error);
                callbackOnFail?.Invoke(request.error);
            }
            else
            {
                Debug.Log(request.downloadHandler.text);
                ParseResponse(request.downloadHandler.text, callbackOnSuccess, callbackOnFail);
            }
        }
    }

    /// <summary>
    /// This method finishes request process as we have received answer from server.
    /// </summary>
    /// <param name="data">Data received from server in JSON format.</param>
    /// <param name="callbackOnSuccess">Callback on success.</param>
    /// <param name="callbackOnFail">Callback on fail.</param>
    /// <typeparam name="T">Data Model Type.</typeparam>
    private void ParseResponse<T>(string data, UnityAction<T> callbackOnSuccess, UnityAction<string> callbackOnFail)
    {
        var parsedData = JsonUtility.FromJson<T>(data);
        Debug.Log(data);
        Debug.Log(parsedData);
        callbackOnSuccess?.Invoke(parsedData);
    }

    #endregion
}

#region Request/Response DTO Classes 

[Serializable]
public class CreateNFTRequestDto
{
    public string name;// Name of the NFT
    public string imageUrl;//URL of the NFT image
    public int quantity; //default: 1    Number of NFT to be minted
    public string recipient; //The address of the recipient
}

[Serializable]
public class CreateNFTResponseDto
{
    public string signature;//The signature of the transaction
    public string[] addresses;//The list of NFT addresses minted
}

[Serializable]
public class RequestTokenDto
{
    public int amount;//The amount of the token
    public string recipient;//The address of the recipient
}

[Serializable]
public class RequestTokenResponseDto
{
    public string signature;//The signature of the transaction
}

[Serializable]
public class BeatsNftDto
{
    public string name;
    public string address;
}

[Serializable]
public class GetBeatsNftsResponseDto
{
    public BeatsNftDto[] nfts;
}

[Serializable]
public class GetTokenBalanceResponseDto
{
    public int balance;//The balance of the wallet
}

[Serializable]
public class VerifySignatureDto
{
    public string address;
    public string signature;
    public string message;
}

[Serializable]
public class VerifySignatureResponseDto
{
    public bool verified;
    public bool completed;
    public string wallet;
    public string suiWallet;
    public string username;
    public int level;
    public string failureReason;
}

[Serializable]
public class CreateLeaderboardDto
{
    public string authId;
    public string authType;
    public int score;
}

[Serializable]
public class LeaderboardScoreDto
{
    public string wallet;
    public int score;
    public string username;
}

[Serializable]
public class LeaderboardResponseDto
{
    public LeaderboardScoreDto[] scores;
}

[Serializable]
public class AuthVerifyDto
{
    public string wallet;
    public string walletType; // 'evm' or 'sui' 
    public string action; // 'update' or 'verify' 
    public string sessionId;
    public string messageToSign;
    public string signature;
    public string username;
}

[Serializable]
public class AuthVerifyResponseDto
{
    public bool verified;
    public string wallet;
    public string failureReason;
}

[Serializable]
public class StartAuthSessionDto
{
    public string evmWallet;
}

[Serializable]
public class StartAuthSessionResponseDto
{
    public string username;
    public string sessionId;
    public string messageToSign;
}

[Serializable]
public class CheckUsernameResponseDto
{
    public bool exists;
}

[Serializable]
public class UpdateUserLevelDto
{
    public string suiWallet;
    public string status;
    public string username;
    public int level;
}

#endregion
