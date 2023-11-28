
export interface ILeaderboard {
    /**
     * Gets the current score for the given wallet. If no sprint is specified, gets
     * the default leaderboard. 
     * 
     * @param wallet the wallet for which to get the score
     * @param sprintId unique sprint id (can be null)
     */
    getLeaderboardScore(wallet: string, sprintId: string): Promise<{ wallet: string, score: number, network: string }>;
    
    /**
     * Gets a list of scores for the given leaderboard. If no sprint is specified, gets
     * the default leaderboard. 
     * 
     * @param limit the max number of records to return
     * @param sprintId unique sprint id (can be null)
     */
    getLeaderboardScores(limit: number, sprintId: string): Promise<{ scores: { wallet: string, score: number }[], network: string }>
    
    /**
     * Accumulates the given score to the specified wallet.
     * 
     * @param wallet wallet to which to add the given score
     * @param score the score to add to the wallet's total 
     * @param sprintId unique sprint id (can be null)
     */
    addLeaderboardScore(wallet: string, score: number, sprintId: string): Promise<{ score: number, network: string }>
    
    //admin methods 

    /**
     * Creates a new sprint. If the startDate is now, the currently active sprint will be 
     * deactivated and this new one will be set to active.  
     * 
     * @param sprintId unique sprint id, the sprint to create
     * @param startDate the start date of the sprint
     */
    createSprint(sprintId: string, startDate: number): Promise<boolean>; 
    
    /**
     * Sets the given sprint's 'active' property to false, sets the endDate to now. 
     * 
     * @param sprintId unique sprint id, the sprint to end
     */
    endSprint(sprintId: string): Promise<boolean>;
}