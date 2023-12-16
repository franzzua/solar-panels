import {TileSource} from "../tile-source";

export class GoogleSource extends TileSource{
    id = 'google';
    private token:  Token | undefined;
    
    constructor(private apiKey: string) {
        super();
    }
    public async load(){
        const saved = this.readToken() as Token;
        if (saved && new Date((+saved.expiry)*1000) > new Date()){
            this.token = saved;
            this.setTimer();
            return;
        }
        if (!this.apiKey)
            throw new Error(`Google Map Api Key is not provided`);
        this.token = await fetch(`https://tile.googleapis.com/v1/createSession?key=${this.apiKey}`, {
            method: 'POST',
            body: JSON.stringify({
                "mapType": "satellite",
                "language": "en-US",
                "region": "US"
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(x => x.json()) as Token;
        if (!this.token.session)
            throw new Error(`Google Map Api Failure`);
        this.saveToken(this.token);
        this.setTimer();
    }
    
    private setTimer(){
        if (!this.token) return;
        setTimeout(async () => {
            this.token = undefined;
            this.saveToken(null);
            this.emit('change');
        }, (+this.token.expiry)*1000 - +new Date());
    }
    
    public get URI(){
        return `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${this.token?.session}&key=${this.apiKey}`
    }
    

    get minZoom(){
        return 1;
    }
    get maxZoom(){
        return 22;
    }
}

type Token = {session: string; expiry: string; tileWidth: number; tileHeight: number; imageFormat: string};