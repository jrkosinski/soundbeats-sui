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
import { AuthService } from '../services/auth.service';
import { AppLogger } from '../app.logger';

const MAX_USERNAME_LENGTH = 100;
const MAX_WALLET_LENGTH = 100;
const MAX_STRING_LENGTH = 1000;

//TODO: break into different controllers
@Controller()
export class AuthController {
    logger: AppLogger;

    constructor(private readonly appService: AppService, private readonly authService: AuthService) {
        this.logger = new AppLogger('auth.controller');
    }

    @Get('/')
    healthcheck() {
        return 'ok';
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    //TODO: repeated code
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

    @ApiOperation({ summary: 'Start an auth session. DEPRECATED' })
    @Post('/api/v2/auth')
    @HttpCode(200)
    async startAuthSession(@Body() body: StartAuthSessionDto): Promise<StartAuthSessionResponseDto> {
        const logString = `POST /api/v2/auth ${JSON.stringify(body)}`;
        this.logger.log(logString);
        let { evmWallet } = body;
        if (!evmWallet || evmWallet == '') {
            this.returnError(logString, 400, 'evmWallet cannot be null or empty');
        }
        if (evmWallet.length > MAX_WALLET_LENGTH) {
            this.returnError(logString, 400, `evmWallet exceeds max length of ${MAX_WALLET_LENGTH}`);
        }

        try {
            return await this.authService.startAuthSession(evmWallet);
        } catch (e) {
            this.returnError(logString, 500, e);
        }
    }

    @ApiOperation({ summary: 'Get a SUI address given an associated login.' })
    @Get('/api/v2/accounts')
    async getAccountFromLogin(@Query() query: GetAccountDto): Promise<GetAccountResponseDto> {
        const logString = `GET /api/v2/accounts ${JSON.stringify(query)}`;
        let output = { suiWallet: '', status: '', username: '', level: 0 };
        this.logger.log(logString);
        let { authId } = query;
        if (!authId || authId == '') {
            this.returnError(logString, 400, 'Auth Id cannot be null or empty');
        }
        try {
            output = await this.authService.getAccountFromLogin(authId);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            if (output.status === 'success') {
                return output;
            }
        } catch (e) {
            this.returnError(logString, 500, e);
        }

        this.returnError(logString, 400, output.status);
    }

    @ApiOperation({ summary: "Update user's level." })
    @Post('/api/v2/level')
    async updateUserLevel(@Body() body: UpdateUserLevelDto): Promise<GetAccountResponseDto> {
        const logString = `POST /api/v2/level ${JSON.stringify(body)}`;
        let output = { suiWallet: '', status: '', username: '', level: 0 };
        this.logger.log(logString);
        let { authId, level } = body;
        if (!authId || authId == '') {
            this.returnError(logString, 400, 'Auth Id cannot be null or empty');
        }
        if (isNaN(level) || level < 0) {
            this.returnError(logString, 400, 'Level must be a positive number, and is required');
        }

        try {
            output = await this.authService.updateUserLevel(authId, level);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);
            if (output.status === 'success') {
                return output;
            }
        } catch (e) {
            this.returnError(logString, 500, e);
        }

        this.returnError(logString, 400, output.status);
    }

    @ApiOperation({ summary: 'Create new user account from OAuth login.' })
    @Post('/api/v2/oauth')
    async updateUserOAuth(@Body() body: UpdateUserOAuthDto): Promise<UpdateUserOAuthResponseDto> {
        const logString = `POST /api/v2/oauth ${JSON.stringify(body)}`;
        this.logger.log(logString);
        let status = '';

        let { suiAddress, username, oauthToken, nonceToken } = body;
        if (!suiAddress || suiAddress == '') {
            this.returnError(logString, 400, 'suiAddress cannot be null or empty');
        }
        if (!username || username == '') {
            this.returnError(logString, 400, 'username cannot be null or empty');
        }
        if (suiAddress.length > MAX_WALLET_LENGTH) {
            this.returnError(logString, 400, `suiAddress exceeds max length of ${MAX_WALLET_LENGTH}`);
        }
        if (username.length > MAX_USERNAME_LENGTH) {
            this.returnError(logString, 400, `username exceeds max length of ${MAX_USERNAME_LENGTH}`);
        }
        //if (!oauthToken || oauthToken == '') {
        //    this.returnError(logString, 400, 'oauthToken cannot be null or empty');
        //}
        if (!nonceToken || nonceToken == '') {
            this.returnError(logString, 400, 'nonceToken cannot be null or empty');
        }
        if (nonceToken.length > MAX_STRING_LENGTH) {
            this.returnError(logString, 400, `nonceToken exceeds max length of ${MAX_STRING_LENGTH}`);
        }

        try {
            const output = await this.authService.updateUserFromOAuth(suiAddress, username, oauthToken, nonceToken);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);

            status = output.status;
            return output;
        } catch (e) {
            this.returnError(logString, 500, e);
        }

        this.returnError(logString, 400, status);
    }

    @ApiOperation({ summary: 'Get new user account created from OAuth login.' })
    @Get('/api/v2/oauth')
    async getUserOAuth(@Query() query: GetUserOAuthDto): Promise<GetUserOAuthResponseDto> {
        const logString = `GET /api/v2/oauth ${JSON.stringify(query)}`;
        this.logger.log(logString);

        let { nonceToken } = query;
        if (!nonceToken || nonceToken == '') {
            this.returnError(logString, 400, 'nonceToken cannot be null or empty');
        }
        if (nonceToken.length > MAX_STRING_LENGTH) {
            this.returnError(logString, 400, `nonceToken exceeds max length of ${MAX_STRING_LENGTH}`);
        }

        try {
            const output = await this.authService.getUserFromOAuth(nonceToken);
            return output;
        } catch (e) {
            this.returnError(logString, 500, e);
        }

        this.returnError(logString, 400, '?');
    }
}
