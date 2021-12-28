const mongoose = require('mongoose');
const { paginate, toJSON } = require('./plugins');

const charger = mongoose.Schema(
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
const Charger = mongoose.model('Charger', charger);

module.exports = Charger;
