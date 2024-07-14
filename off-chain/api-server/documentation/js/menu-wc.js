'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">sui-game-server documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-7edf5fbd6079bf561222dd1c89d7c880be93468a25d6e4af12af6a0b323a8f3080e98ea129eb2dcae18a43ea30ea48a91325dcff8da4b8ad48a9c3a9bfcfa5ac"' : 'data-bs-target="#xs-controllers-links-module-AppModule-7edf5fbd6079bf561222dd1c89d7c880be93468a25d6e4af12af6a0b323a8f3080e98ea129eb2dcae18a43ea30ea48a91325dcff8da4b8ad48a9c3a9bfcfa5ac"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-7edf5fbd6079bf561222dd1c89d7c880be93468a25d6e4af12af6a0b323a8f3080e98ea129eb2dcae18a43ea30ea48a91325dcff8da4b8ad48a9c3a9bfcfa5ac"' :
                                            'id="xs-controllers-links-module-AppModule-7edf5fbd6079bf561222dd1c89d7c880be93468a25d6e4af12af6a0b323a8f3080e98ea129eb2dcae18a43ea30ea48a91325dcff8da4b8ad48a9c3a9bfcfa5ac"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-7edf5fbd6079bf561222dd1c89d7c880be93468a25d6e4af12af6a0b323a8f3080e98ea129eb2dcae18a43ea30ea48a91325dcff8da4b8ad48a9c3a9bfcfa5ac"' : 'data-bs-target="#xs-injectables-links-module-AppModule-7edf5fbd6079bf561222dd1c89d7c880be93468a25d6e4af12af6a0b323a8f3080e98ea129eb2dcae18a43ea30ea48a91325dcff8da4b8ad48a9c3a9bfcfa5ac"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-7edf5fbd6079bf561222dd1c89d7c880be93468a25d6e4af12af6a0b323a8f3080e98ea129eb2dcae18a43ea30ea48a91325dcff8da4b8ad48a9c3a9bfcfa5ac"' :
                                        'id="xs-injectables-links-module-AppModule-7edf5fbd6079bf561222dd1c89d7c880be93468a25d6e4af12af6a0b323a8f3080e98ea129eb2dcae18a43ea30ea48a91325dcff8da4b8ad48a9c3a9bfcfa5ac"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SuiService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SuiService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AddLeaderboardDto.html" data-type="entity-link" >AddLeaderboardDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddLeaderboardResponseDto.html" data-type="entity-link" >AddLeaderboardResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthManagerDynamoDb.html" data-type="entity-link" >AuthManagerDynamoDb</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthVerifyDto.html" data-type="entity-link" >AuthVerifyDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AuthVerifyResponseDto.html" data-type="entity-link" >AuthVerifyResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/BeatmapsNftDto.html" data-type="entity-link" >BeatmapsNftDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/BeatsNftDto.html" data-type="entity-link" >BeatsNftDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CheckUsernameDto.html" data-type="entity-link" >CheckUsernameDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CheckUsernameResponseDto.html" data-type="entity-link" >CheckUsernameResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/Config.html" data-type="entity-link" >Config</a>
                            </li>
                            <li class="link">
                                <a href="classes/DynamoDbAccess.html" data-type="entity-link" >DynamoDbAccess</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetAccountDto.html" data-type="entity-link" >GetAccountDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetAccountResponseDto.html" data-type="entity-link" >GetAccountResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetBeatmapsNftsResponseDto.html" data-type="entity-link" >GetBeatmapsNftsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetBeatsNftsDto.html" data-type="entity-link" >GetBeatsNftsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetBeatsNftsResponseDto.html" data-type="entity-link" >GetBeatsNftsResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetLeaderboardDto.html" data-type="entity-link" >GetLeaderboardDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetLeaderboardResponseDto.html" data-type="entity-link" >GetLeaderboardResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetLeaderboardSprintDto.html" data-type="entity-link" >GetLeaderboardSprintDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetLeaderboardSprintResponseDto.html" data-type="entity-link" >GetLeaderboardSprintResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetTokenBalanceDto.html" data-type="entity-link" >GetTokenBalanceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetTokenBalanceResponseDto.html" data-type="entity-link" >GetTokenBalanceResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetUserOAuthDto.html" data-type="entity-link" >GetUserOAuthDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetUserOAuthResponseDto.html" data-type="entity-link" >GetUserOAuthResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LeaderboardDto.html" data-type="entity-link" >LeaderboardDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LeaderboardDynamoDb.html" data-type="entity-link" >LeaderboardDynamoDb</a>
                            </li>
                            <li class="link">
                                <a href="classes/LeaderboardJsonFile.html" data-type="entity-link" >LeaderboardJsonFile</a>
                            </li>
                            <li class="link">
                                <a href="classes/LeaderboardMemory.html" data-type="entity-link" >LeaderboardMemory</a>
                            </li>
                            <li class="link">
                                <a href="classes/LocalScoreCache.html" data-type="entity-link" >LocalScoreCache</a>
                            </li>
                            <li class="link">
                                <a href="classes/MintBeatmapsNftDto.html" data-type="entity-link" >MintBeatmapsNftDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MintBeatsNftDto.html" data-type="entity-link" >MintBeatsNftDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MintNftResponseDto.html" data-type="entity-link" >MintNftResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MintTokenDto.html" data-type="entity-link" >MintTokenDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MintTokenResponseDto.html" data-type="entity-link" >MintTokenResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/MockService.html" data-type="entity-link" >MockService</a>
                            </li>
                            <li class="link">
                                <a href="classes/RequestNFTResponseDto.html" data-type="entity-link" >RequestNFTResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResponseDtoBase.html" data-type="entity-link" >ResponseDtoBase</a>
                            </li>
                            <li class="link">
                                <a href="classes/StartAuthSessionDto.html" data-type="entity-link" >StartAuthSessionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/StartAuthSessionResponseDto.html" data-type="entity-link" >StartAuthSessionResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserLevelDto.html" data-type="entity-link" >UpdateUserLevelDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserOAuthDto.html" data-type="entity-link" >UpdateUserOAuthDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserOAuthResponseDto.html" data-type="entity-link" >UpdateUserOAuthResponseDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/VerifySignatureDto.html" data-type="entity-link" >VerifySignatureDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/VerifySignatureResponseDto.html" data-type="entity-link" >VerifySignatureResponseDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AppLogger.html" data-type="entity-link" >AppLogger</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/IAuthManager.html" data-type="entity-link" >IAuthManager</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthRecord.html" data-type="entity-link" >IAuthRecord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAuthSession.html" data-type="entity-link" >IAuthSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDynamoResult.html" data-type="entity-link" >IDynamoResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ILeaderboard.html" data-type="entity-link" >ILeaderboard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IScore.html" data-type="entity-link" >IScore</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISprint.html" data-type="entity-link" >ISprint</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});