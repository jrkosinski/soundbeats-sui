export interface IReward {
    type: string;
    reward: string;
}

export interface IRewardRepo {
    getAllRewards(): Promise<any>;
    getRewardByType(type: string): Promise<any>;
    updateReward( type: string, reward: string): Promise<any>;
}