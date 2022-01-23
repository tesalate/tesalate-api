import mongoose, {Schema} from 'mongoose';
import { paginate, toJSON } from './plugins';
import { GeoJSONPoint, IToJSON } from './types';
import { IPaginator } from './types.d';


export interface ICharger extends IPaginator, IToJSON {
  address_line_1: string;
  address_line_2: string;
  address_notes: string;
  address: string;
  amenities: string;
  baidu_lat: string;
  baidu_lng: string;
  chargers: string;
  city: string;
  common_name: string;
  country: string;
  destination_charger_logo: string;
  destination_website: string;
  directions_link: string;
  emails: Array<string>;
  geocode: string;
  hours: string;
  is_gallery: boolean;
  kiosk_pin_x: string;
  kiosk_pin_y: string;
  kiosk_zoom_pin_x: string;
  kiosk_zoom_pin_y: string;
  latitude: string;
  location_id: string;
  location_type: Array<string>;
  longitude: string;
  nid: string;
  open_soon: string;
  path: string;
  postal_code: string;
  province_state: string;
  region: string;
  sales_phone: Array<string>;
  sales_representative: boolean;
  sub_region: string;
  title: string;
  trt_id: string;
  geoJSON: GeoJSONPoint;
}


const charger = new Schema<ICharger>(
  {
    address_line_1: { type: String },
    address_line_2: { type: String },
    address_notes: { type: String },
    address: { type: String },
    amenities: { type: String },
    baidu_lat: { type: String },
    baidu_lng: { type: String },
    chargers: { type: String },
    city: { type: String },
    common_name: { type: String },
    country: { type: String },
    destination_charger_logo: { type: String },
    destination_website: { type: String },
    directions_link: { type: String },
    emails: { type: Array },
    geocode: { type: String },
    hours: { type: String },
    is_gallery: { type: Boolean },
    kiosk_pin_x: { type: String },
    kiosk_pin_y: { type: String },
    kiosk_zoom_pin_x: { type: String },
    kiosk_zoom_pin_y: { type: String },
    latitude: { type: String },
    location_id: { type: String },
    location_type: { type: Array },
    longitude: { type: String },
    nid: { type: String },
    open_soon: { type: String },
    path: { type: String },
    postal_code: { type: String },
    province_state: { type: String },
    region: { type: String },
    sales_phone: { type: Array },
    sales_representative: { type: Boolean },
    sub_region: { type: String },
    title: { type: String, required: true },
    trt_id: { type: String },
    geoJSON: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
charger.plugin(toJSON);
charger.plugin(paginate);

charger.index({ GeoJSON: '2dsphere' });
charger.index({ location_id: 1 });
charger.index({ city: 1 });
charger.index({ postal_code: 1 });
charger.index({ sub_region: 1 });

/**
 * @typedef Charger
 */
const Charger = mongoose.model<ICharger>('Charger', charger);

export default Charger;
