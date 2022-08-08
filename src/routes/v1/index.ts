import express from 'express';
import authRoute from './auth.route';
import userRoute from './user.route';
import docsRoute from './docs.route';
import vehicleRoute from './vehicle.route';
import reminderRoute from './reminder.route';
import vehicleDataPointRoute from './vehicleData.route';
import teslaRoute from './teslaAccount.route';
import chargeSessionRoute from './chargeSession.route';
import driveSessionRoute from './driveSession.route';
import mapPointRoute from './mapPoint.route';
import settingsRoute from './settings.route';
import statsRoute from './stats.route';
import sessionRoute from './session.route';
import config from '../../config/config';

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
    path: '/reminders',
    route: reminderRoute,
  },
  {
    path: '/tesla-account',
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
  {
    path: '/settings',
    route: settingsRoute,
  },
  {
    path: '/stats',
    route: statsRoute,
  },
  {
    path: '/sessions',
    route: sessionRoute,
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

export default router;
