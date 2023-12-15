import type {GeoPoint} from "@/services/geo.util";
import type {Feature, Polygon} from "geojson";
import {GeoUtil} from "@/services/geo.util";
import {cell} from "@cmmn/cell";

export class Panel{
    /**
     * @param center position of center - latitude and longitude
     * @param size width and height in meters
     * @param rotation rotation in degrees [0, 180), 0 means width by horizontal and height by vertical
     */
    constructor(center: GeoPoint,
                private size: {width: number; height: number},
                rotation: number) {
        this.center = center;
        this.rotation = rotation;
    }
    @cell
    center: GeoPoint;
    @cell
    private rotation: number;

    public id = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(x => (+x).toString(16)).join('')
    private get sizeInDegree(){
        return {
            x: this.size.width,
            y: this.size.height,
        }
    };

    private get frame(){
        return [
            {x: -this.sizeInDegree.x/2, y: -this.sizeInDegree.y/2, },
            {x: -this.sizeInDegree.x/2, y: +this.sizeInDegree.y/2, },
            {x: +this.sizeInDegree.x/2, y: +this.sizeInDegree.y/2, },
            {x: +this.sizeInDegree.x/2, y: -this.sizeInDegree.y/2, },
            {x: -this.sizeInDegree.x/2, y: -this.sizeInDegree.y/2, },
        ];
    }

    private get frameRotated(){
        return this.frame.map(x => GeoUtil.rotate(x, this.rotation))
    }

    private get contour(){
        return this.frameRotated.map(x => GeoUtil.sum(this.center, GeoUtil.toGeo(x, this.center.lat)));
    }

    public checkIsInside(point: GeoPoint){
        const centerShift = GeoUtil.fromGeo(GeoUtil.sub(point, this.center), this.center.lat);
        const rotated = GeoUtil.rotate(centerShift, -this.rotation);
        if (Math.abs(rotated.x) > this.size.width/2)
            return false;

        if (Math.abs(rotated.y) > this.size.height/2)
            return false;
        return true;
    }

    get geoJson(): Feature<Polygon>{
        return {
            "type": "Feature",
            "properties": { "name": this.id },
            "geometry": {
                "type": "Polygon",
                "coordinates": [this.contour.map(p => [p.lng, p.lat])]
            }
        };
    }

    clone() {
        return new Panel(
            this.center,
            this.size,
            this.rotation
        );
    }

    move(direction: Direction) {
        const shiftVector = (() => {
            switch (direction) {
                case "left":
                     return {x: -this.size.width, y: 0};
                case "top":
                    return {x: 0, y: this.size.height};
                case "right":
                    return {x: this.size.width, y: 0};
                case "bottom":
                    return {x: 0, y: -this.size.height};
            }
        })();
        const rotated = GeoUtil.rotate(shiftVector, this.rotation);
        this.center = GeoUtil.sum(this.center, GeoUtil.toGeo(rotated, this.center.lat));
    }

    get markerPosition(){
        const shift = GeoUtil.rotate({x: 0, y: 2*this.size.height}, this.rotation);
        return GeoUtil.sum(this.center, GeoUtil.toGeo(shift, this.center.lat));
    }

    rotate(lngLat: GeoPoint){
        const point = GeoUtil.fromGeo(GeoUtil.sub(lngLat, this.center), this.center.lat);
        this.rotation = Math.atan2(point.y, point.x)*180/Math.PI - 90;
    }

    setCenter(point: GeoPoint){
        this.center = point;
    }

    public toJSON(): PanelJSON{
        return {
            center: {...this.center},
            rotation: this.rotation,
            size: {...this.size}
        };
    }
}