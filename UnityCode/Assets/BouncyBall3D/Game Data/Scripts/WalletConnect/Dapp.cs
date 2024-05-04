using System;
using System.Collections.Generic;
using System.Linq;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.UI;
using WalletConnectSharp.Sign.Models;
using WalletConnectSharp.Sign.Models.Engine;
using WalletConnectUnity.Core;

namespace WalletConnectUnity.Modal.Sample
{
    public class Dapp : MonoBehaviour
    {
        [Space, SerializeField] private NetworkListItem _networkListItemPrefab;

        [Space, SerializeField] private Transform _networkListContainer;
        [SerializeField] private Button _continueButton;

        [Space, SerializeField] private GameObject _dappButtons;
        [SerializeField] private GameObject _networkList;
        [SerializeField] private GameObject _userName;

        private readonly HashSet<Chain> _selectedChains = new();

        private void Start()
        {
            _dappButtons.SetActive(true);
            Application.targetFrameRate = Screen.currentResolution.refreshRate;
            // When WalletConnectModal is ready, enable buttons and subscribe to other events.
            // WalletConnectModal.SignClient can be null if WalletConnectModal is not ready.
            WalletConnectModal.Ready += (sender, args) =>
            {
                // SessionResumed is true if Modal resumed session from storage
                Debug.Log($"[WalletConnectModalSample] SessionResumed.");

                if (args.SessionResumed)
                {
                    EnableDappButtons();
                    Debug.Log($"[WalletConnectModalSample] EnableDappButtons.");

                }
                else
                {
                    //EnableNetworksList();
                    Debug.Log($"[WalletConnectModalSample] EnableNetworksList.");
                    OnContinueButton();

                }
                // Invoked after wallet connected
                WalletConnect.Instance.ActiveSessionChanged += (_, @struct) =>
                {
                    if (string.IsNullOrEmpty(@struct.Topic))
                        return;

                    Debug.Log($"[WalletConnectModalSample] Session connected. Topic: {@struct.Topic}");
                    if (LoginManager.instance)
                    {
                        LoginManager.instance.OnPersonalSignButton();
                    }
                    //_userName.SetActive(true);
                    LoginManager.instance.LoadingScreen.SetActive(true);
                    _networkList.SetActive(false);
                };

                // Invoked after wallet disconnected
                WalletConnect.Instance.SessionDisconnected += (_, _) =>
                {
                    Debug.Log($"[WalletConnectModalSample] Session deleted.");
                    //EnableNetworksList();
                    OnContinueButton();
                };
            };
        }

        private void EnableDappButtons()
        {
            _networkList.SetActive(false);
            _dappButtons.SetActive(true);
        }

        private void EnableNetworksList()
        {
            _dappButtons.SetActive(false);
            _networkList.SetActive(true);
            LoginManager.instance.LoadingScreen.SetActive(false);
            if (_networkListContainer.childCount == 0)
            {
                foreach (var chain in Chain.All)
                {
                    var item = Instantiate(_networkListItemPrefab, _networkListContainer);
                    item.Initialize(chain, OnNetworkSelected);
                }
            }
        }

        private void OnNetworkSelected(Chain chain, bool selected)
        {
            if (selected)
                _selectedChains.Add(chain);
            else
                _selectedChains.Remove(chain);

            _continueButton.interactable = _selectedChains.Count != 0;
        }
        private WalletConnectModalOptions options;
        public void OnContinueButton()
        {
            print("Continue Button Event");
            if (_selectedChains.Count == 0)
                _selectedChains.Add(Chain.Ethereum);
            options = new WalletConnectModalOptions
            {
                ConnectOptions = BuildConnectOptions()
            };

            WalletConnectModal.Open(options);
        }

        public void OnCloseModel()
        {
            //LoginManager.instance.LoadingScreen.SetActive(false);
            Invoke("OnContinueButton", 1f);
        }

        private ConnectOptions BuildConnectOptions()
        {
            var requiredNamespaces = new RequiredNamespaces();

            if (_selectedChains.Any(c => c.ChainNamespace == Chain.EvmNamespace))
            {
                var eipChains = _selectedChains.Where(c => c.ChainNamespace == Chain.EvmNamespace);

                var methods = new[]
                {
                    "eth_sendTransaction",
                    "personal_sign",
                };

                var events = new[]
                {
                    "chainChanged", "accountsChanged"
                };

                var chainIds = eipChains.Select(c => c.FullChainId).ToArray();

                requiredNamespaces.Add(Chain.EvmNamespace, new ProposedNamespace()
                {
                    Chains = chainIds,
                    Events = events,
                    Methods = methods
                });
            }
            else
            {
                throw new Exception("No EVM chains selected.");
            }

            return new ConnectOptions
            {
                RequiredNamespaces = requiredNamespaces
            };
        }
    }
}