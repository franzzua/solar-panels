import type {LngLat} from "@maptiler/sdk";

export class GeoUtil{
    static EarthRadius = 6378137;
    static MeridianDegreePerMeter = 360/(2*Math.PI*this.EarthRadius);
    static ParallelDegreePerMeter = (lat: number) => this.MeridianDegreePerMeter/Math.cos(lat/180*Math.PI);

    static sum(a: GeoPoint, b: GeoPoint){
        return {
            lat: a.lat + b.lat,
            lng: a.lng + b.lng
        }
    }
    static sub(a: GeoPoint, b: GeoPoint){
        return {
            lat: a.lat - b.lat,
            lng: a.lng - b.lng
        }
    }
    static rotate(a: Point, degree: number){
        const cos = Math.cos(degree/180*Math.PI);
        const sin = Math.sin(degree/180*Math.PI);
        return {
            x: a.x * cos - a.y * sin,
            y: a.x * sin + a.y * cos
        }
    }


    static fromGeo(point: GeoPoint, lat: number){
        return {
            y: point.lat / GeoUtil.MeridianDegreePerMeter,
            x: point.lng / GeoUtil.ParallelDegreePerMeter(lat)
        }
    }
    static toGeo(point: Point, lat: number){
        return {
            lat: point.y * GeoUtil.MeridianDegreePerMeter,
            lng: point.x * GeoUtil.ParallelDegreePerMeter(lat)
        }
    }
}

export type GeoPoint = Pick<LngLat, "lng"|"lat">;
export type Point = {x: number; y: number;}

