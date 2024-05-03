using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using DG.Tweening;

public class SelectSong : MonoBehaviour
{
    public TMP_Text Name;
    public Image ThumbnailImage;
    private Song _song;
    public Toggle toggle;
    private Vector3 levelPlayerPosition = new Vector3(-1.79f, 90f, -2.45f);
    public int LevelNumber;
    private bool canSeePlayer = true;

    private void Start()
    {
        //_songDataSet = FindObjectOfType<SongDataSet>();
    }

    public void init(string songname, string songdetail, Sprite image, Song _song, bool playerDisplay)
    {
        Name.text = $"<size=16><b>{songname}</b></size>\n{songdetail}";
        ThumbnailImage.sprite = image;
        canSeePlayer = playerDisplay;
    }

    public void setSong()
    {
        if (toggle)
        {
            if (GameManager.instance.producer == false && canSeePlayer == true)
            {
                Player.instance.levelSelectorPlayer.transform.SetParent(toggle.transform);
                Player.instance.levelSelectorPlayer.transform.localScale = new Vector3(9000, 9000, 9000);
                //Player.instance.levelSelectorPlayer.transform.DOLocalMove(levelPlayerPosition, 1f);
                Player.instance.levelSelectorPlayer.transform.localPosition = levelPlayerPosition;
                Debug.Log(Player.instance.levelSelectorPlayer.transform.localPosition);
            }
        }
        SongSelectionPopup.Instance.setData(LevelNumber - 1, canSeePlayer);
        StartCoroutine(SetSongData());
    }

    public IEnumerator SetSongData()
    {
        //yield return new WaitForSeconds(0.001f);
        if (canSeePlayer)
        {
            yield return new WaitForSeconds(1.2f);
        }
        LevelGenerator.Instance.currentSong = _song;
    }

}