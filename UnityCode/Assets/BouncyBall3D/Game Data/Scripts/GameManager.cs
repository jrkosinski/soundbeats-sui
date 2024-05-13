using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Collections.Generic;
using UnityEditor;
using System.Reflection;
using Unity.VisualScripting;

public class GameManager : Singleton<GameManager>
{
    public int score = 0;
    public int star = 0;
    public GameObject gameStartText;

    private int gameSpeed = 1;
    public float GameSpeed => ((gameSpeed - 1) * 0.2f) + 1;
    public GameState CurrentGameState => gameState;
    private System.DateTime gameStartTime;

    public GameState gameState;
    public bool isSpeedupActive = false;
    public Player player;
    float songProgress = 0;
    public bool isPausePopupOpen = false;
    int tempTokenAmount = 0;
    private int previousGameSpeed = 0;

    [Header("UI")]

    public Image levelProgress;
    public PowerupProgress powerupTimer;
    public Text scoreText;
    public Animator scoreAnim;
    public GameObject revivePanel, Winpanel;
    [Space]
    public Text songName;
    public Text BestScoreForWinPanel, scoreForWinPanel, scoreTokenForWinPanel;
    public Image[] stars = new Image[3];
    public Color activeStars, inactiveStars;

    public Text BestScoreForLosePanel, scoreForLosePanel, scoreTokenForLosePanel;
    public GameObject quitScreen;
    public GameObject pauseButton;

    public static GameManager instance;
    private void Awake()
    {
        player = FindObjectOfType<Player>();
        instance = this;
    }

    private void Start()
    {
        scoreText.text = score.ToString();
        gameStartText.SetActive(true);
        if (scoreAnim.isActiveAndEnabled)
        {
            scoreAnim.SetTrigger("Up");
        }
        CameraFollow.instance.enabled = true;
        CameraFollow.instance.offset = transform.position - CameraFollow.instance.target.position;
    }

    private void Update()
    {
        if (AudioVisualizeManager.instance.audioSource.isPlaying)
        {
            UpdateSongRemainingTime();
        }
        //if (Input.GetKeyDown(KeyCode.L))
        //{
        //   SceneManager.LoadScene(0);
        //}
    }

    public int GetGameDuration()
    {
        return (int)System.DateTime.Now.Subtract(this.gameStartTime).TotalSeconds;
    }

    public void PlayerWin()
    {
        gameState = GameState.Win;
        //WinPanel.SetActive(true);
        //revivePanel.SetActive(true);
        Winpanel.SetActive(true);
        //replace best score 
        int bestScore = this.GetBestScore(score);

        //UIManager.Instance.ShowHUD(false);
        songName.text = "" + songName.name;
        scoreForWinPanel.text = "" + score;
        scoreTokenForWinPanel.text = score.ToString() + " Tokens";
        BestScoreForWinPanel.text = bestScore.ToString();

        //if (LevelGenerator.Instance.currentSong.stars < star)
        //{
        //    LevelGenerator.Instance.currentSong.stars = star;
        //    LevelGenerator.Instance.currentSong.SaveData();
        //}

        //send score to leaderboard
        if (SuiWallet.HasActiveAddress())
        {
            NetworkManager.Instance.SendLeaderboardScore(
                UserData.WalletAddress,
                score,
                null,
                null
            );
        }

        ShowLevelProgress();
        if (score > PlayerPrefsExtra.GetInt(LevelGenerator.Instance.currentSong.name))
        {
            PlayerPrefsExtra.SetInt(LevelGenerator.Instance.currentSong.name, score);
        }
        PlayerPrefsExtra.Save();
        //LevelGenerator.Instance.currentSong = null;
        Debug.Log("win");
        GoogleAnalytics.Instance.SendPlayerWin(score, this.GetGameDuration());
    }

    public void PlayerFailed()
    {
        //if (ServicesManager.instance != null)
        //{
        //    ServicesManager.instance.ShowInterstitialAdmob();
        //    ServicesManager.instance.ShowInterstitialUnityAds();
        //}
        Debug.Log("SelectIndex...>" + UserData.SelectedNftIndex);
        var myPlayer = player.Selected_character[UserData.SelectedNftIndex].gameObject;
        Debug.Log("PlayerFailed...>" + myPlayer.name);
        gameState = GameState.Lost;
        SoundManager.Instance.StopTrack();
        revivePanel.SetActive(true);
        //UIManager.Instance.ShowHUD(false);

        //if (LevelGenerator.Instance.currentSong.stars < star)
        //{
        //    LevelGenerator.Instance.currentSong.stars = star;
        //    LevelGenerator.Instance.currentSong.SaveData();
        //}

        //replace best score 
        int bestScore = this.GetBestScore(score);
        BestScoreForLosePanel.text = "" + UserData.BestScore;
        scoreForLosePanel.text = "" + score;
        scoreTokenForLosePanel.text = score.ToString() + " Tokens";

        //send score to leaderboard
        if (SuiWallet.HasActiveAddress())
        {
            NetworkManager.Instance.SendLeaderboardScore(
                UserData.WalletAddress,
                score,
                null,
                null
            );
        }

        ShowLevelProgress();
        if (score > PlayerPrefsExtra.GetInt(LevelGenerator.Instance.currentSong.name))
        {
            PlayerPrefsExtra.SetInt(LevelGenerator.Instance.currentSong.name, score);
        }
        //Debug.Log(PlayerPrefsExtra.GetInt(songName.name));

        PlayerPrefsExtra.Save();

        LevelGenerator.Instance.RemovePlatforms();
        //if (score > 0)
        //{
        //    RequestTokenDto requestTokenDto = new RequestTokenDto
        //    {
        //        amount = score,
        //        recipient = SuiWallet.ActiveWalletAddress
        //    };
        //    this.tempTokenAmount = requestTokenDto.amount; //TODO: we really should have the amount be part of the response DTO
        //    NetworkManager.Instance.RequestToken(requestTokenDto, OnSuccessfulRequestPrivateToken, OnErrorRequestPrivateToken);
        //}
        GoogleAnalytics.Instance.SendPlayerLost(score, this.GetGameDuration());
        score = 0;
    }

    private int GetBestScore(int score)
    {
        int bestScore = UserData.BestScore;
        if (score > bestScore)
        {
            bestScore = score;
            UserData.BestScore = bestScore;
        }
        return bestScore;
    }

    private void OnSuccessfulRequestPrivateToken(RequestTokenResponseDto requestTokenResponseDto)
    {
        Debug.Log("RequestPrivateToken successfully updated " + requestTokenResponseDto.signature);
        GoogleAnalytics.Instance.SendMintedTokens(SuiWallet.ActiveWalletAddress, this.tempTokenAmount);
    }

    private void OnErrorRequestPrivateToken(string Error)
    {
        Debug.Log("Error on RequestPrivateToken " + Error);
    }


    void ShowLevelProgress()
    {
        songName.text = LevelGenerator.Instance.currentSong.name;
        //songNameWin.text = LevelGenerator.Instance.currentSong.SongScore.ToString();
        scoreForWinPanel.text = score.ToString();
        //for (int i = 0; i < 3; i++)
        //{
        //    if (i < star)
        //    {
        //        stars[i].color = activeStars;
        //    }
        //    else
        //    {
        //        stars[i].color = inactiveStars;
        //    }
        //}
    }

    void videocomplet(bool copmlet) { }

    [ContextMenu("Revive")]
    public void Revive()
    {
        //Advertisements.Instance.ShowInterstitial();
        Debug.Log("Revive");
        // if (Advertisements.Instance.IsRewardVideoAvailable())
        {
            player.Revive();
            revivePanel.SetActive(false);
            //  Advertisements.Instance.ShowRewardedVideo(videocomplet);
        }
    }

    [ContextMenu("ReviveSucceed")]
    public void ReviveSucceed(bool completed)
    {
        Debug.Log("ReviveSucceed");
        if (completed)
        {
            player.Revive();
            revivePanel.SetActive(false);
        }
    }
    public void HidePopup()
    {
        Debug.Log("HidePopup");
        scoreText.text = "0";
        player.ResetPlayer();
        revivePanel.SetActive(false);
        Winpanel.SetActive(false);
        gameStartText.SetActive(true);
        GameManager.instance.platform.SetActive(true);
        LevelGenerator.Instance.StartWithSong();
    }

    public void StartGame()
    {
        this.gameStartTime = System.DateTime.Now;
        Debug.Log("StartGame" + CurrentGameState);
        if (CurrentGameState == GameState.Menu)
        {
            star = 0;
            gameState = GameState.Gameplay;
            player.StartMoving();
            SoundManager.Instance.PlayMusicFromBeat(player.platformHitCount);
        }
        else if (CurrentGameState == GameState.Lost)
        {
            gameState = GameState.Gameplay;
            player.StartMoving();
            SoundManager.Instance.PlayMusicFromBeat(player.platformHitCount);
        }
        //UIManager.Instance.ShowHUD(true);
        // GoogleAnalytics.Instance.SendGameStart(LevelGenerator.Instance.currentSong.name);
    }
    //public void OpenSongSelectList()
    //{
    //    if (!SongList.activeSelf)
    //    {
    //        SongList.SetActive(true);
    //        OpenSongListbtn.transform.GetChild(0).GetComponent<Text>().text = "Close List";
    //    }
    //    else if (SongList.activeSelf)
    //    {
    //        SongList.SetActive(false);
    //        OpenSongListbtn.transform.GetChild(0).GetComponent<Text>().text = "Open List";
    //    }
    //}

    public void IncreaseGameSpeed()
    {
        if (gameSpeed < 5)
        {
            gameSpeed++;
        }
    }


    public void IncreaseGameSpeedForNSec()
    {
        if (gameState == GameState.Gameplay)
        {
            previousGameSpeed = gameSpeed;
            gameSpeed += 3;
            powerupTimer.gameObject.SetActive(true);
            Invoke("resetGameSpeedToPrevious", PowerUp.powerUpTimer);
        }
    }

    public void resetGameSpeedToPrevious()
    {
        Debug.Log("Resetting to Previous state");
        gameSpeed = previousGameSpeed;
    }
    public void AddScore(bool perfect)
    {
        if (perfect)
        {
            score += 4;
        }
        else
        {
            score += 2;
        }

        scoreText.text = score.ToString();
        scoreAnim.SetTrigger("Up");
    }
    public void UpdateSongProgress(float value)
    {
        songProgress = value;
        levelProgress.fillAmount = Mathf.Lerp(levelProgress.fillAmount, value, 0.1f);
    }

    public void NoThanks()
    {
        //Advertisements.Instance.ShowInterstitial();
    }

    public void onClose()
    {
        // SongHolder.Instance.rhythmdata = null;
        LevelGenerator.Instance.currentSong = null;
        Debug.Log("on close");
        Time.timeScale = 1;
        gameState = GameState.Menu;
        SoundManager.Instance.StopTrack();
        score = 0;
        // LevelGenerator.Instance.RemovePlatforms();
        quitScreen.SetActive(false);
        pauseButton.SetActive(true);
        //HidePopup();
        scoreText.text = "0";
        player.ResetPlayer();
        revivePanel.SetActive(false);
        gameStartText.SetActive(true);
        LevelGenerator.Instance.RemovePlatforms();
        LevelGenerator.Instance.myDataList.dataSave.Clear();
        UIManager.Instance.ShowMainMenu();
        UIController.instance.HomeScreen.SetActive(true);
        UIController.instance.SelectCharacterScreen.SetActive(true);
        levelSelection.SetActive(false);
        Player.instance.characters[Player.instance.characterSelect].SetActive(false);
        platform.SetActive(false);
        player.gameObject.transform.GetChild(8).gameObject.SetActive(false);
    }



    public void onPause()
    {
        isPausePopupOpen = true;
        pauseButton.SetActive(false);
        quitScreen.SetActive(true);
        gameState = GameState.Pause;
        Time.timeScale = 0;
    }

    public void OnSendingToWallet()
    {
        HidePopup();
        UIManager.Instance.ShowNFTWallet();
    }

    public void OnSendingCharacterSelection()
    {
        HidePopup();
        UIManager.Instance.ShowPlayerSelection();
    }

    public void Menu()
    {
        SceneManager.LoadScene("HomeScene");
        //  Advertisements.Instance.ShowInterstitial();
    }

    public IEnumerator GameStartText()
    {
        gameStartText.SetActive(true);
        yield return new WaitForSecondsRealtime(5);
        //gameStartText.SetActive(false);
    }

    public void GameStartTextHide()
    {
        gameStartText.SetActive(false);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////// Level Selection //////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    [Space(25)]
    [Header("          LEVEL_SELECTION")]
    [Space(25)]
    public GameObject levelSelection;
    public Sprite unlockedBGImage;
    public Sprite lockedBGImage;
    public Sprite playableBGFillImage;
    public Sprite unlockedBGFillImage;
    public Sprite lockedBGFillImage;
    public Sprite playableBGImage;
    public RectTransform content;
    public Vector2 Margin;
    int j;
    public float moveSpeed = 1;


    public void LevelSelectButton()
    {
        levelSelection.SetActive(true);
        producer = false;
        sky.SetActive(true);
        //UIController.instance.SuiWalletScreen.SetActive(false);
        UIController.instance.HomeScreen.SetActive(false);
        UIController.instance.SelectCharacterScreen.SetActive(false);
        UIManager.Instance.gameUI.SetActive(false);
        player.gameObject.SetActive(false);
        platform.SetActive(false);
        Player.instance.levelSelectorPlayer.SetActive(true);
    }
    public void LevelSelectToMenu()
    {
        levelSelection.SetActive(false);
        sky.SetActive(false);
        //UIController.instance.SuiWalletScreen.SetActive(true);
        UIController.instance.HomeScreen.SetActive(true);
        UIController.instance.SelectCharacterScreen.SetActive(true);
        UIManager.Instance.gameUI.SetActive(false);
        //playerObj.SetActive(true);
        //platform.SetActive(true);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////// Level Selection //////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////// PRODUCER /////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    [Space(25)]
    [Header("          PRODUCER")]
    [Space(25)]
    public bool producer;
    [Space]

    public GameObject producerSelectSong;
    //[SerializeField] Button OpenSongListbtn;
    public List<Song> songNameCheckForBeatMapJson = new List<Song>();
    public int n;
    public GameObject platform;
    public GameObject mainCamera;
    public Material mainCameraMat;
    public GameObject sky;
    public bool songPlaying = false;
    public Coroutine CRMoveAndStop;

    public void OpenProducer()
    {
        producer = true;
        producerSelectSong.SetActive(true);
    }

    public void CloseProducer()
    {
        producer = false;
        producerSelectSong.SetActive(false);
    }

    public void okBtn()
    {
        mainCamera.SetActive(true);
        UIController.instance.SelectCharacterScreen.SetActive(true);
        platform.SetActive(false);
        pauseButton.SetActive(false);
        gameObject.transform.GetChild(0).gameObject.SetActive(false);
        LevelGenerator.Instance.myDataList.dataSave.Clear();
        LevelGenerator.Instance.currentSong = null;
        gameState = GameState.Menu;
        UIManager.Instance.ShowMainMenu();
        UIController.instance.HomeScreen.SetActive(true);
        UIController.instance.Mint_NFTScreen.SetActive(false);
        UIManager.Instance.gameUI.SetActive(false);
        player.gameObject.SetActive(true);
        //UIController.instance.SuiWalletScreen.SetActive(false);
        AudioVisualizeManager.instance.audioSource.enabled = false;
        foreach (Transform allboxs in SetBox.instance.gameObject.transform)
        {
            Destroy(allboxs.gameObject);
        }
        foreach (Transform t in SetBox.instance.whiteBallParent.transform)
        {
            Destroy(t.gameObject);
        }
        Player.instance.ResetPlayer();
    }

    public void CloseNftPopUp()
    {
        foreach (Transform alljson in LevelGenerator.Instance.FileNameparraent)
        {
            Destroy(alljson.gameObject);
        }
    }

    public void closeBtnProducer()
    {
        Time.timeScale = 0;
    }

    public void onCloseProducer()
    {
        mainCamera.SetActive(true);
        LevelGenerator.Instance.currentSong = null;
        UIController.instance.HomeScreen.SetActive(true);
        UIController.instance.SelectCharacterScreen.SetActive(true);
        SoundManager.Instance.StopTrack();
        platform.SetActive(false);
        Time.timeScale = 1;
        gameState = GameState.Menu;
        AudioVisualizeManager.instance.audioSource.clip = null;
        foreach (Transform t in SetBox.instance.whiteBallParent.transform)
        {
            Destroy(t.gameObject);
        }
        score = 0;
        LevelGenerator.Instance.RemovePlatforms();
        HidePopup();
        producer = false;
        LevelGenerator.Instance.myDataList.dataSave.Clear();
        UIManager.Instance.ShowMainMenu();
        UIController.instance.Mint_NFTScreen.SetActive(false);
        UIManager.Instance.gameUI.SetActive(false);
        gameObject.transform.GetChild(0).gameObject.SetActive(false);
        player.gameObject.SetActive(true);
        //UIController.instance.SuiWalletScreen.SetActive(false);
        AudioVisualizeManager.instance.audioSource.enabled = false;
        foreach (Transform allboxs in SetBox.instance.gameObject.transform)
        {
            Destroy(allboxs.gameObject);
        }
        Debug.Log("Close Producer");
    }


    public void SelectSong(int Num)
    {
        foreach (Transform platformPool in LevelGenerator.Instance.platformPool.transform)
        {
            Debug.Log(platformPool.name);
        }
        foreach (Transform movingPlatformPool in LevelGenerator.Instance.movingPlatformPool.transform)
        {
            Debug.Log(movingPlatformPool.name);
        }

        n = Num;

        //OpenThresoldPanal();
    }

    public void OpenThresoldPanal()
    {
        mainCamera.SetActive(false);
        sky.SetActive(false);
        RenderSettings.skybox = mainCameraMat;
        LevelGenerator.Instance.checkProducer = 0;
        AudioVisualizeManager.instance.audioSource.enabled = true;
        LevelGenerator.Instance.RemovePlatforms();
        UIController.instance.HomeScreen.SetActive(false);
        //UIController.instance.Mint_NFTScreen.SetActive(false);
        producerObj.SetActive(false);
        platform.SetActive(false);
        UIManager.Instance.gameUI.SetActive(false);
        gameObject.transform.GetChild(0).gameObject.SetActive(false);
        player.gameObject.SetActive(false);
        //UIController.instance.SuiWalletScreen.SetActive(false);
        UIController.instance.SelectCharacterScreen.SetActive(false);
        songPlaying = false;
        mainCamera.SetActive(false);
        sky.SetActive(false);
        Player.instance.ResetPlayer();
        Debug.Log("currentSong :-" + LevelGenerator.Instance.currentSong.name);
        AudioVisualizeManager.visualizeManager.audioSource.clip = LevelGenerator.Instance.currentSong.song;
        UpdateSongRemainingTime();
        ////////// End //////////
    }
    public GameObject producerObj;

    public void OnCloseThresoldpanal()
    {
        if (songPlaying == true)
        {
            ShowPlayingPopUp();
        }
        else
        {
            PlaySong();
            //Player.instance.ResetPlayer();
            SetBox.instance.SpawnWhiteBalls();
        }
    }

    public void RegenerateBtn()
    {
        Debug.Log($"<color=green> REGENRATE </color>");

        StopProducer();

        AudioVisualizeManager.visualizeManager.audioSource.Stop();
        LevelGenerator.Instance.myDataList.dataSave.Clear();
        foreach (Transform allboxs in SetBox.instance.gameObject.transform)
        {
            Destroy(allboxs.gameObject);
        }
        ////////// RESTART SONG SAVE DATA AND PLAYING //////////
        PlaySongProducer();
    }

    public void PlaySong()
    {
        Debug.Log("Song name:" + songName);
        LevelGenerator.Instance.myDataList.dataSave.Clear();
        PlaySongProducer();
        //PlayBtn.transform.gameObject.GetComponent<Button>().interactable = true;
        SetBox.instance.camerabool = true;

        songPlaying = true;
        //songTime.gameObject.SetActive(true);
    }

    public void PlaySongProducer()
    {
        producer = true;

        Debug.Log("PlaySong " + LevelGenerator.Instance.currentSong.song);
        //PlayBtn.transform.gameObject.GetComponent<Button>().interactable = true;
        AudioVisualizeManager.visualizeManager.audioSource.Play();
        AudioVisualizeManager.visualizeManager.StartBeatDetect();
        IEMoveAndStop(LevelGenerator.Instance.currentSong.song.length);
    }
    public IEnumerator waitforsavedata(float clipTime)
    {
        Debug.Log("DIRECT_SAVE_IN_CONTENT");
        yield return new WaitForSeconds(clipTime);
        LevelGenerator.Instance.SaveFloatList();
        ProducerManager.Instance.congratsBeatPopup.SetActive(true);
        songPlaying = false;
        SetBox.instance.camerabool = false;
    }
    public void StopProducer()
    {
        if (CRMoveAndStop != null)
        {
            StopCoroutine(CRMoveAndStop);
        }
    }
    public void IEMoveAndStop(float time)
    {
        CRMoveAndStop = StartCoroutine(waitforsavedata(time));
    }

    void UpdateSongRemainingTime()
    {
        float totalLength = LevelGenerator.Instance.currentSong.song.length;
        float remainingTime = totalLength - AudioVisualizeManager.instance.audioSource.time;
        int remainingMinutes = Mathf.FloorToInt(remainingTime / 60);
        int remainingSeconds = Mathf.FloorToInt(remainingTime % 60);
        string formattedTime = string.Format("{0:00}:{1:00}", remainingMinutes, remainingSeconds);
        ProducerManager.Instance.songTime.GetComponent<TextMeshProUGUI>().text = formattedTime;
    }


    public void ShowPlayingPopUp()
    {
        Debug.Log("Show_Hold_PopUp");
    }

    public IEnumerator LoadingSceneToGamePlayingScene()
    {
        yield return new WaitForSeconds(1f);
        SceneManager.LoadScene("GamePlayingScene");
    }
    public IEnumerator loadingSceneToProducerScene()
    {
        yield return new WaitForSeconds(1f);
        SceneManager.LoadScene("ProducerScene");
    }
}
