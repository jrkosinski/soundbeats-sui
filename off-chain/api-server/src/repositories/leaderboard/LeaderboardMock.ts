import * as fs from 'fs';
import { ILeaderboard, ISprint } from './ILeaderboard';
import { IConfigSettings } from 'src/config';

/***
 * Implementation of ILeaderboard that just stores the data in memory (which is wiped out when 
 * the application is restarted; so this is more used for testing)
 */
export class LeaderboardMock implements ILeaderboard {
    leaderboardMap: Map<string, number>;
    config: IConfigSettings;

    constructor(configSettings: IConfigSettings) {
        this.leaderboardMap = new Map();
        this.config = configSettings;
    }

    async getLeaderboardScore(
        wallet: string,
        beatmap: string = '',
        sprintId: string = ''
    ): Promise<{ wallet: string, username: string, score: number, network: string }> {
        const output = { wallet: wallet, score: 0, username: '', network: this.config.suiNetwork };

        if (this.leaderboardMap.has(wallet))
            output.score = this.leaderboardMap.get(wallet);

        return output;
    }

    async getLeaderboardScores(
        beatmap: string = '',
        limit: number = 100,
    ): Promise<{ scores: { wallet: string, username: string, score: number }[], network: string }> {
        let output = { scores: [], network: this.config.suiNetwork };

        this.leaderboardMap.forEach((value: number, key: string) => {
            output.scores.push({ wallet: key, score: value });
        });

        //sort 
        output.scores.sort((a, b) => { return b.score - a.score });

        if (limit > 0 && output.scores.length > limit) {
            output.scores = output.scores.slice(0, limit);
        }

        return output;
    }

    async getLeaderboardUniqueUsers(): Promise<{ items: { identifier: string, count: number }[]; network: string; }> {
        return null;
    }

    async addLeaderboardScore(
        wallet: string,
        username: string,
        score: number,
        beatmap: string = '',
        sprintId: string = ''
    ): Promise<{ score: number, network: string }> {
        const output = { score: 0, network: this.config.suiNetwork, username: '' };

        if (this.leaderboardMap.has(wallet))
            output.score = this.leaderboardMap.get(wallet);

        output.score = parseInt(output.score.toString()) + parseInt(score.toString());
        this.leaderboardMap.set(wallet, output.score);

        return output;
    }

    //admin methods 
    async createSprint(sprintName: string): Promise<boolean> {
        throw "Not implemented";
        return false;
    }

    async endSprint(sprintName: string): Promise<boolean> {
        throw "Not implemented";
        return false;
    }

    async getSprint(sprintId: string): Promise<ISprint> {
        return null;
    }

    async getSprints(limit: number): Promise<ISprint[]> {
        return [];
    }
}
