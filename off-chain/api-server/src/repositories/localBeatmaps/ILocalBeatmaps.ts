export interface ILocalBeatmap {
    id: any;
    username: string;
    artist: string;
    title: string;
    file: string;
    source: string;
    image: string;
    timestamp: number;
}

export interface ILocalBeatmapsRepo {
    getAllLocalBeatmaps(): Promise<ILocalBeatmap[]>;
    getLocalBeatmap(id: any): Promise<ILocalBeatmap>;
    getLocalBeatmapsByOwner(ownerAddress: string): Promise<ILocalBeatmap[]>;
    addLocalBeatmap(beatmap: ILocalBeatmap): Promise<void>;
    updateLocalBeatmap(
        id: any,
        username: string,
        artist: string,
        title: string,
        file: string,
        source: string,
        image: string,
    ): Promise<any>;
}
