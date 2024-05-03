using System.Collections;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class GamePlayingManager : MonoBehaviour
{
    public static GamePlayingManager instance;
    private void Awake()
    {
        instance = this;
    }

    public GameObject platform;
    public GameObject gameStartText;
    public Image levelProgress;
    public PowerupProgress powerupTimer;
    public Text scoreText;
    public Animator scoreAnim;
    public Animator reviveAnim;
    public GameObject revivePanel, playButton, Winpanel;
    [Space]
    public Text songName;
    public Text songNameWin;

    public Text levelScore;
    public Image[] stars = new Image[3];

    public Text scoreTextCompletion;
    public Text bestScoreTxt;
    public Text scoreTokens;
    public Button playAgain_Button;

    public GameObject quitScreen;
    public Text ScoreWin;
    public GameObject pauseButton;


    private void Start()
    {
        if (IsMobilePlatform())
        {
            gameStartText.GetComponent<TextMeshProUGUI>().text = "Swipe up to start/un-pause, swipe down to pause\nswipe left/Right to move Left/Right";
        }
        else
        {
            gameStartText.GetComponent<TextMeshProUGUI>().text = "Press Space to start/pause\nWASD / Arrow keys to move";
        }

        CameraFollow.instance.target = Player.instance.gameObject.transform;
        GameManager.instance.platform = platform;
        GameManager.instance.gameStartText = gameStartText;
        GameManager.instance.levelProgress = levelProgress;
        GameManager.instance.powerupTimer = powerupTimer;
        GameManager.instance.scoreText = scoreText;
        GameManager.instance.scoreAnim = scoreAnim;
        GameManager.instance.reviveAnim = reviveAnim;
        GameManager.instance.revivePanel = revivePanel;
        GameManager.instance.playButton = playButton;
        GameManager.instance.Winpanel = Winpanel;
        GameManager.instance.songName = songName;
        GameManager.instance.songNameWin = songNameWin;
        GameManager.instance.levelScore = levelScore;
        GameManager.instance.scoreTextCompletion = scoreTextCompletion;
        GameManager.instance.bestScoreTxt = bestScoreTxt;
        GameManager.instance.scoreTokens = scoreTokens;
        GameManager.instance.playAgain_Button = playAgain_Button;
        GameManager.instance.quitScreen = quitScreen;
        GameManager.instance.ScoreWin = ScoreWin;
        GameManager.instance.pauseButton = pauseButton;
        Player.instance.gameObject.SetActive(true);
        Player.instance.ResetPlayer();
        Player.instance.characters[Player.instance.characterSelect].transform.position
            = new Vector3(Player.instance.characters[Player.instance.characterSelect].transform.position.x, 0,
                Player.instance.characters[Player.instance.characterSelect].transform.position.z);
        if (GameManager.instance.producer == true)
        {

            StartCoroutine(LevelGenerator.Instance.StartWithSongProducer());

        }
        else
        {
            LevelGenerator.Instance.StartWithSong();
        }
        Player.instance.characters[Player.instance.characterSelect].SetActive(true);
        //LevelGenerator.Instance.StartWithSong();
        Player.instance.transform.GetChild(8).gameObject.SetActive(true);
    }

    public void onPause()
    {
        GameManager.instance.onPause();
    }

    public void OnClose()
    {
        CameraFollow.instance.enabled = false;
        SceneManager.LoadScene("HomeScene");
        Destroy(GameManager.instance.gameObject);
        Destroy(LevelGenerator.Instance.gameObject);
        Destroy(SoundManager._Instance.gameObject);
        Destroy(SavingHandler.Instance.gameObject);
        Destroy(AudioVisualizeManager.instance.gameObject);
        Destroy(Player.instance.gameObject);
    }
    public void onNO()
    {
        GameManager.instance.quitScreen.SetActive(false);
        Time.timeScale = 1;
        SoundManager._Instance.ResumeMusic();
        GameManager.instance.gameState = GameState.Gameplay;
        pauseButton.SetActive(true);
        GameManager.instance.isPausePopupOpen = false;
    }

    public void HidePopup()
    {
        Debug.Log("HidePopup");
        scoreText.text = "0";
        Player.instance.ResetPlayer();
        revivePanel.SetActive(false);
        Winpanel.SetActive(false);
        playButton.SetActive(true);
        GameManager.instance.platform.SetActive(true);
        LevelGenerator.Instance.StartWithSong();
        Player.instance.transform.GetChild(8).gameObject.SetActive(false);
        Player.instance.transform.GetChild(8).gameObject.SetActive(true);
    }

    bool IsMobilePlatform()
    {
#if !UNITY_EDITOR && (UNITY_ANDROID || UNITY_IOS)
        return true;
#else
        return false;
#endif
    }
}
