using UnityEngine;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;

public class SetKeystore : IPreprocessBuildWithReport
{
    public int callbackOrder { get { return 0; } }

    void IPreprocessBuildWithReport.OnPreprocessBuild(BuildReport report)
    {
#if UNITY_ANDROID
        UnityEditor.PlayerSettings.Android.keystoreName = "soundbeats.keystore";
        UnityEditor.PlayerSettings.Android.keystorePass = "123456";
        UnityEditor.PlayerSettings.Android.keyaliasName = "soundbeats";
        UnityEditor.PlayerSettings.Android.keyaliasPass = "123456";
#endif

    }
}