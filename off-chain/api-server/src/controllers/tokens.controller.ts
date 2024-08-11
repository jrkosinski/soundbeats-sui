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
export class TokenController {
    logger: AppLogger;

    constructor(private readonly appService: AppService, private readonly tokenService: TokenService) {
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
}
