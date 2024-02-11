import {EventEmitter} from "@cmmn/core";
import type {ReferenceMapStyle, StyleSpecification} from "@maptiler/sdk";
export abstract class TileSource extends EventEmitter<{
    change: void
}>{
    abstract id: string;
    public  abstract  load(): Promise<void>;
    
    abstract get URI(): string;
    
    protected readToken(){
        try{
            const token = JSON.parse(localStorage.getItem(this.id+'token') ?? "null");
            if (!token || token._expiresAt < new Date())
                return null;
            return token;
        }catch (e) {
            return null;
        }
    }
    protected saveToken(token: any){
        return localStorage.setItem(this.id+'token', JSON.stringify({
            ...token,
            _expiresAt: +new Date()+1000*60*60
        }));
    }
    get Style(): ReferenceMapStyle | StyleSpecification {
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

