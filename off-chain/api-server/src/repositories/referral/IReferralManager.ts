
export interface IReferralCode {
    code: string;
    beatmapId: string;
    maxUses: number;
    uses: number;
    generatedAt: number;
    lastRedeemedAt: number;
}

export interface IReferralRepo {
    generateReferralCode(beatmapId: string): Promise<IReferralCode>;
    getReferralCode(code: string): Promise<IReferralCode>;
    exists(code: string): Promise<boolean>;
}