using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using Firebase;
using Firebase.Analytics;
using Firebase.Extensions;
using System.Collections.Generic;
using Unity.VisualScripting;

public class GoogleAnalytics : Singleton<GoogleAnalytics>
{
    private bool isAnalyticsEnabled = true;

    private void Start()
    {
        FirebaseApp.CheckAndFixDependenciesAsync().ContinueWithOnMainThread(task =>
        {
            var dependencyStatus = task.Result;
            Debug.Log("Firebase dependencyStatus : " + dependencyStatus.ToString());
            if (dependencyStatus == DependencyStatus.Available)
            {
                isAnalyticsEnabled = true;
                FirebaseAnalytics.SetAnalyticsCollectionEnabled(true);
                Debug.Log("Firebase Analytics enabled successfully.");
                SendEvent(FirebaseAnalytics.EventAppOpen, FirebaseAnalytics.ParameterDestination, UnityEngine.SceneManagement.SceneManager.GetActiveScene().name);
            }
            else
            {
                Debug.LogError(System.String.Format("Could not resolve all Firebase dependencies: {0}", dependencyStatus));
            }
        });

    }

    public void SendError(string errorMessage, string action = "")
    {
        SendEvent("error", action, errorMessage);
    }

    public void SendLoginEvent(string WalletAddress, String UserName)
    {
        FirebaseAnalytics.SetUserProperty(FirebaseAnalytics.UserPropertySignUpMethod, "walletLogin");
        FirebaseAnalytics.SetUserId(WalletAddress);
        SendEvent(FirebaseAnalytics.EventLogin, "walletLogin", UserName + " - " + WalletAddress);
    }

    public void SendFakeWalletLogin(string deviceData)
    {
        SendEvent(FirebaseAnalytics.EventLogin, "FakeLogin", deviceData);
    }

    public void SendGameStart(string songName)
    {
        SendEvent(FirebaseAnalytics.EventLevelStart, new Parameter(FirebaseAnalytics.ParameterScreenName, "Game"), new Parameter(FirebaseAnalytics.ParameterLevelName, songName));
    }

    public void SendProducerStart(string songName)
    {
        SendEvent(FirebaseAnalytics.EventLevelStart, new Parameter(FirebaseAnalytics.ParameterScreenName, "Producer"), new Parameter(FirebaseAnalytics.ParameterLevelName, songName));
    }

    public void SendPlayerWin(int score, int duration)
    {
        SendEvent(FirebaseAnalytics.EventLevelEnd, new Parameter(FirebaseAnalytics.ParameterScore, score), new Parameter(FirebaseAnalytics.ParameterValue, "W " + duration.ToString()));
    }

    public void SendPlayerLost(int score, int duration)
    {
        SendEvent(FirebaseAnalytics.EventLevelEnd, new Parameter(FirebaseAnalytics.ParameterScore, score), new Parameter(FirebaseAnalytics.ParameterValue, "L " + duration.ToString()));
    }

    public void SendSelectedCharacter(string charName)
    {
        SendEvent(FirebaseAnalytics.EventSelectItem, FirebaseAnalytics.ParameterCharacter, charName);
    }

    public void SendMintedTokens(string walletAddress, int quantity)
    {
        SendEvent(FirebaseAnalytics.EventSpendVirtualCurrency, FirebaseAnalytics.ParameterLocation, walletAddress + ":" + quantity.ToString());
    }

    public void SendMintedNFT(string walletAddress, string nftAddress)
    {
        SendEvent(FirebaseAnalytics.EventSpendVirtualCurrency, FirebaseAnalytics.ParameterLocation, walletAddress + ":" + nftAddress);
    }

    public void SendEvent(string category, string action, string label)
    {
        try
        {
            FirebaseAnalytics.LogEvent(category, action, label);
            Debug.Log("GA TAG : category : " + category + " - action : " + action + " - label : " + label);
        }
        catch (Exception e)
        {
            Debug.Log("GA TAG message :" + e.Message);
        }
    }

    private void SendEvent(string eventLevelStart, Parameter parameter1, Parameter parameter2)
    {
        try
        {

            FirebaseAnalytics.LogEvent(
   eventLevelStart,
   parameter1,
   parameter2);

            Debug.Log("GA TAG : category : " + eventLevelStart + " - parameter1 : " + parameter1.ToSafeString() + " - parameter2 : " + parameter2.ToSafeString());
        }
        catch (Exception e)
        {
            Debug.Log("GA TAG message :" + e.Message);
        }
    }
}