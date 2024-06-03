using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class Player : MonoBehaviour
{
    public float speed = 10;
    public float Speed => speed * (GameManager.instance == null ? 1 : GameManager.instance.GameSpeed);
    public int platformHitCount = 1;
    public Text Text_Name;
    //public LevelGenerator LevelGenerator;

    public Animator marshmello_Animator;

    public GameObject[] characters;

    public GameObject[] Selected_character;
    public GameObject levelSelectorPlayer;
    public GameObject[] Level_Selected_character;


    [SerializeField] float turnSpeed = 1;
    [SerializeField] float jumpHeigh = 5;
    [SerializeField] LayerMask groundLayer;
    [SerializeField] LayerMask platformLayer;
    [SerializeField] Transform jumpingPart;
    [SerializeField] ParticleSystem hitEffect;
    [Header("Deformation")]
    //[SerializeField] float baseSize = 1f;
    //[SerializeField] float scaleMultiplyer = 1f;

    float d; // distance between platforms
    float p; // player's normilized position between platforms
    float t; // time variable for the lerp
    float turnAmount = 0;
    float fallZPos;
    bool isTurning = false;
    public bool canMove;
    Vector3 velocity;
    Vector3 lastPos;
    Vector3 playerOffset;
    Transform platformA, platformB;
    Rigidbody jumpingPartRB;
    Rigidbody _rb;
    Camera mainCamera;

    public List<string> names = new List<string>();
    static int index = 0;
    int randomNumber = 0;
    bool check = true;

    [HideInInspector]
    public bool changeHitindex;

    private Vector2 fingerDownPos;
    private Vector2 fingerUpPos;
    public bool detectSwipeAfterRelease = false;
    public float SWIPE_THRESHOLD = 20f;
    public float distance;

    public GameObject gameStartTxt;

    [Header("Select_Character")]
    public int userIndex = 0;

    public int characterSelect = 0;

    public static Player instance;

    void Awake()
    {
        instance = this;
        //int check= PlayerPrefs.GetInt("Selected_player");
        //if (PlayerPrefs.GetInt("Selected_player") == null)
        //PlayerPrefs.DeleteKey("Selected_player");
        //Debug.Log(PlayerPrefs.GetInt("Selected_player"));

        mainCamera = Camera.main;
        canMove = false;
        platformHitCount = 1;

        //names.Clear();
        names.Add("jump_L"); names.Add("jump_R"); names.Add("FrontFlip"); names.Add("jumpSpin"); names.Add("LJump_L"); names.Add("LJump_R");
        names.Add("TwistFlip"); names.Add("Spin");

        if (IsMobilePlatform())
        {
            gameStartTxt.GetComponent<TextMeshProUGUI>().text = "Swipe up to start/un-pause, swipe down to pause\nswipe left/Right to move Left/Right";
        }
        else
        {
            gameStartTxt.GetComponent<TextMeshProUGUI>().text = "Press Space to start/pause\nWASD / Arrow keys to move";
        }
    }


    private void Videocomplet(bool complet)
    {

    }
    public void MakeCharacterReady()
    {
        //Debug.Log("MakeCharacterReady :==>  " + UserData.SelectedNftIndex);

        ////ResetPlayer();
        ////  StartCoroutine(GameManager.Instance.GameStartText());
        //jumpingPart = Selected_character[UserData.SelectedNftIndex].transform;
        //_rb = GetComponentInChildren<Rigidbody>();
        //jumpingPartRB = jumpingPart.GetComponent<Rigidbody>();
        //marshmello_Animator = Selected_character[UserData.SelectedNftIndex].GetComponent<Animator>();
        ////Selected_character[PlayerPrefs.GetInt("Selected_player")].SetActive(true);
        //Text_Name.text = Selected_character[UserData.SelectedNftIndex].name;
        //characters[UserData.SelectedNftIndex].SetActive(true);
        //marshmello_Animator.Play("Idle");
        Time.timeScale = 1;
        characterSelect = UserData.SelectedNftIndex;
        Debug.Log("MakeCharacterReady :==>  " + characterSelect);
        //ResetPlayer();
        //  StartCoroutine(GameManager.Instance.GameStartText());
        jumpingPart = Selected_character[characterSelect].transform;
        _rb = GetComponentInChildren<Rigidbody>();
        jumpingPartRB = jumpingPart.GetComponent<Rigidbody>();
        marshmello_Animator = Selected_character[characterSelect].GetComponent<Animator>();
        //Selected_character[PlayerPrefs.GetInt("Selected_player")].SetActive(true);
        //Text_Name.text = Selected_character[characterSelect].name;
        characters[characterSelect].SetActive(true);
        marshmello_Animator.Play("Idle");
    }
    public void ResetPlayer()
    {
        mainCamera = Camera.main;
        canMove = false;
        platformHitCount = 1;
        GameManager.instance.gameState = GameState.Menu;
        jumpingPart = Selected_character[UserData.SelectedNftIndex].transform;
        _rb = GetComponentInChildren<Rigidbody>();
        jumpingPartRB = jumpingPart.GetComponent<Rigidbody>();
        marshmello_Animator = Selected_character[UserData.SelectedNftIndex].GetComponent<Animator>();
        //Selected_character[PlayerPrefs.GetInt("Selected_player")].SetActive(true);
        //Text_Name.text = Selected_character[characterSelect].name;
        marshmello_Animator.Play("Idle");
        var obj = transform;
        obj.position = new Vector3(0f, .5f, 0f);
        obj.rotation = Quaternion.identity;
        Selected_character[UserData.SelectedNftIndex].gameObject.transform.position = /*Vector3.zero;*/new Vector3(0f, .5f, 0f);
        Selected_character[UserData.SelectedNftIndex].gameObject.transform.rotation = Quaternion.identity;
    }


    public void playerIndex(int index)
    {
        Text_Name.transform.parent.gameObject.SetActive(false);

        for (int i = 0; i <= characters.Length - 1; i++)
        {
            characters[i].SetActive(false);
        }
        //PlayerPrefs.SetInt("Selected_player", index);
        //Debug.Log(PlayerPrefs.GetInt("Selected_player"));

        //characters[index].SetActive(true);
        jumpingPart = Selected_character[index].transform;
        marshmello_Animator = Selected_character[index].GetComponent<Animator>();
        //Selected_character[PlayerPrefs.GetInt("Selected_player")].SetActive(true);
        Text_Name.transform.parent.gameObject.SetActive(true);

        Text_Name.text = characters[index].name;
        UserData.SelectedNftIndex = index;
        characterSelect = index;
        characters[index].transform.position = new Vector3(characters[index].transform.position.x, 0, characters[index].transform.position.z);
        for (int i = 0; i <= Level_Selected_character.Length - 1; i++)
        {
            Level_Selected_character[i].SetActive(false);
        }
        Level_Selected_character[index].SetActive(true);
    }

    private void Start()
    {
        //marshmello_Animator.Play("Idle");
    }

    void Update()
    {
        userIndex = UserData.SelectedNftIndex;

        if (GameManager.instance.gameState == GameState.Lost || GameManager.instance.gameState == GameState.Win)
        {
            return;
        }

        if (IsMobilePlatform())
        {
            foreach (Touch touch in Input.touches)
            {
                if (touch.phase == TouchPhase.Began)
                {
                    fingerUpPos = touch.position;
                    fingerDownPos = touch.position;
                }

                //Detects Swipe while finger is still moving on screen
                if (touch.phase == TouchPhase.Moved)
                {
                    if (!detectSwipeAfterRelease)
                    {
                        fingerDownPos = touch.position;
                        DetectSwipe();
                    }
                }

                //Detects swipe after finger is released from screen
                if (touch.phase == TouchPhase.Ended)
                {
                    fingerDownPos = touch.position;
                    DetectSwipe();
                }
            }
        }
        else
        {
            if (Input.GetKeyDown(KeyCode.Space))
            {
                HandleInputActions();

            }
        }

        if (canMove)
        {

            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            Movement();
            Jumping();
            VelocityScale();

            if (check == true)
            {
                //Debug.Log("Isgrounded");

                if (index % 2 == 0)
                {
                    marshmello_Animator.Play("Run_R");
                    index++;
                }
                else
                {
                    marshmello_Animator.Play("Run_L");
                    index++;

                }
                if (distance >= 9)
                {
                    randomNumber = UnityEngine.Random.Range(0, names.Count);
                    marshmello_Animator.Play(names[randomNumber]);
                    ////index++;
                    //Debug.Log(LevelGenerator.distanceBetweenPlatforms);
                }
                if (platformHitCount <= 4)
                {
                    randomNumber = UnityEngine.Random.Range(0, names.Count);
                    marshmello_Animator.Play(names[randomNumber]);
                    //index++;
                }
            }
            float moveSpeed = 5;
            //Define the speed at which the object moves.

            float horizontalInput = Input.GetAxis("Horizontal");
            //Get the value of the Horizontal input axis.

            float verticalInput = Input.GetAxis("Vertical");
            //Get the value of the Vertical input axis.

            transform.Translate(new Vector3(horizontalInput, verticalInput, 0) * moveSpeed * Time.deltaTime);
            //Move the object to XYZ coordinates defined as horizontalInput, 0, and verticalInput respectively.
        }
    }

    void DetectSwipe()
    {

        if (VerticalMoveValue() > SWIPE_THRESHOLD && VerticalMoveValue() > HorizontalMoveValue())
        {
            Debug.Log("Vertical Swipe Detected!");
            if (fingerDownPos.y - fingerUpPos.y > 0)
            {
                OnSwipeUp();
            }
            else if (fingerDownPos.y - fingerUpPos.y < 0)
            {
                OnSwipeDown();
            }
            fingerUpPos = fingerDownPos;

        }
        else if (HorizontalMoveValue() > SWIPE_THRESHOLD && HorizontalMoveValue() > VerticalMoveValue())
        {
            Debug.Log("Horizontal Swipe Detected!");
            if (fingerDownPos.x - fingerUpPos.x > 0)
            {
                OnSwipeRight();
            }
            else if (fingerDownPos.x - fingerUpPos.x < 0)
            {
                OnSwipeLeft();
            }
            fingerUpPos = fingerDownPos;

        }
        else
        {
            Debug.Log("No Swipe Detected!");
        }
    }

    float VerticalMoveValue()
    {
        return Mathf.Abs(fingerDownPos.y - fingerUpPos.y);
    }

    float HorizontalMoveValue()
    {
        return Mathf.Abs(fingerDownPos.x - fingerUpPos.x);
    }

    void OnSwipeLeft()
    {
        //swiped left
        if (GameManager.instance.gameState == GameState.Gameplay)
        {
            float moveSpeed = 10;
            transform.Translate(new Vector3(-1, 0, 0) * moveSpeed * Time.deltaTime);
        }
    }

    void OnSwipeRight()
    {
        //swiped right
        if (GameManager.instance.gameState == GameState.Gameplay)
        {
            float moveSpeed = 10;
            transform.Translate(new Vector3(1, 0, 0) * moveSpeed * Time.deltaTime);
        }
    }

    void OnSwipeUp()
    {
        //swiped up
        if (GameManager.instance.gameState == GameState.Menu)
        {
            print("Case 1");
            GameManager.instance.GameStartTextHide();
            GameManager.instance.StartGame();
            Time.timeScale = 1;
            SoundManager._Instance.PlayMusic();
        }
        else if (Time.timeScale == 0 && !GameManager.instance.isPausePopupOpen)
        {
            print("Case 2");
            Time.timeScale = 1;
            SoundManager._Instance.ResumeMusic();
            GameManager.instance.gameState = GameState.Gameplay;
        }
    }

    void OnSwipeDown()
    {
        //swiped down
        GameManager.instance.gameState = GameState.Pause;
        Time.timeScale = 0;
    }

    void HandleInputActions()
    {
        if (GameManager.instance.gameStartText.activeInHierarchy)
        {
            print("Case 1");
            GameManager.instance.GameStartTextHide();
            GameManager.instance.StartGame();
            Time.timeScale = 1;
            SoundManager._Instance.PlayMusic();
        }
        else if (Time.timeScale == 0 && !GameManager.instance.isPausePopupOpen)
        {
            print("Case 2");
            Time.timeScale = 1;
            SoundManager._Instance.ResumeMusic();
            GameManager.instance.gameState = GameState.Gameplay;
        }
        else
        {
            print("Case 3");
            GameManager.instance.gameState = GameState.Pause;
            Time.timeScale = 0;
        }
    }

    bool IsMobilePlatform()
    {
#if !UNITY_EDITOR && (UNITY_ANDROID || UNITY_IOS)
        return true;
#else
        return false;
#endif
    }

    private void VelocityScale()
    {
        //velocity = jumpingPart.position - lastPos;
        //lastPos = jumpingPart.position;

        //if (velocity.magnitude != 0)
        //    jumpingPart.forward = velocity;
        //float minSize = baseSize - velocity.magnitude * scaleMultiplyer;
        //minSize = Mathf.Clamp(minSize, 0.4f, 2f);
        //float maxSize = baseSize + velocity.magnitude * scaleMultiplyer;
        //maxSize = Mathf.Clamp(maxSize, 0.4f, 3f);
        //jumpingPart.localScale = new Vector3(250, 250, 250);
    }

    void HandleInput()
    {
        if (GameManager.instance.gameState == GameState.Gameplay)
        {
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);

                var ray = mainCamera.ScreenPointToRay(touch.position);

                if (Physics.Raycast(ray, out RaycastHit hit, 100, groundLayer))
                {
                    if (touch.phase == TouchPhase.Began)
                    {
                        isTurning = true;
                        playerOffset = jumpingPart.position - hit.point;
                    }

                    if (touch.phase == TouchPhase.Ended)
                        isTurning = false;

                    if (isTurning)
                        turnAmount = Mathf.Lerp(turnAmount, (hit.point.x * turnSpeed) + playerOffset.x, 0.2f);
                }
            }
        }
    }

    void Movement()
    {
        transform.position += Vector3.forward * Speed * Time.deltaTime;
    }

    void Jumping()
    {
        if (platformA == null)
        {
            platformA = LevelGenerator.Instance.GetSpecificPlatform(0);
            //platformA = LevelGenerator.Instance.GetSpecificPlatformBox(0);
            //Debug.Log("platA");
            return;
        }

        if (platformB == null)
        {
            platformB = LevelGenerator.Instance.GetSpecificPlatform(1);
            //platformB = LevelGenerator.Instance.GetSpecificPlatformBox(1);
            //Debug.Log("platB");

            return;
        }

        //marshmello_Animator.SetTrigger(randomNumber.ToString());

        d = Vector3.Distance(platformA.position, platformB.position);
        p = (transform.position.z - platformA.position.z) / (platformB.position.z - platformA.position.z);
        p = Mathf.Clamp(p, 0f, 1f);
        t = Mathf.Abs(Mathf.Cos((p - 0.5f) * Mathf.PI));
        float posY = Mathf.Lerp(0f, 1f, t) * jumpHeigh * d * 0.1f;
        posY = Mathf.Clamp(posY, 0f, 10f);

        Vector3 newPos = new Vector3(turnAmount, posY, 0);

        jumpingPart.localPosition = newPos;

        check = false;


        if (p >= 1)
        {
            CheckPlatform();
        }
    }
    void Show_WinPanel()
    {
        //if (canMove)
        //{
        //StopMoving();
        //GameManager.instance.PlayerFailed();
        //}
        GameManager.instance.PlayerWin();
    }
    void CheckPlatform()
    {
        //Debug.Log("CheckPlatform");
        if (Physics.CheckSphere(jumpingPart.position, 1.5f, platformLayer))
        {
            //randomNumber = UnityEngine.Random.Range(1, 3);

            if (platformB.name == "Start")
            {
                SoundManager.Instance.PlayMusicFromBeat(1);
                GameManager.instance.IncreaseGameSpeed();
                platformHitCount = 0;
            }
            if (platformB.name == "Winplace")
            {
                canMove = false;
                marshmello_Animator.Play("Flip");
                Show_WinPanel();
                return;
            }



            hitEffect.transform.position = platformB.position;
            hitEffect.Play();

            Debug.Log("Hit plateform");

            float distanceToCenter = Vector3.Distance(jumpingPart.position, platformB.position + Vector3.up * 0.3f);
            bool perfect = distanceToCenter < 0.6f;
            platformB.GetComponent<Platform>().Hit(perfect);
            platformA = platformB;
            if (GameManager.instance.producer == true)
            {
                platformB = LevelGenerator.Instance.GetNextPlatformProducer;
            }
            if (GameManager.instance.producer == false)
            {
                platformB = LevelGenerator.Instance.GetNextPlatform;
            }
            distance = Vector3.Distance(platformA.position, platformB.position);
            platformHitCount++;

            GameManager.instance.AddScore(perfect);
            check = true;
        }
        else
        {
            if (canMove)
            {
                StopMoving();
                GameManager.instance.PlayerFailed();
            }
        }
    }

    void StopMoving()
    {
        Debug.Log("StopMoving");
        if (canMove)
        {
            canMove = false;
            //jumpingPartRB.isKinematic = false;
            jumpingPartRB.velocity = jumpingPart.forward * Speed;
        }
    }

    [ContextMenu("Revive")]
    public void Revive()
    {
        Debug.Log("Revive");
        canMove = false;

        //jumpingPartRB.isKinematic = true;

        Vector3 newPlayerPos = new Vector3(transform.position.x, transform.position.y, platformA.position.z);
        transform.position = newPlayerPos;

        turnAmount = 0;
        jumpingPart.localPosition = new Vector3(0, 0, 0);
        jumpingPart.localRotation = new Quaternion(0, 0, 0, 0);
        MovingLoop movement = platformA.gameObject.GetComponent<MovingLoop>();
        if (movement != null)
        {
            movement.enabled = false;
        }
    }

    public void StartMoving()
    {
        Debug.Log("StartMoving");
        canMove = true;
        marshmello_Animator.Play(names[randomNumber]);
    }

    public void StopAtPlatform(Transform platform)
    {
        canMove = false;
        transform.position = Vector3.forward * platform.position.z;
        SoundManager.Instance.StopTrack();
    }

    private void OnDrawGizmos()
    {
        Gizmos.DrawWireSphere(jumpingPart.position, 0.5f);
    }
}
