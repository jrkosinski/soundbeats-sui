import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    HttpCode,
    Param,
    Inject,
    UseInterceptors,
    UploadedFile, HttpException, HttpStatus,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import axios from 'axios';
import { S3Service } from '../services/s3.service';

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
        private readonly s3Service: S3Service,
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
    async mintBeatsToken(@Body() body: MintTokenDto): Promise<MintTokenResponseDto> {
        const logString = `POST /api/v2/token ${JSON.stringify(body)}`;
        this.logger.log(logString);
        const { recipient, beatmapAddress, referralOwnerUsername } = body;


        if (!recipient || recipient == '') {
            returnError(this.logger, logString, 400, 'recipient cannot be null or empty');
        }
        if (!beatmapAddress || recipient == '') {
            returnError(this.logger, logString, 400, 'beatmapAddress cannot be null or empty');
        }

        try {
            const settings = await this.settingsService.getSettings(recipient);

            const output = await this.tokenService.mintTokens(recipient, settings.beatmapReferrerReward);
            this.logger.log(`${logString} returning ${JSON.stringify(output)}`);

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


    @Post('/api/v2/create-track-and-get-link')
    @ApiOperation({ summary: 'Create a music track and retrieve the download link' })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ status: 200, description: 'Download link or error message' })
    @UseInterceptors(FileInterceptor('file'))
    async createTrackAndGetLink(
        @Body('duration') duration: number,
        @UploadedFile() file: Express.Multer.File,
        @Body('format') format?: string,
        @Body('bitrate') bitrate?: number,
        @Body('intensity') intensity?: string,
        @Body('mode') mode?: string
    ): Promise<any> {
        if (!file || (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png')) {
            throw new HttpException('Invalid file type. Only JPEG and PNG are allowed.', HttpStatus.BAD_REQUEST);
        }

        if (file.size > 10 * 1024 * 1024) {
            throw new HttpException('File size exceeds 10 MB limit.', HttpStatus.BAD_REQUEST);
        }

        const formData = new FormData();
        formData.append('pat', this.config.mubertSettings);
        formData.append('duration', duration.toString());
        formData.append('method', 'ITMRecordTrack');

        if (format) formData.append('format', format.toLowerCase());
        if (bitrate) formData.append('bitrate', bitrate.toString());
        if (intensity) formData.append('intensity', intensity.toLowerCase());
        if (mode) formData.append('mode', mode.toLowerCase());

        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('file', blob, file.originalname);
        try {
            const response = await axios.post('https://api-b2b.mubert.com/v2/ITMRecordTrack', formData, {
                // headers: formData.getHeaders(),
                timeout: 60000,
            });

            const responseData = response.data;

            if (responseData.error) {
                return { error: responseData.error };
            }

            if (!responseData.data || !responseData.data.tasks) {
                return { error: { code: 500, text: 'No task data found in response.' } };
            }

            const taskId = responseData.data.tasks[0].task_id;
            let url =await this.pollTrackStatus(taskId);
            const downloadedFile = await axios.get(url, { responseType: "stream" });
            let s3Response = await this.s3Service.uploadFile(downloadedFile.data);

            return  {download_link: s3Response};

        } catch (error) {
            throw new HttpException(
                `Error communicating with ITMRecordTrack API: ${error.message}`,
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    private async pollTrackStatus(taskId: string): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            let interval = setInterval(async () => {
                const response = await axios.post('https://api-b2b.mubert.com/v2/TrackStatus', {
                    headers: { 'Content-Type': 'application/json' },
                    method: 'TrackStatus',
                    params: {
                        pat: this.config.mubertSettings
                    },
                    timeout: 60,
                });

                if (response.data && response.data?.data?.tasks) {
                    for (const task of response.data.data.tasks) {
                        if (task.task_id === taskId) {
                            if (task.task_status_code === 2) {
                                clearInterval(interval);
                                resolve(task.download_link);
                            } else if (task.task_status_code === 3) {
                                return { error: { code: task.task_status_code, text: task.task_status_text } };
                            }
                        }
                    }
                } else {
                    console.warn('No tasks found in TrackStatus response.');
                    clearInterval(interval);
                    reject('No tasks found in TrackStatus response.');
                }

            }, 5000);
        });
    }
}


