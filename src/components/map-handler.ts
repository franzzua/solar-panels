import {GeoJSONSource, Map as MapTilerMap, MapStyle, Marker} from "@maptiler/sdk";
import {solarStore} from "@/services/store";
import {Cell} from "@cmmn/cell";
import type {Panel} from "@/services/panel";

export class MapHandler{
    private map = new MapTilerMap({
        container: this.element,
        zoom: 19,
        style: MapStyle.SATELLITE,
        center: [7.509, 58.0131],
    });
    private marker: Marker | undefined;
    constructor(private element: HTMLElement) {
        console.log('create map')
        this.map.on('click',  e => {
            solarStore.selectPanel(e.lngLat);
        })
        this.map.on('load', () => this.onLoad());
        this.map.keyboard.disable();
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

        this.createMarker(solarStore.selectedPanel)

        solarStore.getMapPosition = () => {
            const center = this.map.getCenter();
            const zoom = this.map.getZoom();
            return {center, zoom};
        }
    }

    createMarker(panel: Panel | undefined){
        if (this.marker){
            this.marker.remove();
            this.marker = undefined;
        }
        if (!panel)
            return;
        const div = document.createElement('div');
        div.className = 'marker';
        const marker = new Marker({
            element: div,
            offset: [0,0],
            draggable: true,
        }).setLngLat(panel.markerPosition).addTo(this.map);
        marker.on('drag', e => {
            const lngLat = marker.getLngLat();
            panel.rotate(lngLat);
        });
        marker.on('dragend', e => {
            marker.setLngLat(panel.markerPosition);
        });

        return marker;
    }

    onLoad(){
        this.map.addSource('panels', {
            type: 'geojson',
            data: solarStore.geoJson
        });
        this.map.addSource('selectedPanels', {
            type: 'geojson',
            data: solarStore.geoJsonSelected
        });
        this.map.addLayer({
            'id': 'selectedPanels',
            'type': 'line',
            'source': 'selectedPanels',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#A22',
                'line-width': 8
            }
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
    }
}