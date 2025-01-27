export interface IUserGameStat {
    address: string;
    count: number;
}

export interface IUserGameStatsRepo {
    getAllUsersGameStats(): Promise<IUserGameStat[]>;
    getUserGameStats(ownerAddress: string): Promise<IUserGameStat[]>;
}