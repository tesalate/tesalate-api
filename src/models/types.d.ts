export interface GeoJSONPoint {
  coordinates: number[];
  type: 'point';
}

export interface GeoJSONPolygon {
  type: 'polygon';
  coordinates: Array<Array<number[]>>;
}

export interface IPaginator {
  paginate(
    filter: any,
    options: any
  ): {
    results: any;
    page: number;
    limit: number;
    totalPages: number;
    totalResults: any;
  };
}
export interface IToJSON {
  toJSON(): void;
}
