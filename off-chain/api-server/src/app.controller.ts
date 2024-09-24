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
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
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
    VerifySignatureDto,
    VerifySignatureResponseDto,
    StartAuthSessionDto,
    StartAuthSessionResponseDto,
    AuthVerifyDto,
    AuthVerifyResponseDto,
    GetLeaderboardDto,
    GetLeaderboardResponseDto,
    AddLeaderboardDto,
    AddLeaderboardResponseDto,
    GetLeaderboardSprintDto,
    GetLeaderboardSprintResponseDto,
    GetAccountDto,
    GetAccountResponseDto,
    CheckUsernameDto,
    CheckUsernameResponseDto,
    UpdateUserLevelDto,
    UpdateUserOAuthDto,
    UpdateUserOAuthResponseDto,
    GetUserOAuthDto,
    GetUserOAuthResponseDto,
} from './entity/req.entity';
import { SuiService } from './sui.service';
import { AppLogger } from './app.logger';
import { returnError } from './util/return-error';

const LEADERBOARD_DEFAULT_LIMIT: number = 100;
const MAX_URL_LENGTH = 400;
const MAX_NFT_NAME_LENGTH = 100;
const MAX_USERNAME_LENGTH = 100;
const MAX_WALLET_LENGTH = 100;
const MAX_JSON_LENGTH = 1000;
const MAX_SIGNATURE_LENGTH = 500;
const MAX_STRING_LENGTH = 1000;

//TODO: break into different controllers
@Controller()
export class AppController {
    logger: AppLogger;

    constructor(private readonly appService: AppService, private readonly suiService: SuiService) {
        this.logger = new AppLogger('app.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    // *** NFTS and TOKENS CONTROLLER ***

    @ApiOperation({ summary: 'Mint NFT' })
    @Post('/api/v1/nfts')
    @HttpCode(200)
    async mintNfts(@Body() body: MintBeatsNftDto): Promise<MintNftResponseDto> {
        return this.mintBeatsNfts(body);
    }

    @ApiOperation({ summary: 'Mint instances of BEATS NFT to a given recipient' })
    @Post('/api/v1/nfts/beats')
    @HttpCode(200)
    async mintBeatsNfts(@Body() body: MintBeatsNftDto): Promise<MintNftResponseDto> {
        const logString = `POST /api/v1/nfts/beats ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { name, recipient, imageUrl, quantity } = body;
        if (!name || name == '') {
            returnError(logString, 400, 'name cannot be null or empty');
        }
        if (name.length > MAX_NFT_NAME_LENGTH) {
            returnError(logString, 400, `name exceeded max length of ${MAX_NFT_NAME_LENGTH}`);
        }
        if (!imageUrl || imageUrl == '') {
            returnError(logString, 400, 'imageUrl cannot be null or empty');
        }
        if (imageUrl.length > MAX_URL_LENGTH) {
            returnError(logString, 400, `imageUrl exceeded max length of ${MAX_URL_LENGTH}`);
        }

        try {
            const output = await this.suiService.mintBeatsNfts(
                recipient,
                name,
                'Soundbeats NFT',
                imageUrl,
                quantity ?? 1,
            );
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e.toString());
        }
    }

    @ApiOperation({ summary: 'Mint instances of BEATMAPS NFT to the given recipient' })
    @Post('/api/v1/nfts/beatmaps')
    @HttpCode(200)
    async mintBeatmapsNfts(@Body() body: MintBeatmapsNftDto): Promise<MintNftResponseDto> {
        const logString = `POST /api/v1/nfts/beatmaps ${JSON.stringify(body)}`;
        this.logger.log(logString);
        let { recipient, username, title, artist, beatmapJson, imageUrl, quantity } = body;

        if (!username || username == '') {
            returnError(logString, 400, 'username cannot be null or empty');
        }
        if (username.length > MAX_USERNAME_LENGTH) {
            returnError(logString, 400, `username exceeded max length of ${MAX_USERNAME_LENGTH}`);
        }
        if (!title || title == '') {
            returnError(logString, 400, 'title cannot be null or empty');
        }
        if (!artist) {
            artist = '';
        }
        if (artist.length > MAX_USERNAME_LENGTH) {
            returnError(logString, 400, `artist exceeded max length of ${MAX_USERNAME_LENGTH}`);
        }
        if (!beatmapJson || beatmapJson == '') {
            returnError(logString, 400, 'beatmapJson cannot be null or empty');
        }
        if (beatmapJson.length > MAX_JSON_LENGTH) {
            returnError(logString, 400, `beatmapJson exceeded max length of ${MAX_JSON_LENGTH}`);
        }
        if (!imageUrl || imageUrl == '') {
            returnError(logString, 400, 'imageUrl cannot be null or empty');
        }
        if (imageUrl.length > MAX_URL_LENGTH) {
            returnError(logString, 400, `imageUrl exceeded max length of ${MAX_URL_LENGTH}`);
        }

        try {
            const output = await this.suiService.mintBeatmapsNfts(
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
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Gets list of user-owned NFTs. DEPRECATED: use getBeatsNft and getBeatmapsNft instead' })
    @Get('/api/v1/nfts')
    async getNfts(@Query() query: GetBeatsNftsDto): Promise<GetBeatsNftsResponseDto> {
        return this.getBeatsNfts(query);
    }

    @ApiOperation({ summary: 'Gets list of user-owned BEATS NFTs' })
    @Get('/api/v1/nfts/beats')
    async getBeatsNfts(@Query() query: GetBeatsNftsDto): Promise<GetBeatsNftsResponseDto> {
        const logString = `GET /api/v1/nfts/beats ${JSON.stringify(query)}`;
        this.logger.log(logString);
        const { wallet } = query;
        if (!wallet || wallet == '') {
            returnError(logString, 400, 'wallet cannot be null or empty');
        }

        try {
            const output = await this.suiService.getBeatsNfts(wallet);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Gets list of user-owned BEATMAPS NFTs' })
    @Get('/api/v1/nfts/beatmaps')
    async getBeatmapsNfts(@Query() query: GetBeatsNftsDto): Promise<GetBeatmapsNftsResponseDto> {
        const logString = `GET /api/v1/nfts/beatmaps ${JSON.stringify(query)}`;
        this.logger.log(logString);
        const { wallet } = query;
        if (!wallet || wallet == '') {
            returnError(logString, 400, 'wallet cannot be null or empty');
        }

        try {
            const output = await this.suiService.getBeatmapsNfts(wallet);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Request BEATS token' })
    @Post('/api/v1/token')
    @HttpCode(200)
    async mintBeatsToken(@Body() body: MintTokenDto): Promise<MintTokenResponseDto> {
        const logString = `POST /api/v1/token ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { amount, recipient } = body;
        if (!amount || amount <= 0) {
            returnError(logString, 400, 'amount cannot be null, zero or negative');
        }
        if (!recipient || recipient == '') {
            returnError(logString, 400, 'recipient cannot be null or empty');
        }

        try {
            const output = await this.suiService.mintTokens(recipient, amount);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Get BEATS token balance' })
    @Get('/api/v1/token')
    async getBeatsTokenBalance(@Query() query: GetTokenBalanceDto): Promise<GetTokenBalanceResponseDto> {
        const logString = `GET /api/v1/token ${JSON.stringify(query)}`;
        this.logger.log(logString);
        const { wallet } = query;
        if (!wallet || wallet == '') {
            returnError(logString, 400, 'wallet cannot be null or empty');
        }

        try {
            const output = await this.suiService.getTokenBalance(wallet);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Check if a username exists or is taken' })
    @Get('/api/v1/username')
    async checkUsername(@Query() query: CheckUsernameDto) {
        const logString = `GET /api/v1/username ${JSON.stringify(query)}`;
        this.logger.log(logString);
        let { username } = query;
        if (!username || username == '') {
            returnError(logString, 400, 'username cannot be null or empty');
        }

        try {
            const exists: boolean = await this.suiService.checkUsernameExists(username);
            const output: CheckUsernameResponseDto = {
                exists,
            };
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    // *** LEADERBOARD CONTROLLER ***

    @ApiOperation({ summary: 'Get a user score from the leaderboard' })
    @Get('/api/v1/leaderboard')
    async getLeaderboardScore(@Query() query: GetLeaderboardDto): Promise<GetLeaderboardResponseDto> {
        const logString = `GET /api/v1/leaderboard ${JSON.stringify(query)}`;
        this.logger.log(logString);
        try {
            let { wallet, limit, sprint } = query;
            if (!wallet || wallet == '') {
                wallet = null;
            }
            if (!limit) {
                limit = LEADERBOARD_DEFAULT_LIMIT;
            }
            let output = null;
            if (wallet && wallet.length) {
                output = await this.suiService.getLeaderboardScore(wallet, sprint);
            } else {
                output = await this.suiService.getLeaderboardScores(limit, sprint);
            }
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Add to a user score on the leaderboard' })
    @Post('/api/v1/leaderboard')
    @HttpCode(200)
    async addLeaderboardScore(@Body() body: AddLeaderboardDto): Promise<AddLeaderboardResponseDto> {
        const logString = `POST /api/v1/leaderboard ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { score, authId } = body;

        if (!score || score <= 0) {
            returnError(logString, 400, 'score cannot be null, zero or negative');
        }
        if (!authId || authId == '') {
            returnError(logString, 400, 'wallet cannot be null or empty');
        }
        if (authId.length > MAX_WALLET_LENGTH) {
            returnError(logString, 400, `wallet exceeded max length of ${MAX_WALLET_LENGTH}`);
        }

        try {
            const output = await this.suiService.addLeaderboardScore(authId, score);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Add to a user score on the leaderboard' })
    @Get('/api/v1/sprint')
    async getLeaderboardSprint(@Body() query: GetLeaderboardSprintDto): Promise<GetLeaderboardSprintResponseDto> {
        const logString = `GET /api/v1/sprint ${JSON.stringify(query)}`;
        this.logger.log(logString);
        try {
            let { sprint, limit } = query;
            let output = null;
            if (sprint && sprint.length) {
                output = await this.suiService.getLeaderboardSprint(sprint);
            } else {
                output = await this.suiService.getLeaderboardSprints(limit);
            }
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    // *** AUTH and REGISTRATION ***

    @ApiOperation({ summary: 'Start an auth session. DEPRECATED' })
    @Post('/api/v1/auth')
    @HttpCode(200)
    async startAuthSession(@Body() body: StartAuthSessionDto): Promise<StartAuthSessionResponseDto> {
        const logString = `POST /api/v1/auth ${JSON.stringify(body)}`;
        this.logger.log(logString);
        let { evmWallet } = body;
        if (!evmWallet || evmWallet == '') {
            returnError(logString, 400, 'evmWallet cannot be null or empty');
        }
        if (evmWallet.length > MAX_WALLET_LENGTH) {
            returnError(logString, 400, `evmWallet exceeds max length of ${MAX_WALLET_LENGTH}`);
        }

        try {
            return await this.suiService.startAuthSession(evmWallet);
        } catch (e) {
            returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Get a SUI address given an associated login.' })
    @Get('/api/v1/accounts')
    async getAccountFromLogin(@Query() query: GetAccountDto): Promise<GetAccountResponseDto> {
        const logString = `GET /api/v1/accounts ${JSON.stringify(query)}`;
        let output = { suiWallet: '', status: '', username: '', level: 0 };
        this.logger.log(logString);
        let { authId } = query;
        if (!authId || authId == '') {
            returnError(logString, 400, 'Auth Id cannot be null or empty');
        }
        try {
            output = await this.suiService.getAccountFromLogin(authId);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            if (output.status === 'success') {
                return output;
            }
        } catch (e) {
            returnError(logString, 500, e);
        }

        returnError(logString, 400, output.status);
    }

    @ApiOperation({ summary: "Update user's level." })
    @Post('/api/v1/level')
    async updateUserLevel(@Body() body: UpdateUserLevelDto): Promise<GetAccountResponseDto> {
        const logString = `POST /api/v1/level ${JSON.stringify(body)}`;
        let output = { suiWallet: '', status: '', username: '', level: 0 };
        this.logger.log(logString);
        let { authId, level } = body;
        if (!authId || authId == '') {
            returnError(logString, 400, 'Auth Id cannot be null or empty');
        }
        if (isNaN(level) || level < 0) {
            returnError(logString, 400, 'Level must be a positive number, and is required');
        }

        try {
            output = await this.suiService.updateUserLevel(authId, level);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            if (output.status === 'success') {
                return output;
            }
        } catch (e) {
            returnError(logString, 500, e);
        }

        returnError(logString, 400, output.status);
    }

    @ApiOperation({ summary: 'Create new user account from OAuth login.' })
    @Post('/api/v1/oauth')
    async updateUserOAuth(@Body() body: UpdateUserOAuthDto): Promise<UpdateUserOAuthResponseDto> {
        const logString = `POST /api/v1/oauth ${JSON.stringify(body)}`;
        this.logger.log(logString);
        let status = '';

        let { suiAddress, username, oauthToken, nonceToken } = body;
        if (!suiAddress || suiAddress == '') {
            returnError(logString, 400, 'suiAddress cannot be null or empty');
        }
        if (!username || username == '') {
            returnError(logString, 400, 'username cannot be null or empty');
        }
        if (suiAddress.length > MAX_WALLET_LENGTH) {
            returnError(logString, 400, `suiAddress exceeds max length of ${MAX_WALLET_LENGTH}`);
        }
        if (username.length > MAX_USERNAME_LENGTH) {
            returnError(logString, 400, `username exceeds max length of ${MAX_USERNAME_LENGTH}`);
        }
        //if (!oauthToken || oauthToken == '') {
        //    returnError(logString, 400, 'oauthToken cannot be null or empty');
        //}
        if (!nonceToken || nonceToken == '') {
            returnError(logString, 400, 'nonceToken cannot be null or empty');
        }
        if (nonceToken.length > MAX_STRING_LENGTH) {
            returnError(logString, 400, `nonceToken exceeds max length of ${MAX_STRING_LENGTH}`);
        }

        try {
            const output = await this.suiService.updateUserFromOAuth(suiAddress, username, oauthToken, nonceToken);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);

            status = output.status;
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }

        returnError(logString, 400, status);
    }

    @ApiOperation({ summary: 'Get new user account created from OAuth login.' })
    @Get('/api/v1/oauth')
    async getUserOAuth(@Query() query: GetUserOAuthDto): Promise<GetUserOAuthResponseDto> {
        const logString = `GET /api/v1/oauth ${JSON.stringify(query)}`;
        this.logger.log(logString);

        let { nonceToken } = query;
        if (!nonceToken || nonceToken == '') {
            returnError(logString, 400, 'nonceToken cannot be null or empty');
        }
        if (nonceToken.length > MAX_STRING_LENGTH) {
            returnError(logString, 400, `nonceToken exceeds max length of ${MAX_STRING_LENGTH}`);
        }

        try {
            const output = await this.suiService.getUserFromOAuth(nonceToken);
            return output;
        } catch (e) {
            returnError(logString, 500, e);
        }

        returnError(logString, 400, '?');
    }
}
