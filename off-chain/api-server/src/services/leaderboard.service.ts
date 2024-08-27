import { Inject, Injectable } from '@nestjs/common';
import { ILeaderboard, ISprint } from '../repositories/leaderboard/ILeaderboard';
import { ConfigSettings } from '../config';
import { AppLogger } from '../app.logger';
import { AuthManagerModule, ConfigSettingsModule, LeaderboardModule } from '../app.module';
import { IAuthManager, IAuthRecord } from 'src/repositories/auth/IAuthManager';

//TODO: replace 'success' with 'completed'
// - delete table
// - rename 2 props & create
/// - rename in code
// - retest
//TODO: logging msgs

export const strToByteArray = (str: string): number[] => {
    const utf8Encode = new TextEncoder();
    return Array.from(utf8Encode.encode(str).values());
};

@Injectable()
export class LeaderboardService {
    leaderboard: ILeaderboard;
    authManager: IAuthManager;
    network: string;
    logger: AppLogger;
    config: ConfigSettings;

    constructor(
        @Inject('ConfigSettingsModule') configSettingsModule: ConfigSettingsModule,
        @Inject('LeaderboardModule') leaderboardModule: LeaderboardModule,
        @Inject('AuthManagerModule') authManagerModule: AuthManagerModule
    ) {
        this.config = configSettingsModule.get();
        this.logger = new AppLogger('leaderboard.service');
        this.leaderboard = leaderboardModule.get(this.config);
        this.authManager = authManagerModule.get(this.config);
    }

    /**
     * Returns the leaderboard score of the given wallet (default 0).
     *
     * @param wallet the wallet address to query score
     * @param sprint unique sprint id, or "current", "", or "default"
     * @returns LeaderboardDto
     */
    async getLeaderboardScore(
        wallet: string,
        beatmap?: string,
        sprint: string | null | 'current' | '' = null,
    ): Promise<{
        wallet: string;
        score: number;
        username: string;
        network: string;
    }> {
        if (beatmap)
            return await this.leaderboard.getLeaderboardScore(wallet, beatmap, sprint);
        else {

        }
    }

    /**
     * Returns all leaderboard scores, or the leaderboard score of the given wallet only,
     * if the wallet parameter is provided (i.e., if 'wallet' is null or undefined, returns ALL scores)
     *
     * @param limit 0 means 'unlimited'
     * @param sprint unique sprint id, or "current", "", or "default"
     * @returns GetLeaderboardResponseDto
     */
    async getLeaderboardScores(
        beatmap?: string,
        limit: number = 0,
    ): Promise<{
        scores: { wallet: string; username: string; score: number }[];
        network: string;
    }> {
        return await this.leaderboard.getLeaderboardScores(beatmap, limit);
    }

    //TODO: comment
    async getLeaderboardUniqueUsers(
        limit: number = 0
    ): Promise<{
        items: { identifier: string; count: number }[];
        network: string;
    }> {
        const output = await this.leaderboard.getLeaderboardUniqueUsers();
        return output;
    }

    /**
     * Adds a new leaderboard score for the given wallet address.
     *
     * @param wallet the wallet address to add score
     * @param score the score to add for the given wallet
     * @param sprint unique sprint id, or "current", "", or "default"
     * @returns LeaderboardDto
     */
    async addLeaderboardScore(
        authId: string,
        score: number,
        beatmap: string,
        sprint: string | null | 'current' | '' = null,
    ): Promise<{ score: number; network: string }> {
        const user = await this.getAccountFromLogin(authId);
        let username = authId;
        if (user) {
            username = user.username;
        }
        return await this.leaderboard.addLeaderboardScore(authId, username, score, beatmap, sprint);
    }

    /**
     * Gets the specified leaderboard sprint configuration, if it exists.
     *
     * @param sprintId
     * @returns The given sprint configuration, if found; otherwise null.
     */
    async getLeaderboardSprint(sprintId: string): Promise<ISprint> {
        return await this.leaderboard.getSprint(sprintId);
    }

    /**
     * Gets all leaderboard sprints.
     *
     * @param limit Max number of records to return; <=0 for unlimited.
     * @returns An array of leaderboard sprints that exist.
     */
    async getLeaderboardSprints(limit: number = 0): Promise<ISprint[]> {
        return await this.leaderboard.getSprints(limit);
    }

    //TODO: REPEATED CODE
    /**
     * Tries to retrieve an existing SUI wallet address given the login information.
     *
     * @param authId
     * @returns The status of the search and SUI wallet address (if found)
     */
    async getAccountFromLogin(
        authId: string,
    ): Promise<{ suiWallet: string; username: string; level: number; status: string }> {
        const output = { suiWallet: '', status: '', username: '', level: 0 };
        const authRecord: IAuthRecord = await this.authManager.getAuthRecord(authId, 'sui');
        if (authRecord == null) {
            output.status = 'notfound';
        } else {
            output.suiWallet = authRecord?.suiWallet;
            output.username = authRecord.username;
            output.level = authRecord.level;
            output.status = 'success';
        }

        return output;
    }
}
