import {TileSource} from "../tile-source";

export class BingSource extends TileSource{
    id = 'bing';
    private data:  Token | undefined;
    
    constructor(private apiKey: string) {
        super();
    }
    public async load(){
        const saved = this.readToken() as Token;
        if (saved){
            this.data = saved;
            return;
        }
        if (!this.apiKey)
            throw new Error(`Bing Map Api Key is not provided`);
        const result = await fetch(`https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=${this.apiKey}`).then(x => x.json());
        if (result.statusCode != '200')
            throw new Error(`Bing Map Api Failure`);
        console.log(result)
        this.data = result.resourceSets[0].resources[0];
        this.saveToken(this.data);
    }
    public get URI(){
        if (!this.data)
            throw new Error(`BingSource is not initialized`)
        return this.data.imageUrl
            .replace('http://', 'https://')
            .replace('{subdomain}', this.data?.imageUrlSubdomains[0]);
    }

    get minZoom(){
        return this.data?.zoomMin ?? 1;
    }
    get maxZoom(){
        return this.data?.zoomMax ?? 30;
    }
}

type Token = {imageUrl: string; imageUrlSubdomains: string[]; imageWidth: number; imageHeight: number; zoomMin: number; zoomMax: number;};