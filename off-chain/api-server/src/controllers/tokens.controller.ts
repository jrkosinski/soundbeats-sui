import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Query,
    HttpCode,
    BadRequestException,
    UnauthorizedException,
    InternalServerErrorException,
    Param,
    NotFoundException,
    Inject,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppService } from '../app.service';
import {
    MintBeatsNftDto,
    MintBeatmapsNftDto,
    MintNftResponseDto,
    GetTokenBalanceDto,
    GetTokenBalanceResponseDto,
    GetBeatsNftsDto,
    GetBeatsNftsResponseDto,
    GetBeatmapsNftsResponseDto,
    MintTokenDto,
    MintTokenResponseDto,
} from '../entity/req.entity';
import { TokenService } from '../services/tokens.service';
import { AppLogger } from '../app.logger';
import { LeaderboardService } from 'src/services/leaderboard.service';
import { returnError } from 'src/util/return-error';
import { IAuthManager, IAuthRecord } from '../repositories/auth/IAuthManager';
import { AuthManagerModule, ConfigSettingsModule } from '../app.module';
import { ConfigSettings } from '../config';
import { UserReferralService } from '../services/user-refferal.service';
import { SettingsService } from '../services/settings.service';

const MAX_URL_LENGTH = 400;
const MAX_NFT_NAME_LENGTH = 100;
const MAX_USERNAME_LENGTH = 100;
const MAX_JSON_LENGTH = 3000;

@Controller()
export class TokenController {
    logger: AppLogger;
    authManager: IAuthManager;
    config: ConfigSettings;

    constructor(
        private readonly appService: AppService,
        private readonly tokenService: TokenService,
        private readonly userReferralService: UserReferralService,
        private readonly leaderboardService: LeaderboardService,
        readonly settingsService: SettingsService,
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule,
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('tokens.controller');
        this.authManager = authManagerModule.get(this.config);
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @ApiOperation({ summary: 'Mint NFT' })
    @Post('/api/v2/nfts')
    @HttpCode(200)
    async mintNfts(@Body() body: MintBeatsNftDto): Promise<MintNftResponseDto> {
        return this.mintBeatsNfts(body);
    }

    @ApiOperation({ summary: 'Mint instances of BEATS NFT to a given recipient' })
    @Post('/api/v2/nfts/beats')
    @HttpCode(200)
    async mintBeatsNfts(@Body() body: MintBeatsNftDto): Promise<MintNftResponseDto> {
        const logString = `POST /api/v2/nfts/beats ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { name, recipient, imageUrl, quantity } = body;
        if (!name || name == '') {
            returnError(this.logger, logString, 400, 'name cannot be null or empty');
        }
        if (name.length > MAX_NFT_NAME_LENGTH) {
            returnError(this.logger, logString, 400, `name exceeded max length of ${MAX_NFT_NAME_LENGTH}`);
        }
        if (!imageUrl || imageUrl == '') {
            returnError(this.logger, logString, 400, 'imageUrl cannot be null or empty');
        }
        if (imageUrl.length > MAX_URL_LENGTH) {
            returnError(this.logger, logString, 400, `imageUrl exceeded max length of ${MAX_URL_LENGTH}`);
        }

        try {
            const output = await this.tokenService.mintBeatsNfts(
                recipient,
                name,
                'Soundbeats NFT',
                imageUrl,
                quantity ?? 1,
            );
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e.toString());
        }
    }

    @ApiOperation({ summary: 'Mint instances of BEATMAPS NFT to the given recipient' })
    @Post('/api/v2/nfts/beatmaps')
    @HttpCode(200)
    async mintBeatmapsNfts(@Body() body: MintBeatmapsNftDto): Promise<MintNftResponseDto> {
        const logString = `POST /api/v2/nfts/beatmaps ${JSON.stringify(body)}`;
        this.logger.log(logString);
        let { recipient, username, title, artist, beatmapJson, imageUrl, quantity } = body;

        if (!username || username == '') {
            returnError(this.logger, logString, 400, 'username cannot be null or empty');
        }
        if (username.length > MAX_USERNAME_LENGTH) {
            returnError(this.logger, logString, 400, `username exceeded max length of ${MAX_USERNAME_LENGTH}`);
        }
        if (!title || title == '') {
            returnError(this.logger, logString, 400, 'title cannot be null or empty');
        }
        if (!artist) {
            artist = '';
        }
        if (artist.length > MAX_USERNAME_LENGTH) {
            returnError(this.logger, logString, 400, `artist exceeded max length of ${MAX_USERNAME_LENGTH}`);
        }
        if (!beatmapJson || beatmapJson == '') {
            returnError(this.logger, logString, 400, 'beatmapJson cannot be null or empty');
        }
        /*if (beatmapJson.length > MAX_JSON_LENGTH) {
            returnError(this.logger, logString, 400, `beatmapJson exceeded max length of ${MAX_JSON_LENGTH}`);
        }*/
        if (!imageUrl || imageUrl == '') {
            returnError(this.logger, logString, 400, 'imageUrl cannot be null or empty');
        }
        if (imageUrl.length > MAX_URL_LENGTH) {
            returnError(this.logger, logString, 400, `imageUrl exceeded max length of ${MAX_URL_LENGTH}`);
        }

        try {
            const output = await this.tokenService.mintBeatmapsNfts(
                recipient,
                username,
                title,
                artist,
                beatmapJson,
                imageUrl,
                quantity ?? 1,
            );
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Gets list of user-owned NFTs. DEPRECATED: use getBeatsNft and getBeatmapsNft instead' })
    @Get('/api/v2/nfts')
    async getNfts(@Query() query: GetBeatsNftsDto): Promise<GetBeatsNftsResponseDto> {
        return this.getBeatsNfts(query);
    }

    @ApiOperation({ summary: 'Gets list of user-owned BEATS NFTs' })
    @Get('/api/v2/nfts/beats')
    async getBeatsNfts(@Query() query: GetBeatsNftsDto): Promise<GetBeatsNftsResponseDto> {
        const logString = `GET /api/v2/nfts/beats ${JSON.stringify(query)}`;
        this.logger.log(logString);
        const { wallet } = query;

        try {
            const output = await this.tokenService.getBeatsNfts(wallet);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Gets list of user-owned BEATMAPS NFTs' })
    @Get('/api/v2/nfts/beatmaps')
    async getBeatmapsNfts(@Query() query: GetBeatsNftsDto): Promise<GetBeatmapsNftsResponseDto> {
        const logString = `GET /api/v2/nfts/beatmaps ${JSON.stringify(query)}`;
        this.logger.log(logString);
        const { wallet } = query;

        try {
            const output = await this.tokenService.getBeatmapsNftsFromRepo(wallet);

            const uniqueUsers = await this.leaderboardService.getLeaderboardUniqueUsers();

            //get user counts and remove beatmaps json
            for (let nft of output.nfts) {
                delete nft.beatmapJson;
                nft.uniqueUserCount = uniqueUsers.items.find((i) => i.identifier === nft.address)?.count ?? 0;
            }

            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Gets a specific beatmap NFT' })
    @Get('/api/v2/nfts/beatmaps/:id')
    async getBeatmapsNft(@Param('id') address): Promise<GetBeatmapsNftsResponseDto> {
        const logString = `GET /api/v2/nfts/beatmaps/${address}`;
        this.logger.log(logString);

        try {
            const output = await this.tokenService.getBeatmapsNftByAddress(address);
            if (!output?.nfts?.length) {
                returnError(this.logger, logString, 404, 'Beatmap not found');
            }
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Request BEATS token' })
    @Post('/api/v2/token')
    @HttpCode(200)
    async mintBeatsToken(@Body() body: MintTokenDto): Promise<any> {
        const logString = `POST /api/v2/token ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const settings = this.settingsService.getSettings();
        const { recipient, beatmapAddress, referralOwnerUsername } = body;

        if (!recipient || recipient == '') {
            returnError(this.logger, logString, 400, 'recipient cannot be null or empty');
        }
        if (!beatmapAddress || recipient == '') {
            returnError(this.logger, logString, 400, 'beatmapAddress cannot be null or empty');
        }


        try {
            const output = await this.tokenService.mintTokens(recipient, settings.beatmapReferrerReward);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);

            if (referralOwnerUsername) {
                const referralOwner: IAuthRecord = await this.authManager.getAuthRecordByName(referralOwnerUsername);
                await this.tokenService.mintTokens(referralOwner.authId, settings.beatmapReferredReward);
                await this.userReferralService.addAllUserReferrals(referralOwner.authId, recipient, settings.beatmapReferredReward, settings.beatmapReferrerReward, beatmapAddress);
            }

            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e.toString());
        }
    }

    @ApiOperation({ summary: 'Get BEATS token balance' })
    @Get('/api/v2/token')
    async getBeatsTokenBalance(@Query() query: GetTokenBalanceDto): Promise<GetTokenBalanceResponseDto> {
        const logString = `GET /api/v2/token ${JSON.stringify(query)}`;
        this.logger.log(logString);
        const { wallet } = query;
        if (!wallet || wallet == '') {
            returnError(this.logger, logString, 400, 'wallet cannot be null or empty');
        }

        try {
            const output = await this.tokenService.getTokenBalance(wallet);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(this.logger, logString, 500, e);
        }
    }
}
