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
} from '../entity/req.entity';
import { TokenService } from '../services/tokens.service';
import { AppLogger } from '../app.logger';

const MAX_URL_LENGTH = 400;
const MAX_NFT_NAME_LENGTH = 100;
const MAX_USERNAME_LENGTH = 100;
const MAX_JSON_LENGTH = 1000;

//TODO: break into different controllers
@Controller()
export class TokenController {
    logger: AppLogger;

    constructor(
        private readonly appService: AppService,
        private readonly tokenService: TokenService
    ) {
        this.logger = new AppLogger('tokens.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    //TODO: REPEATED CODE
    returnError(apiCall: string, errorCode: number, message: any) {
        this.logger.error(`${apiCall} returning ${errorCode}: ${message}`);
        switch (errorCode) {
            case 400:
                throw new BadRequestException(message);
            case 401:
                throw new UnauthorizedException(message);
            case 500:
                throw new InternalServerErrorException(message);
        }

        throw new BadRequestException(message);
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
            this.returnError(logString, 400, 'name cannot be null or empty');
        }
        if (name.length > MAX_NFT_NAME_LENGTH) {
            this.returnError(logString, 400, `name exceeded max length of ${MAX_NFT_NAME_LENGTH}`);
        }
        if (!imageUrl || imageUrl == '') {
            this.returnError(logString, 400, 'imageUrl cannot be null or empty');
        }
        if (imageUrl.length > MAX_URL_LENGTH) {
            this.returnError(logString, 400, `imageUrl exceeded max length of ${MAX_URL_LENGTH}`);
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
            this.returnError(logString, 500, e.toString());
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
            this.returnError(logString, 400, 'username cannot be null or empty');
        }
        if (username.length > MAX_USERNAME_LENGTH) {
            this.returnError(logString, 400, `username exceeded max length of ${MAX_USERNAME_LENGTH}`);
        }
        if (!title || title == '') {
            this.returnError(logString, 400, 'title cannot be null or empty');
        }
        if (!artist) {
            artist = '';
        }
        if (artist.length > MAX_USERNAME_LENGTH) {
            this.returnError(logString, 400, `artist exceeded max length of ${MAX_USERNAME_LENGTH}`);
        }
        if (!beatmapJson || beatmapJson == '') {
            this.returnError(logString, 400, 'beatmapJson cannot be null or empty');
        }
        if (beatmapJson.length > MAX_JSON_LENGTH) {
            this.returnError(logString, 400, `beatmapJson exceeded max length of ${MAX_JSON_LENGTH}`);
        }
        if (!imageUrl || imageUrl == '') {
            this.returnError(logString, 400, 'imageUrl cannot be null or empty');
        }
        if (imageUrl.length > MAX_URL_LENGTH) {
            this.returnError(logString, 400, `imageUrl exceeded max length of ${MAX_URL_LENGTH}`);
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
            this.returnError(logString, 500, e);
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
            this.returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Gets list of user-owned BEATMAPS NFTs' })
    @Get('/api/v2/nfts/beatmaps')
    async getBeatmapsNfts(@Query() query: GetBeatsNftsDto): Promise<GetBeatmapsNftsResponseDto> {
        const logString = `GET /api/v2/nfts/beatmaps ${JSON.stringify(query)}`;
        this.logger.log(logString);
        const { wallet } = query;

        try {
            const output = await this.tokenService.getBeatmapsNfts(wallet);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            this.returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Request BEATS token' })
    @Post('/api/v2/token')
    @HttpCode(200)
    async mintBeatsToken(@Body() body: MintTokenDto): Promise<MintTokenResponseDto> {
        const logString = `POST /api/v2/token ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { amount, recipient } = body;
        if (!amount || amount <= 0) {
            this.returnError(logString, 400, 'amount cannot be null, zero or negative');
        }
        if (!recipient || recipient == '') {
            this.returnError(logString, 400, 'recipient cannot be null or empty');
        }

        try {
            const output = await this.tokenService.mintTokens(recipient, amount);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            this.returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Get BEATS token balance' })
    @Get('/api/v2/token')
    async getBeatsTokenBalance(@Query() query: GetTokenBalanceDto): Promise<GetTokenBalanceResponseDto> {
        const logString = `GET /api/v2/token ${JSON.stringify(query)}`;
        this.logger.log(logString);
        const { wallet } = query;
        if (!wallet || wallet == '') {
            this.returnError(logString, 400, 'wallet cannot be null or empty');
        }

        try {
            const output = await this.tokenService.getTokenBalance(wallet);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            return output;
        } catch (e) {
            this.returnError(logString, 500, e);
        }
    }
}