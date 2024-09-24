
export interface IReferralCode {
    code: string;
    user: string;
    maxUses: number;
    uses: number;
    generatedAt: number;
    lastRedeemedAt: number;
}

export interface IReferralRepo {
    generateReferralCode(authId: string): Promise<IReferralCode>;
}