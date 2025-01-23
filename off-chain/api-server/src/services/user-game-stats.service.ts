import { Inject, Injectable } from '@nestjs/common';
import { ConfigSettings } from '../config';
import { ConfigSettingsModule, UserGameStatsModule } from '../app.module';
import { IUserGameStat, IUserGameStatsRepo } from '../repositories/userGameStats/IUserGameStats';

@Injectable()
export class UserGameStatsService {
    userGameStats: IUserGameStatsRepo;
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('UserGameStatsModule') userGameStatsModule: UserGameStatsModule,
    ) {
        this.config = configSettingsModule.get();
        this.userGameStats = userGameStatsModule.get(this.config);
    }

    async getUserGameStats(address: string): Promise<any> {
        return await this.userGameStats.getUserGameStats(address);
    }

    async getAllUsersGameStats(): Promise<any> {
        return await this.userGameStats.getAllUsersGameStats();
    }

    async getUsersGameStatsCount(): Promise<any> {
        return (await this.userGameStats.getAllUsersGameStats()).length
    }

    async calculateUsersStatsInRanges(ranges: Array<any>): Promise<any> {
        let usersStats = await this.userGameStats.getAllUsersGameStats();
        let usersStatsInRange = [];

        ranges.forEach((range) => {
            let count = 0;
            usersStats.forEach((stat: IUserGameStat) => {
                if (Number(range[0]) <= stat.count && stat.count <= Number(range[1])) {
                    count += 1;
                }
            });
            usersStatsInRange.push(count);
        });
        return usersStatsInRange;
    }

    async calculateUsersStatsInSpecificRange(from: number, to: number): Promise<number> {
        let usersStats = await this.userGameStats.getAllUsersGameStats();

        let count = 0;
        usersStats.forEach((stat: IUserGameStat) => {
            if (from <= Number(stat.count) && Number(stat.count) <= to) {
                count += 1;
            }
        });
        return count;
    }
}
