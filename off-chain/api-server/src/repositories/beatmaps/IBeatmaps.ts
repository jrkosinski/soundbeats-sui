
export interface IBeatmap {
    address: string;
    owner: string;
    username: string;
    title: string;
    artist: string;
    timestamp: number;
    json: string;
}

export interface IBeatmapsRepo {
    getAllBeatmaps(): Promise<IBeatmap[]>;
    getBeatmapsByOwner(ownerAddress: string): Promise<IBeatmap[]>;
    addBeatmap(beatmap: IBeatmap): Promise<void>;
}