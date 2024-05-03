using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using System.Text.RegularExpressions;
using Random = UnityEngine.Random;
using UnityEngine.SceneManagement;
using System.Runtime.CompilerServices;

public class LevelGenerator : Singleton<LevelGenerator>
{
    #region Fields
    //[HideInInspector]
    public Song currentSong;
    [Space]
    [HideInInspector] public int platformsPassed = 0;
    [SerializeField] int platformsDrawn;
    [SerializeField] float platformTurnStep = 0.5f;
    [SerializeField] float levelWidth = 10;
    [Range(0f, 1f)]
    [SerializeField] float movingPlatformChance = 0.2f;
    [Space]
    [SerializeField] Player player;
    public Pool platformPool;
    public Pool movingPlatformPool;
    [SerializeField] GameObject starPrefab, PowerUpPrefab;
    public int hitindex = 0;
    public int[] starIDs = new int[3];
    //int songLevel = 0;
    int platformCount;
#pragma warning disable 0414
    bool nextPlatformIsStart = false;
#pragma warning restore 0414
    public float lastPlatformZ = 0;
    public List<GameObject> platformList = new List<GameObject>();
    //public List<GameObject> platformListBox = new List<GameObject>();
    public List<int> countlist = new List<int>();
    //bool checkAnim = true;
    public int randomNum = 0;
    public GameObject WinPlace;
    //bool checkrun = true;
    public int count = 1;

    public string userName;
    [Header("PRODUCER")]
    public string fileName;
    public DataList myDataList = new DataList();
    public int Distance;
    public int beatPerSong => (int)((currentSong.song.length / 60f) * currentSong.BPM);
    public float distanceBetweenPlatforms => currentSong.song.length / beatPerSong * (player == null ? 10 : player.speed) /*+ hitindex*/;
    public bool PathIsValid => platformList.Count > 2;


    private void Update()
    {
        userName = UserData.UserName;
    }
    float TurnStep
    {
        get
        {
            float value = 0;

            if (Random.Range(0f, 1f) > 0.1f)
                value = Random.Range(platformTurnStep / 2, platformTurnStep);
            else
                value = platformTurnStep * 2;

            return value;
        }
    }

    public Transform GetSpecificPlatform(int id)
    {
        return platformList[id].transform;
    }

    public int check = 0;
    public Transform GetNextPlatform
    {

        get
        {
            //hitindex = 100;
            //getcount = countlist[player.platformHitCount];

            if (count % Random.Range(1, 6) == 0)
            {
                hitindex = Random.Range(-3, -6);
                count++;
            }
            else
            {
                hitindex = Random.Range(0, 3);
                count++;
                //Debug.Log(hitindex);

            }


            GameObject platform = platformList[2];
            if (platformList[0].tag == "Moving")
                movingPlatformPool.ReturnItem(platformList[0]);
            else
                platformPool.ReturnItem(platformList[0]);
            platformList.RemoveAt(0);

            GameObject newPlatform = null;
            if (Random.Range(0f, 1f) <= movingPlatformChance && platformCount != beatPerSong - 1)
                newPlatform = movingPlatformPool.GetItem;
            else
                newPlatform = platformPool.GetItem;

            newPlatform.GetComponent<Animator>().SetTrigger("Spawn");
            if (check == 1)
            {
                //nextPlatformIsStart = false;
                newPlatform.name = "Start";
                Reposition(WinPlace, platformCount);
                //WinPlace.transform.position = newPlatform.transform.position;
                platformList.Add(WinPlace);

                Debug.Log("winner");
                //return WinPlace.transform;
                return platform.transform;
            }

            Reposition(newPlatform, platformCount);
            platformList.Add(newPlatform);
            platformCount++;
            platformsPassed++;

            if (platformsPassed >= beatPerSong)
            {
                IncreaseDificulty();

            }
            //hitindex = 10;

            return platform.transform;
        }
    }



    #endregion

    private void Start()
    {
    }

    public void StartWithSong()
    {
        platformCount = 0;
        checkProducer = 0;
        platformsPassed = 0;
        SetStarIDs();
        player.MakeCharacterReady();
        movingPlatformPool.SetMovingPlatform();
        for (int i = 0; i < platformsDrawn; i++)
        {
            GameObject newPlatform = platformPool.GetItem;

            Reposition(newPlatform, platformCount);
            platformList.Add(newPlatform);

            platformCount++;
            platformsPassed++;
        }

    }

    void SetStarIDs()
    {
        starIDs[0] = currentSong.BeatFromTime(0.3f);
        starIDs[1] = currentSong.BeatFromTime(0.64f);
        starIDs[2] = currentSong.BeatFromTime(0.97f);
    }

    void IncreaseDificulty()
    {
        //platformsPassed = 0;
        lastPlatformZ += 40;
        nextPlatformIsStart = true;
    }

    bool CheckForStar()
    {
        for (int i = 0; i < 3; i++)
        {
            if (platformCount == starIDs[i])
                return true;
        }

        return false;
    }

    public void Reposition(GameObject platform, int id)
    {
        float posX = id > 3 ? Random.Range(-levelWidth, levelWidth) : 0;

        platform.transform.position = new Vector3(posX, platform.transform.position.y, lastPlatformZ);
        platform.transform.localRotation = Quaternion.Euler(new Vector3(0, /*Random.Range(0, 360)*/0, 0));

        if (platformCount <= 4)
        {
            lastPlatformZ += distanceBetweenPlatforms + 7;

        }

        else
        {
            lastPlatformZ += distanceBetweenPlatforms - hitindex;
            //Debug.Log(lastPlatformZ - platform);
        }


        if (GameManager.instance.gameState == GameState.Gameplay && Random.Range(0, 10) > 8 && GameManager.instance.isSpeedupActive == false)
        {
            GameObject speedUp = Instantiate(PowerUpPrefab, platform.transform);
        }

    }


    public void RemovePlatforms()
    {
        lastPlatformZ = 0;
        platformsPassed = 0;
        platformList.Clear();
        platformPool.RemoveAllPlatforms();
        movingPlatformPool.RemoveAllPlatforms();
    }
    void OnDrawGizmos()
    {
        if (currentSong == null)
            return;
        else if (currentSong.song == null)
            return;

        for (int i = 0; i < beatPerSong; i++)
        {
            Gizmos.DrawSphere(new Vector3(0, 0, distanceBetweenPlatforms * i), 0.5f);
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////// PRODUCER /////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public int checkProducer = 0;
    public Transform GetNextPlatformProducer
    {

        get
        {
            //hitindex = 100;
            //getcount = countlist[player.platformHitCount];

            if (count % Random.Range(1, 6) == 0)
            {
                hitindex = Random.Range(-3, -6);
                count++;
            }
            else
            {
                hitindex = Random.Range(0, 3);
                count++;
                //Debug.Log(hitindex);

            }


            GameObject platform = platformList[2];
            if (platformList[0].tag == "Moving")
                movingPlatformPool.ReturnItem(platformList[0]);
            else
                platformPool.ReturnItem(platformList[0]);
            platformList.RemoveAt(0);

            GameObject newPlatform = null;
            if (Random.Range(0f, 1f) <= movingPlatformChance && platformCount != beatPerSong - 1)
                newPlatform = movingPlatformPool.GetItem;
            else
                newPlatform = platformPool.GetItem;

            newPlatform.GetComponent<Animator>().SetTrigger("Spawn");
            if (checkProducer == 1)
            {
                //nextPlatformIsStart = false;
                newPlatform.name = "Start";
                RepositionProducer(WinPlace, platformCount);
                //WinPlace.transform.position = newPlatform.transform.position;
                platformList.Add(WinPlace);

                Debug.Log("winner");
                //return WinPlace.transform;
                return platform.transform;
            }

            RepositionProducer(newPlatform, platformCount);
            platformList.Add(newPlatform);
            platformCount++;
            platformsPassed++;

            if (platformsPassed >= beatPerSong)
            {
                IncreaseDificulty();

            }
            //hitindex = 10;

            return platform.transform;
        }
    }
    public void SaveFloatList()
    {
        // Convert the float list to JSON string
        string jsonString = JsonUtility.ToJson(myDataList);
        string baseFileName = currentSong.name + "_Beat_";
        string fileName = baseFileName + UserData.UserName + ".json";
        string filePath = Path.Combine(Application.persistentDataPath, fileName);
        int index = 1;
        while (File.Exists(filePath))
        {
            fileName = baseFileName + index + "_" + UserData.UserName + ".json";
            filePath = Path.Combine(Application.persistentDataPath, fileName);
            index++;
        }

        // Write the JSON string to the file
        File.WriteAllText(filePath, jsonString);
        GameObject jsonPrefab = Instantiate(FileNamePrefab, FileNameparraent);
        if (fileName.Contains(".json"))
        {
            string fileN = fileName;
            fileN = fileN.Replace(".json", "");
            jsonPrefab.transform.GetChild(0).GetComponent<TextMeshProUGUI>().text = fileN;
            jsonPrefab.transform.GetChild(1).GetComponent<Image>().sprite = currentSong.SongImage;
        }

        Debug.Log("Float list saved to: " + filePath);
    }

    public string[] fileNamess;
    public GameObject FileNamePrefab;
    public Transform FileNameparraent;
    public void GetFileName()
    {

        UIController.instance.Mint_NFTScreen.SetActive(true);
        fileNamess = GetFileNamesInPersistentDataPath();
        foreach (Transform t in FileNameparraent.transform)
        {
            Destroy(t.gameObject);
        }
        foreach (string fileName in fileNamess)
        {
            GameObject Obj = Instantiate(FileNamePrefab, FileNameparraent);
            if (fileName.Contains(".json"))
            {
                string fileN = fileName;
                fileN = fileN.Replace(".json", "");
                Obj.transform.GetChild(0).GetComponent<TextMeshProUGUI>().text = fileN;

                foreach (var song in GameManager.instance.songNameCheckForBeatMapJson)
                {
                    for (int i = 1; i <= 10; i++)
                    {
                        if (song.name + "_Beat_" + i + "_" + UserData.UserName == fileN || song.name + "_Beat_" + UserData.UserName == fileN || song.name + "_Beat_" + i + UserData.UserName == fileN)
                        {
                            Obj.transform.GetChild(1).GetComponent<Image>().sprite = song.SongImage;
                            Debug.Log(Obj.name);
                            break;
                        }
                    }
                }
                Obj.GetComponent<Button>().onClick.AddListener(() =>
                {
                    OpenFileAndPlaySongWithGameStart(fileName);
                });
            }
        }
    }
    public string fileNameWithoutExtension;
    public void OpenFileAndPlaySongWithGameStart(string filename)
    {
        SceneManager.LoadScene("GamePlayingScene");
        DontDestroyOnLoad(GameManager.instance.gameObject);
        DontDestroyOnLoad(gameObject);
        DontDestroyOnLoad(SoundManager._Instance.gameObject);
        DontDestroyOnLoad(SavingHandler.Instance.gameObject);
        DontDestroyOnLoad(AudioVisualizeManager.instance.gameObject);
        DontDestroyOnLoad(Player.instance.gameObject);
        CameraFollow.instance.target = Player.instance.gameObject.transform;
        Player.instance.characters[Player.instance.characterSelect].transform.position
            = new Vector3(Player.instance.characters[Player.instance.characterSelect].transform.position.x, 0,
            Player.instance.characters[Player.instance.characterSelect].transform.position.z);

        GameManager.instance.player.gameObject.SetActive(true);
        GameManager.instance.platform.SetActive(true);
        GameManager.instance.pauseButton.SetActive(true);
        GameManager.instance.producer = true;
        checkProducer = 0;
        player.transform.GetChild(8).gameObject.SetActive(true);
        Player.instance.ResetPlayer();
        string filePath = Path.Combine(Application.persistentDataPath, filename);

        if (File.Exists(filePath))
        {
            Debug.Log("Json");
            string json = File.ReadAllText(filePath);

            FileName data = JsonUtility.FromJson<FileName>(json);
            myDataList.dataSave.Clear();
            for (int i = 0; i < data.dataSave.Count; i++)
            {
                myDataList.dataSave.Add((float)data.dataSave[i]);
            }
            fileNameWithoutExtension = Path.GetFileNameWithoutExtension(filename);

            foreach (var song in GameManager.instance.songNameCheckForBeatMapJson)
            {
                for (int j = 1; j <= 10; j++)
                {
                    if (song.name + "_Beat_" + j + "_" + UserData.UserName == fileNameWithoutExtension || song.name + "_Beat_" + UserData.UserName == fileNameWithoutExtension)
                    {
                        currentSong = song;
                        break;
                    }
                }
            }
        }
        else
        {
            Debug.LogError("File not found at path: " + filePath);
        }
    }

    public string[] GetFileNamesInPersistentDataPath()
    {
        // Get the persistent data path
        string persistentDataPath = Application.persistentDataPath;

        // Get file names in the persistent data path
        string[] fileNames = Directory.GetFiles(persistentDataPath);


        // Return only the file names without the path
        for (int i = 0; i < fileNames.Length; i++)
        {
            fileNames[i] = Path.GetFileName(fileNames[i]);
        }

        return fileNames;
    }


    public IEnumerator StartWithSongProducer()
    {
        yield return new WaitForSeconds(1);

        Debug.Log("wait is over");
        platformCount = 0;
        platformsPassed = 0;
        player.MakeCharacterReady();
        movingPlatformPool.SetMovingPlatform();

        for (int i = 0; i < platformsDrawn; i++)
        {
            GameObject newPlatform = platformPool.GetItem;

            RepositionProducer(newPlatform, platformCount);
            platformList.Add(newPlatform);
            Debug.Log(newPlatform);

            platformCount++;
            platformsPassed++;
        }
        SetStarIDs();
    }
    public void RepositionProducer(GameObject platform, int id)
    {
        float posX = id > 3 ? Random.Range(-levelWidth, levelWidth) : 0;
        float temp1 = (float)myDataList.dataSave[0] * Distance;

        lastPlatformZ = temp1;
        platform.transform.position = new Vector3(posX, platform.transform.position.y, lastPlatformZ);
        platform.transform.localRotation = Quaternion.Euler(new Vector3(0, /*Random.Range(0, 360)*/0, 0));

        if (platformCount <= 4)
        {

            //lastPlatformZ += distanceBetweenPlatforms + 7;
            float temp = (float)myDataList.dataSave[0] * Distance;

            lastPlatformZ = temp;
            myDataList.dataSave.RemoveAt(0);
            Debug.Log("LAST PLATFORM Z - 1 :-" + lastPlatformZ);
        }
        else
        {
            float temp = (float)myDataList.dataSave[0] * Distance;

            lastPlatformZ = temp;
            myDataList.dataSave.RemoveAt(0);
            Debug.Log("LAST PLATFORM Z - 2 :-" + lastPlatformZ);
            //lastPlatformZ += distanceBetweenPlatforms - hitindex;
        }
        if (GameManager.instance.gameState == GameState.Gameplay && Random.Range(0, 10) > 7 && GameManager.instance.isSpeedupActive == false)
        {
            GameObject speedUp = Instantiate(PowerUpPrefab, platform.transform);
        }

    }
    [System.Serializable]
    public class FileName
    {
        public List<double> dataSave;
    }

    [System.Serializable]
    public class DataList
    {
        // public List<DataSave> dataSave=new List<DataSave>();
        public List<float> dataSave = new List<float>();
    }

}