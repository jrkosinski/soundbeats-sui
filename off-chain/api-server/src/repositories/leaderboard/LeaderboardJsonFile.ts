import * as fs from 'fs';
import { ILeaderboard } from './ILeaderboard';
import { LeaderboardMock } from './LeaderboardMock';
import { IConfigSettings } from 'src/config';

/**
 * Implementation of ILeaderboard that stores data in local JSON files. 
 * While this is still used for testing, it's a step beyond LeaderboardMemory, as it persists 
 * the data. 
 */
export class LeaderboardJsonFile extends LeaderboardMock {

    constructor(configSettings: IConfigSettings) {
        super(configSettings);
        this._readFromFiles();
    }

    async addLeaderboardScore(wallet: string, username: string, score: number, sprintId: string = ""): Promise<{ score: number, network: string }> {
        const output = await super.addLeaderboardScore(wallet, username, score);

        this._writeToFile(wallet);
        return output;
    }

    _writeToFile(wallet: string) {
        if (this.leaderboardMap.has(wallet)) {
            const path = `data/${wallet}.json`;
            fs.writeFileSync(path, this.leaderboardMap.get(wallet).toString());
        }
    }

    _readFromFiles() {
        const path = `data/`;
        const files = fs.readdirSync(path);

        files.forEach(filename => {
            const wallet = filename.split('.')[0];
            fs.readFile(`data/${filename}`, (err, data) => {
                try {
                    this.leaderboardMap.set(wallet, parseInt(data.toString()));
                }
                catch (e) {
                    console.error(e);
                }
            });
        });
    }
}
