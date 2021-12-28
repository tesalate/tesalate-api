const mongoose = require('mongoose');
const faker = require('faker');
const Charger = require('../../src/models/charger.model');

const charger = {
  address_line_1: faker.address.streetAddress(),
  address_line_2: faker.address.secondaryAddress(),
  address_notes: faker.lorem.sentence(),
  address: faker.address.streetAddress(),
  amenities: faker.lorem.sentence(),
  baidu_lat: faker.address.latitude(),
  baidu_lng: faker.address.longitude(),
  chargers: faker.lorem.words(12),
  city: faker.address.city(),
  common_name: faker.address.cityName(),
  destination_charger_logo: faker.random.alphaNumeric(),
  destination_website: faker.internet.url(),
  directions_link: faker.internet.url(),
  emails: Array(
    faker.datatype.number({
      min: 0,
      max: 12,
    })
  ).fill(faker.internet.email()),
  geocode: faker.datatype.string(12),
  hours: faker.random.alphaNumeric(),
  is_gallery: faker.datatype.boolean(),
  kiosk_pin_x: faker.datatype.string(1),
  kiosk_pin_y: faker.datatype.string(1),
  kiosk_zoom_pin_x: faker.datatype.string(1),
  kiosk_zoom_pin_y: faker.datatype.string(1),
  latitude: faker.address.latitude(),
  location_id: faker.datatype.string(12),
  longitude: faker.address.longitude(),
  nid: faker.datatype.string(1),
  open_soon: faker.datatype.string(1),
  path: faker.internet.url(),
  postal_code: faker.datatype.string(5),
  province_state: faker.address.stateAbbr(),
  sales_phone: Array(
    faker.datatype.number({
      min: 0,
      max: 12,
    })
  ).fill({ label: faker.lorem.words(4), number: faker.phone.phoneNumber(), line_below: faker.datatype.string(6) }),
  sales_representative: faker.datatype.boolean(),
  sub_region: faker.address.state(),
  title: faker.lorem.words(3),
  trt_id: faker.datatype.string(1),
  geoJSON: faker.random.arrayElement([
    {
      type: 'Point',
      coordinates: [faker.datatype.number({ min: -100, max: 100 }), faker.datatype.number({ min: -100, max: 100 })],
    },
  ]),
};

const superchargerNAOne = {
  ...charger,
  location_type: ['supercharger', 'standard charger'],
  _id: mongoose.Types.ObjectId(),
  country: 'north_america',
  region: 'north_america',
};

const chargerNATwo = {
  ...charger,
  location_type: ['standard charger'],
  _id: mongoose.Types.ObjectId(),
  country: 'north_america',
  region: 'north_america',
};

const superchargerEUOne = {
  ...charger,
  location_type: ['supercharger', 'standard charger'],
  _id: mongoose.Types.ObjectId(),
  country: 'europe',
  region: 'europe',
};

const chargerEUTwo = {
  ...charger,
  location_type: ['standard charger'],
  _id: mongoose.Types.ObjectId(),
  country: 'europe',
  region: 'europe',
};

const insertChargers = async (chargers) => {
  await Charger.insertMany(chargers.map((data) => data));
};

module.exports = {
  superchargerNAOne,
  chargerNATwo,
  superchargerEUOne,
  chargerEUTwo,
  insertChargers,
};
