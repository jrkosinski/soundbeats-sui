import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus, Param,
    Post,
    Res,
} from '@nestjs/common';
import { RewardService } from '../../services/reward.service';
import { UserGameStatsService } from '../../services/user-game-stats.service';
import { AppLogger } from '../../app.logger';
import { AuthService } from '../../services/auth.service';

@Controller('admin')
export class AdminController {
    constructor(
        private rewardService: RewardService,
        private userGameStatsService: UserGameStatsService,
        private  authService: AuthService
    ) {}
    @Get()
    async index(@Res() res: any) {

        let usersPlayed = await this.userGameStatsService.getUsersGameStatsCount()
        let usersCount = await this.authService.getUsersCount()


        return res.render('index', { layout: 'layout', usersPlayed: usersPlayed, usersCount: usersCount });
    }
}
