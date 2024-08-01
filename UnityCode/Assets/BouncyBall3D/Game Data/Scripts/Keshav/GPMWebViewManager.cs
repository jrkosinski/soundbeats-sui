using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Gpm.WebView;

public class GPMWebViewManager : Singleton<GPMWebViewManager>
{
    private string WEB_AUTH_URL = "http://game.soundbeats.io:8080/auth?nonce_token=";
    public string nonce_token = "";

    public void ShowUrlFullScreen(string noncetoken)
    {
        nonce_token = noncetoken;
        string URLtoOpen = WEB_AUTH_URL + nonce_token;
        Debug.Log(URLtoOpen);
        GpmWebView.ShowUrl(
            URLtoOpen,
            new GpmWebViewRequest.Configuration()
            {
                style = GpmWebViewStyle.POPUP,
                orientation = GpmOrientation.LANDSCAPE_LEFT,
                isClearCookie = true,
                isClearCache = true,
                backgroundColor = "#FFFFFF",
                isNavigationBarVisible = false,
                isBackButtonVisible = false,
                isForwardButtonVisible = false,
                isCloseButtonVisible = false,
                supportMultipleWindows = true,
                margins = new GpmWebViewRequest.Margins
                {
                    hasValue = true,
                    left = (int)(Screen.width * 0.05f),
                    top = (int)(Screen.height * 0.05f),
                    right = (int)(Screen.width * 0.05f),
                    bottom = (int)(Screen.height * 0.05f)
                },
#if UNITY_IOS
                contentMode = GpmWebViewContentMode.MOBILE,
                isMaskViewVisible = true,
#endif
                userAgentString = "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36 Mozilla/5.0(iPad; U;CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10(KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10",
            },
            // See the end of the code example
            OnCallback,
            new List<string>()
            {
            "http://game.soundbeats.io:8080/0x"
            });
    }

    private void OnCallback(
    GpmWebViewCallback.CallbackType callbackType,
    string data,
    GpmWebViewError error)
    {
        Debug.Log("OnCallback: " + callbackType);
        switch (callbackType)
        {
            case GpmWebViewCallback.CallbackType.Open:
                if (string.IsNullOrEmpty(data) == false)
                {
                    Debug.LogFormat("Open WebView : {0}", data);
                }
                else if (error != null)
                {
                    Debug.LogFormat("Fail to Open WebView. Error:{0}", error);
                }
                else
                {
                    Debug.Log(string.Format("Open WebView."));
                }
                break;
            case GpmWebViewCallback.CallbackType.Close:
                if (string.IsNullOrEmpty(data) == false)
                {
                    Debug.LogFormat("close WebView : {0}", data);
                }
                else if (error != null)
                {
                    Debug.LogFormat("Fail to close WebView. Error:{0}", error);
                }
                else
                {
                    Debug.Log(string.Format("close WebView."));
                }
                break;
            case GpmWebViewCallback.CallbackType.PageStarted:
                if (string.IsNullOrEmpty(data) == false)
                {
                    Debug.LogFormat("PageStarted Url : {0}", data);
                }
                break;
            case GpmWebViewCallback.CallbackType.PageLoad:
                if (string.IsNullOrEmpty(data) == false)
                {
                    Debug.LogFormat("Loaded Page:{0}", data);
                }
                break;
            case GpmWebViewCallback.CallbackType.MultiWindowOpen:
                Debug.Log("MultiWindowOpen");
                break;
            case GpmWebViewCallback.CallbackType.MultiWindowClose:
                Debug.Log("MultiWindowClose");
                break;
            case GpmWebViewCallback.CallbackType.Scheme:
                if (error == null)
                {
                    Debug.Log(string.Format("Output scheme:{0}", data));
                    if (data.Contains("http://game.soundbeats.io:8080/0x") == true)
                    {
                        Debug.Log(string.Format("scheme to close:{0}", data));
                        string[] dataArray = data.Split('/');
                        for (int i = 0; i < dataArray.Length; i++)
                        {
                            Debug.Log("Value at index = " + i + " is : " + dataArray[i]);
                        }

                        Debug.Log(dataArray.Length + " ==> Address : " + dataArray[dataArray.Length - 2]);
                        Debug.Log(dataArray.Length + " ==> UserName : " + dataArray[dataArray.Length - 1]);
                        SuiWallet.ActiveWalletAddress = dataArray[dataArray.Length - 2];
                        UserData.UserName = dataArray[dataArray.Length - 1];

                        Debug.Log(" SuiWallet.ActiveWalletAddress: " + SuiWallet.ActiveWalletAddress);
                        Debug.Log(" UserName : " + UserData.UserName);
                        LoginManager.instance.startGame();
                        if (GpmWebView.IsActive() == true)
                        {
                            GpmWebView.SetSize(0, 0);
                            //GpmWebView.Close();
                        }
                    }
                }
                else
                {
                    Debug.Log(string.Format("Fail to custom scheme. Error:{0}", error));
                }
                break;
            case GpmWebViewCallback.CallbackType.GoBack:
                Debug.Log("GoBack");
                break;
            case GpmWebViewCallback.CallbackType.GoForward:
                Debug.Log("GoForward");
                break;
            case GpmWebViewCallback.CallbackType.ExecuteJavascript:
                Debug.LogFormat("ExecuteJavascript data : {0}, error : {1}", data, error);
                break;
#if UNITY_ANDROID
            case GpmWebViewCallback.CallbackType.BackButtonClose:
                Debug.Log("BackButtonClose");
                break;
#endif
        }

    }
}
