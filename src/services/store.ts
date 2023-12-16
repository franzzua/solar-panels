import type {GeoPoint} from "@/services/geo.util";
import type {FeatureCollection, Polygon} from "geojson";
import {Panel} from "@/services/panel";
import {Cell, cell, ObservableList} from "@cmmn/cell";
import {EventEmitter, compare} from "@cmmn/core"
import type {TileSource} from "@/maps/tile-source";
import {GoogleSource} from "@/maps/sources/google-source";
class SolarStore extends EventEmitter<{
    change: Array<PanelJSON>
}>{
    constructor() {
        super();
        Cell.OnChange(
            () => this.panels.map(x => x.toJSON()),
            {compare},
                e => this.emit('change', e.value)
        );
    }

    @cell
    panels = new ObservableList<Panel>();
    public getMapPosition!: () => ({center: GeoPoint, zoom: number;});
    @cell
    public selectedPanel: Panel | undefined;
    @cell
    public tileSource: TileSource | undefined;
    public addPanel(size: {width: number; height: number}, rotation: number){
        const position = this.getMapPosition();
        this.panels.push(new Panel(position.center, size, rotation));
    }

    public get geoJson(): FeatureCollection<Polygon> {
        return {
            type: "FeatureCollection",
            features: this.panels.map(x => x.geoJson)
        };
    }
    public get geoJsonSelected(): FeatureCollection<Polygon> {
        return {
            type: "FeatureCollection",
            features: this.selectedPanel ? [this.selectedPanel.geoJson] : []
        };
    }

    public selectPanel(point: GeoPoint){
        for (let panel of this.panels.toArray()) {
            const result = panel.checkIsInside(point);
            if (result){
                this.selectedPanel = panel;
                return;
            }
        }
        this.selectedPanel = undefined;
    }

    public cloneSelectedAndMove(direction: Direction){
        if (!this.selectedPanel) return;
        const newPanel = this.selectedPanel.clone();
        newPanel.move(direction);
        this.panels.push(newPanel);
        this.selectedPanel = newPanel;
    }

    public load(data: Array<PanelJSON>){
        this.panels = new ObservableList<Panel>(data.map(x => new Panel(x.center, x.size, x.rotation)))
    }
}
export const solarStore = new SolarStore();