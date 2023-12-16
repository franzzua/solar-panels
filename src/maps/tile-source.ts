import {EventEmitter} from "@cmmn/core";

export abstract class TileSource extends EventEmitter<{
    change: void
}>{
    abstract id: string;
    public  abstract  load(): Promise<void>;
    
    abstract get URI(): string;
    
    protected readToken(){
        try{
            return JSON.parse(localStorage.getItem(this.id+'token') ?? "null");
        }catch (e){
            return null;
        }
    }
    protected saveToken(token: any){
        return localStorage.setItem(this.id+'token', JSON.stringify(token));
    }
    get Style(){
        return {
            sources: {
                [this.id]: {
                    type: 'raster',
                    tiles: [this.URI],
                    maxzoom: this.maxZoom,
                    minzoom: this.minZoom
                }
            },
            version: 8,
            layers: [{
                source: this.id,
                id: this.id,
                type: 'raster'
            }]
        }
    }
    
    abstract get minZoom(): number;
    abstract get maxZoom(): number;
}

