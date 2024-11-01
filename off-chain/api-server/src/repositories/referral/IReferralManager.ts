
export interface IReferralCode {
    code: string;
    shortCode: string;
    beatmapId: string;
    maxUses: number;
    uses: number;
    generatedAt: number;
    lastRedeemedAt: number;
}

export interface IReferralRepo {
    generateReferralCode(beatmapId: string): Promise<IReferralCode>;
    getReferralCode(code: string): Promise<IReferralCode>;
    exists(shortCode: string): Promise<boolean>;
}