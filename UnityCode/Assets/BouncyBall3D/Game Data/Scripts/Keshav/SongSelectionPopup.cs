using DG.Tweening;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class SongSelectionPopup : Singleton<SongSelectionPopup>
{
    public Text Name;
    public Image ThumbnailImage;
    public Text AutherName;
    public Text Length;
    public Song _song;
    public SongDataSet _songDataSet;
    public GameObject InfoPanel;
    private bool canWaitForFewSec = true;

    public void setData(int songIndex = 0, bool canWait = true)
    {
        canWaitForFewSec = canWait;
        if (GameManager.instance.producer == false)
        {
            Name.text = _songDataSet.Songs[songIndex].currentSong.name;
            AutherName.text = _songDataSet.Songs[songIndex].ExtraInfo;
            float totalSeconds = _songDataSet.Songs[songIndex].currentSong.song.length;
            float minutes = Mathf.Floor(totalSeconds / 60f);
            float seconds = totalSeconds % 60f;
            string formattedTime = string.Format("{0:00}:{1:00} mins", minutes, seconds);
            Length.text = formattedTime;
            _song = _songDataSet.Songs[songIndex].currentSong;
            ThumbnailImage.sprite = _song.SongImage;
            //StartCoroutine(DisplayPopup());
            Debug.Log("TestProducerFalse " + canWaitForFewSec);
            InfoPanel.SetActive(true);
            Player.instance.levelSelectorPlayer.SetActive(false);
        }
        if (GameManager.instance.producer == true)
        {
            Name.text = _songDataSet.Songs[songIndex].currentSong.name;
            AutherName.text = _songDataSet.Songs[songIndex].ExtraInfo;
            float totalSeconds = _songDataSet.Songs[songIndex].currentSong.song.length;
            float minutes = Mathf.Floor(totalSeconds / 60f);
            float seconds = totalSeconds % 60f;
            string formattedTime = string.Format("{0:00}:{1:00} mins", minutes, seconds);
            Length.text = formattedTime;
            _song = _songDataSet.Songs[songIndex].currentSong;
            ThumbnailImage.sprite = _song.SongImage;
            setProducerSongIndex = songIndex;
            //StartCoroutine(DisplayPopup());
            InfoPanel.SetActive(true);
            Player.instance.levelSelectorPlayer.SetActive(false);
        }
    }

    public IEnumerator DisplayPopup()
    {
        Debug.Log("DisplayPopup: " + canWaitForFewSec);
        if (canWaitForFewSec)
        {
            yield return new WaitForSeconds(0.2f);
            Debug.Log("DisplayPopup If: " + canWaitForFewSec);
            InfoPanel.SetActive(true);
            Player.instance.levelSelectorPlayer.SetActive(false);
        }
        else
        {
            Debug.Log("DisplayPopup Else: " + canWaitForFewSec);
            InfoPanel.SetActive(true);
            Player.instance.levelSelectorPlayer.SetActive(false);
        }
    }
    private int setProducerSongIndex = 0;
    public void closePopupAndStartGame()
    {
        if (GameManager.instance.producer == false)
        {
            //SceneManager.LoadScene("LoadingSceneForPlaying");
            GoogleAnalytics.Instance.SendGameStart(_song.name);
            Debug.Log("PlaySong " + _song.name);
            SceneManager.LoadSceneAsync(SceneManager.GetActiveScene().buildIndex + 3);
            DontDestroyOnLoad(GameManager.instance.gameObject);
            DontDestroyOnLoad(LevelGenerator.Instance.gameObject);
            DontDestroyOnLoad(SoundManager._Instance.gameObject);
            DontDestroyOnLoad(SavingHandler.Instance.gameObject);
            DontDestroyOnLoad(AudioVisualizeManager.instance.gameObject);
            DontDestroyOnLoad(Player.instance.gameObject);
            CameraFollow.instance.target = Player.instance.gameObject.transform;
            Player.instance.ResetPlayer();
            LevelGenerator.Instance.currentSong = _song;

        }
        if (GameManager.instance.producer == true)
        {
            GoogleAnalytics.Instance.SendProducerStart(_song.name);
            LevelGenerator.Instance.currentSong = _song;
            GameManager.instance.SelectSong(setProducerSongIndex);
            DontDestroyOnLoad(GameManager.instance.gameObject);
            DontDestroyOnLoad(LevelGenerator.Instance.gameObject);
            DontDestroyOnLoad(AudioVisualizeManager.instance.gameObject);
            InfoPanel.SetActive(false);
            SceneManager.LoadScene("LoadingSceneForProducer");
            AudioVisualizeManager.instance.audioSource.clip = LevelGenerator.Instance.currentSong.song;
        }
    }

    public void closePopup()
    {
        Player.instance.levelSelectorPlayer.SetActive(true);
    }

}
