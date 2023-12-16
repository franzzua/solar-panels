import {GeoJSONSource, Map as MapTilerMap, MapStyle, Marker, config} from "@maptiler/sdk";
import {solarStore} from "@/services/store";
import {Cell} from "@cmmn/cell";
import type {Panel} from "@/services/panel";
import {type GeoPoint, GeoUtil} from "@/services/geo.util";
import type {TileSource} from "@/maps/tile-source";
import {GoogleSource} from "@/maps/sources/google-source";

config.apiKey = MAP_TILER_API_KEY;
export class MapHandler{
    private map = new MapTilerMap({
        container: this.element,
        zoom: 19,
        style: {
            layers: [],
            version: 8,
            sources: {}
        },
        center: [7.509, 58.0131],
    });
    private rotateMarker: Marker | undefined;
    private moveMarker: Marker | undefined;
    constructor(private element: HTMLElement) {
        console.log('create map', MAP_TILER_API_KEY)
        this.map.on('click',  e => {
            solarStore.selectPanel(e.lngLat);
        })
        this.map.on('load', () => this.onLoad());
        this.map.keyboard.disable();

        this.createMarker(solarStore.selectedPanel)

        solarStore.getMapPosition = () => {
            const center = this.map.getCenter();
            const zoom = this.map.getZoom();
            return {center, zoom};
        }
    }

    createMarker(panel: Panel | undefined){
        if (this.rotateMarker){
            this.rotateMarker.remove();
            this.rotateMarker = undefined;
        }
        if (this.moveMarker){
            this.moveMarker.remove();
            this.moveMarker = undefined;
        }
        if (!panel)
            return;
        const div = document.createElement('div');
        div.className = 'marker';
        this.rotateMarker = new Marker({
            element: div,
            offset: [0,0],
            draggable: true,
        }).setLngLat(panel.markerPosition).addTo(this.map);
        this.rotateMarker.on('drag', e => {
            const lngLat = this.rotateMarker!.getLngLat();
            panel.rotate(lngLat);
            this.rotateMarker!.setLngLat(panel.markerPosition);
        });
        this.rotateMarker.on('dragend', e => {
            this.rotateMarker!.setLngLat(panel.markerPosition);
        });
        const div2 = document.createElement('div');
        div2.className = 'move-marker';
        this.moveMarker = new Marker({
            element: div2,
            offset: [0,0],
            draggable: true,
        }).setLngLat(panel.center).addTo(this.map);
        let dragShift: GeoPoint | undefined;
        this.moveMarker.on('dragstart', e => {
            const lngLat = this.moveMarker!.getLngLat();
            dragShift = GeoUtil.sub(panel.center, lngLat);
        });
        this.moveMarker.on('drag', e => {
            const lngLat = this.moveMarker!.getLngLat();
            panel.setCenter(GeoUtil.sum(lngLat, dragShift!));
            this.rotateMarker!.setLngLat(panel.markerPosition);
        });
        this.moveMarker.on('dragend', e => {
            const lngLat = this.moveMarker!.getLngLat();
            panel.setCenter(GeoUtil.sum(lngLat, dragShift!));
            this.rotateMarker!.setLngLat(panel.markerPosition);
            dragShift = undefined;
        });
    }

    async onLoad(){
        await this.setTileSource(solarStore.tileSource);
        

        Cell.OnChange(() => solarStore.geoJson, e => {
            const panelSource = this.map.getSource('panels') as GeoJSONSource;
            panelSource.setData(e.value);
        })
        Cell.OnChange(() => solarStore.geoJsonSelected, e => {
            const panelSource = this.map.getSource('selectedPanels') as GeoJSONSource;
            panelSource.setData(e.value);
        })
        Cell.OnChange(
            () => solarStore.selectedPanel,
            {compareKey: x => x?.id},
            e => this.createMarker(e.value)
        );
        // Change the cursor to a pointer when the mouse is over the states layer.
        this.map.on('mouseenter', 'panels', () => {
            this.map.getCanvas().style.cursor = 'move';
        });

        // Change it back to a pointer when it leaves.
        this.map.on('mouseleave', 'panels', () => {
            this.map.getCanvas().style.cursor = '';
        });
        
        Cell.OnChange(() => solarStore.tileSource, {compareKey: x => x?.id}, e => this.setTileSource(e.value));
    }
    async setTileSource(source: TileSource | undefined){
        if (!source) return;
        await source.load();
        this.map.setStyle(source.Style);
        this.map.addSource('panels', {
            type: 'geojson',
            data: solarStore.geoJson
        });
        this.map.addSource('selectedPanels', {
            type: 'geojson',
            data: solarStore.geoJsonSelected
        });
        this.map.addLayer({
            'id': 'panels',
            'type': 'fill',
            'source': 'panels',
            'layout': {},
            'paint': {
                'fill-color': '#000',
                'fill-opacity': 0.8
            }
        });
        this.map.addLayer({
            'id': 'selectedPanels',
            'type': 'line',
            'source': 'selectedPanels',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round',
            },
            'paint': {
                'line-color': '#A22',
                'line-width': 2
            }
        });
    }
    
    
}