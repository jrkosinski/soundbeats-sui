using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class GoogleAnalytics : Singleton<GoogleAnalytics>
{
    private const string TrackingID = "G-ZC639JTDEW";

    public void SendError(string errorMessage, string action = "")
    {
        SendEvent("error", action, errorMessage);
    }

    public void SendGameStart(string songName)
    {
        SendEvent("gameplay", "gameStart", songName);
    }

    public void SendPlayerWin(int score, int duration)
    {
        SendEvent("gameplay", "gameResult", "W " + duration.ToString(), score);
    }

    public void SendPlayerLost(int score, int duration)
    {
        SendEvent("gameplay", "gameResult", "L " + duration.ToString(), score);
    }

    public void SendSelectedCharacter(string charName)
    {
        SendEvent("gameplay", "selectedCharacter", charName);
    }

    public void SendSelectedSong(string songName)
    {
        SendEvent("gameplay", "selectedSong", songName);
    }

    public void SendMintedTokens(string walletAddress, int quantity)
    {
        SendEvent("minting", "mintTokens", walletAddress + ":" + quantity.ToString());
    }

    public void SendMintedNFT(string walletAddress, string nftAddress)
    {
        SendEvent("minting", "mintNft", walletAddress + ":" + nftAddress);
    }

    public void SendEvent(string category, string action, string label, int value = 0)
    {
        try
        {
            CallSendGTag(category, action, label, value);
        }
        catch (Exception e)
        {
            Debug.Log(e.Message);
        }
    }

    public void CallSendGTag(string category, string action, string label, int value = 0)
    {
        Debug.Log("GA TAG : category : " + category + " - action : " + action + " - label : " + label);
    }
}
