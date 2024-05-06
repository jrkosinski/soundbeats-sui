using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SetBox : MonoBehaviour
{
    public List<GameObject> boxs;
    public List<Vector3> boxPos;
    public float boxZPos;
    public float cameraZPos;
    public float lastPos;
    public bool camerabool;
    public GameObject whiteBallObj;
    public GameObject whiteBallParent;
    public static SetBox instance;
    private void Awake()
    {
        instance = this;
    }


    public void SetBoxUseList()
    {
        int randomBox = Random.Range(0, boxs.Count);

        int randomboxPos = Random.Range(0, boxPos.Count);

        Vector3 setBoxPos = boxPos[randomboxPos];
        setBoxPos.z = boxZPos;
        Debug.Log("its heare");
        Instantiate(boxs[randomBox], setBoxPos, Quaternion.identity, gameObject.transform);

    }
    public void SpawnWhiteBalls()
    {
        foreach (Transform t in whiteBallParent.transform)
        {
            Destroy(t.gameObject);
        }
        for (int i = 0; i < 500; i++)
        {
            Instantiate(whiteBallObj, new Vector3(0, -1, i * 10), Quaternion.identity, whiteBallParent.transform);
        }
    }
    private void Update()
    {
        cameraZPos = AudioVisualizeManager.instance.audioSource.time;
        if (camerabool)
        {
            ProducerManager.Instance.producerCamera.transform.position = new Vector3(25, 8.5f, cameraZPos * LevelGenerator.Instance.Distance - 20);
        }
    }
}
