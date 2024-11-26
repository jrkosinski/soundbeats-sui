export interface ILocalBeatmap{
    id: any;
    username: string;
    title: string;
    file: string;
    timestamp: number;
}

export interface ILocalBeatmapsRepo {
    getAllLocalBeatmaps(): Promise<ILocalBeatmap[]>;
    // getLocalBeatmap(address: string): Promise<ILocalBeatmap>;
    getLocalBeatmapsByOwner(ownerAddress: string): Promise<ILocalBeatmap[]>;
    addLocalBeatmap(beatmap: ILocalBeatmap): Promise<void>;
    updateLocalBeatmap( id: any, username: string, title: string, file: string, artist: string): Promise<any>;
}