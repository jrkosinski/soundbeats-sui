
export interface IUserReferral {
    uuid: string;
    beatmapAddress: string;
    referralOwner: string;
    ownerReward: number
    player: string;
    playerReward: number
    generatedAt: number;
    lastRedeemedAt: number;
}

export interface IUserReferralsRepo {
    getAllUserReferrals(authId: string): Promise<IUserReferral[]>;
    addAllUserReferrals(authId: string, playerId: string, beatmapReferredReward: number, beatmapReferrerReward: number, beatmapAddress: string): Promise<IUserReferral>;
}