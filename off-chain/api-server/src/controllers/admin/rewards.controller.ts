import {
    Body,
    Controller,
    Get, Param, Post, Query,
    Res, UseInterceptors,
} from '@nestjs/common';
import { RewardService } from '../../services/reward.service';
import { UpdateRewardDto } from '../../entity/admin.req.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { returnError } from '../../util/return-error';
import { AppLogger } from '../../app.logger';
import { UserGameStatsService } from '../../services/user-game-stats.service';

@Controller('admin/rewards')
export class RewardsController {
    logger: AppLogger;
    constructor(
        private rewardService: RewardService,
        private userGameStatsService: UserGameStatsService,
    ) {
        this.logger = new AppLogger('leaderboard.service');
    }


    @Get('/')
    async rewards_get(@Res() res) {
        const rewards = await this.rewardService.getAllRewards()
        return res.render('rewards/index', { layout: 'layout', rewards: rewards });
    }

    @Get('/edit/:type')
    async rewards_edit_get(@Res() res: any, @Param() params: any) {
        let reward
        const logString = `GET /admin/rewards/edit/${params.type}`;

        try {
            reward = await this.rewardService.getRewardByType(params.type)
        } catch (e) {
            this.logger.log(logString);
            returnError(this.logger, logString, 404, e.toString());
        }

        let interval = []
        let rewardKeys = Object.keys(JSON.parse(reward.data.reward))

        rewardKeys.forEach((data: any, index: number) => {
            let parseReward = JSON.parse(reward.data.reward)[index].interval
            interval.push([parseReward.match(/(\d+)-\d+/)[1], parseReward.match(/\d+-(\d+)/)[1]])
        })
        let usersStatsInRange =await this.userGameStatsService.calculateUsersStatsInRanges(interval)


        return res.render('rewards/edit', {
            layout: 'layout',
            reward: params.type !== 'perfectHit' ? reward.data.reward : JSON.parse(reward.data.reward),
            interval: interval,
            type: reward.data.type,
            showForm: params.type !== 'perfectHit',
            usersStatsInRange: usersStatsInRange
        });
    }

    @Get('/users-stats-in-range')
    async checkRange(@Query() query): Promise<number> {
        return await this.userGameStatsService.calculateUsersStatsInSpecificRange(query.from, query.to)
    }


    @Post('/edit/:type')
    @UseInterceptors(FileInterceptor('<name of file here - asdasd in your screenshot>'))
    async rewards_edit(@Res() res: any, @Body() updateRewardDto: UpdateRewardDto, @Param() params:any) {
        if(params.type === 'referred' || params.type === 'referrer') {
            await this.rewardService.updateReward(params.type, updateRewardDto.reward)
            return res.redirect('/admin/rewards');
        }

        let intervals = updateRewardDto.interval
        let rewards =updateRewardDto.param

        let result = {};

        intervals.forEach((interval: any, index: any) => {
            let key = index.toString();
            let value = {
                interval: interval.value,
                param: parseInt(rewards[index].value, 10)
            };
            result[key] = value;
        });


        await this.rewardService.updateReward('perfectHit', JSON.stringify(result))

        return res.redirect('/admin/rewards');
    }

}
