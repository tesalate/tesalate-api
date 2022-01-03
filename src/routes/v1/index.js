const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const vehicleRoute = require('./vehicle.route');
const vehicleDataPointRoute = require('./vehicleData.route');
const teslaRoute = require('./teslaAccount.route');
const chargeSessionRoute = require('./chargeSession.route');
const driveSessionRoute = require('./driveSession.route');
const mapPointRoute = require('./mapPoint.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/vehicles',
    route: vehicleRoute,
  },
  {
    path: '/tesla-accounts',
    route: teslaRoute,
  },
  {
    path: '/vehicle-data',
    route: vehicleDataPointRoute,
  },
  {
    path: '/charge-sessions',
    route: chargeSessionRoute,
  },
  {
    path: '/drive-sessions',
    route: driveSessionRoute,
  },
  {
    path: '/map-points',
    route: mapPointRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
