
export interface IUserReferral {
    uuid: string
    referralOwner: string;
    player: string;
    generatedAt: number;
    lastRedeemedAt: number;
}

export interface IUserReferralsRepo {
    getAllUserReferrals(authId: string): Promise<IUserReferral[]>;
    addAllUserReferrals(authId: string, playerId: string): Promise<IUserReferral>;
}