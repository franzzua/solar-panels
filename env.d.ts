/// <reference types="vite/client" />

type Direction = 'left'|'top'|'right'|'bottom';
type PanelJSON = {
    center: {lat: number; lng: number};
    rotation: number;
    size: {width: number; height: number;}
}