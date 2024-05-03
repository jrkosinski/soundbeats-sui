using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;
using System;
using UnityEngine.UI;
using System.Linq;
using Unity.VisualScripting;

public class GetLeaderboard : Singleton<GetLeaderboard>
{
    public GameObject prefabObj;
    public Transform playerDataContent;

    [Header("BEATMAP")]
    public GameObject prefabBeatObj;
    public SelectSong songPrefab;
    public Transform contentParent;
    public SongDataSet songDataSet;
    void Start()
    {
    }

    /// <summary>
    /// This method kicks off the process of calling the API method to get leaderboard scores, and displaying them 
    /// in the display table. 
    /// </summary>
    [ContextMenu("Get Leaderboard")]
    public void GetLeaderboardAPI()
    {
        NetworkManager.Instance.GetLeaderboard(OnGetLeaderboardsSuccess, OnGetLeaderboardError);
    }

    public void GetBeatmapLeaderboardAPI()
    {
        NetworkManager.Instance.GetLeaderboard(OnGetBeatmapLeaderboardsSuccess, OnGetLeaderboardError);
    }
    /// <summary>
    /// Clears the UI row items in the leaderboard display table. 
    /// </summary>
    private void ClearList()
    {
        foreach (Transform s in playerDataContent.transform)
        {
            Destroy(s.gameObject);
        }
    }

    /// <summary>
    /// Adds the items in the given response to the UI table as rows. 
    /// </summary>
    /// <param name="response">Response from API call to get leaderboard scores.</param>
    private void DisplayList(LeaderboardResponseDto response)
    {
        var scores = response.scores.OrderBy(s => s.score).Reverse().ToArray();
        for (int i = 0; i < scores.Length; i++)
        {
            var score = scores[i];
            var dataObject = Instantiate(prefabObj, playerDataContent);
            dataObject.GetComponent<Image>().color = SuiWallet.ActiveWalletAddress == score.wallet ? Color.green : Color.grey;
            dataObject.transform.GetChild(0).GetComponent<Text>().text = (i + 1) + ")";
            dataObject.transform.GetChild(1).GetComponent<Text>().text = score.username == "" ? UserData.UserName : score.username.ToString();
            dataObject.transform.GetChild(3).GetComponent<Text>().text = score.score.ToString();
        }
    }

    private void DisplayListBeat(LeaderboardResponseDto response)
    {
        //var scores = response.scores.OrderBy(s => s.score).Reverse().ToArray();
        //for (int i = 0; i < scores.Length; i++)
        //{
        //    var score = scores[i];
        //    var dataObject = Instantiate(prefabBeatObj, parentObj);
        //    dataObject.GetComponent<Image>().color = SuiWallet.ActiveWalletAddress == score.wallet ? Color.green : Color.grey;
        //    dataObject.transform.GetChild(0).GetComponent<Text>().text = (i + 1) + ")";
        //    dataObject.transform.GetChild(1).GetComponent<Text>().text = "songname_" + UserData.UserName + "_beatmap";
        //    // Add listener to button here if needed
        //}
        for (int i = 0; i < songDataSet.Songs.Length; i++)
        {
            SongData songData = songDataSet.Songs[i];
            SelectSong newSongObject = Instantiate(songPrefab, contentParent);
            newSongObject.transform.GetChild(0).GetComponent<Image>().sprite = songData.currentSong.SongImage;
            //newSongObject.transform.GetChild(0).GetComponent<Text>().text = i + 1 + ")";
            newSongObject.transform.GetChild(2).GetComponent<Text>().text = songData.currentSong.name + "_" + UserData.UserName + "_" + "beatmap";
            Debug.Log(songData.currentSong.name);
            newSongObject.LevelNumber = i + 1;
        }
    }

    /// <summary>
    /// Executes when the API call to get leaderboard scores succeeds. 
    /// </summary>
    /// <param name="response">API response object</param>
    private void OnGetLeaderboardsSuccess(LeaderboardResponseDto response)
    {
        ClearList();
        DisplayList(response);
    }
    private void OnGetBeatmapLeaderboardsSuccess(LeaderboardResponseDto response)
    {
        ClearList();
        DisplayListBeat(response);
    }
    /// <summary>
    /// Executes when the API call to get leaderboard scores fails.
    /// </summary>
    /// <param name="error">Error message</param>
    private void OnGetLeaderboardError(string error)
    {
        //TODO: (MED) do on error? 
    }

    public void openLeaderboard()
    {
        UIController.instance.LeaderboardScreen.SetActive(true);
        GameManager.instance.producer = false;
    }
}