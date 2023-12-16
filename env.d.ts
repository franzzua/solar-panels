/// <reference types="vite/client" />

type Direction = 'left'|'top'|'right'|'bottom';
type PanelJSON = {
    center: {lat: number; lng: number};
    rotation: number;
    size: {width: number; height: number;}
}
declare const GOOGLE_API_KEY: string;
declare const MAP_TILER_API_KEY: string;
declare const BING_API_KEY: string;