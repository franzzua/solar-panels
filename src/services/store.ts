import type {GeoPoint} from "@/services/geo.util";
import type {FeatureCollection, Polygon} from "geojson";
import {Panel} from "@/services/panel";
import {cell, ObservableList} from "@cmmn/cell";

class SolarStore {
    @cell
    panels = new ObservableList<Panel>();
    public getMapPosition!: () => ({center: GeoPoint, zoom: number;});
    @cell
    public selectedPanel: Panel | undefined;
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
}
export const solarStore = new SolarStore();