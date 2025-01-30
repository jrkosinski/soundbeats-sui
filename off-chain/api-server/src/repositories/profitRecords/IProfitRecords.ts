export interface IProfitRecord {
    profit: number;
}

export interface IProfitRecordRepo {
    // Promise<IProfitRecord[]>;
    increaseProfit(balance: number)
}