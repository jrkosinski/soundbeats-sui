
export interface IUserReferral {
    uuid: string;
    beatmapAddress: string;
    referralOwner: string;
    referralOwnerEmail: string;
    ownerReward: number
    player: string;
    playerEmail: string;
    playerReward: number
    generatedAt: number;
    referralCode: string
    lastRedeemedAt: number;
}

export interface IUserReferralsRepo {
    getAllUserReferrals(authId: string): Promise<IUserReferral[]>;
    addAllUserReferrals(ownerId: string, playerId: string, ownerEmail: string, playerEmail: string, beatmapReferredReward: number, beatmapReferrerReward: number, beatmapAddress: string, referralCode: string ): Promise<IUserReferral>;
}