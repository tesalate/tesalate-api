import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import cookieParser from 'cookie-parser';
import health from './routes/health.route';
// import expressOasGenerator from 'express-oas-generator';
// import mongoose from 'mongoose';
import config from './config/config';
import morgan from './config/morgan';
import { jwtStrategy } from './config/passport';
import authLimiter from './middleware/rateLimiter';
import routes from './routes/v1';
import { errorConverter, errorHandler } from './middleware/error';
import ApiError from './utils/ApiError';

// const modelNames = mongoose.modelNames();
const isProd = config.env === 'production';
const app = express();

// expressOasGenerator.handleResponses(app, {
//   predefinedSpec(spec) {
//     return spec;
//   },
//   specOutputPath: './swagger/NEW_test_spec.json',
//   ignoredNodeEnvironments: ['production', 'test', 'development'],
//   mongooseModels: modelNames,
//   alwaysServeDocs: true,
//   specOutputFileBehavior: 'PRESERVE',
// });

// const options = {
//   credentials: true,
//   origin: function (origin, callback) {
//     console.log('WHAT', { ALLOWED: config.cors.allowedOrigins, origin });
//     if (config.cors.allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'development') {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   // origin: "*",
//   exposedHeaders: ['set-cookie'],
// };

// app.use(cors(options));

const options: cors.CorsOptions = {
  origin: config.cors.allowedOrigins,
  exposedHeaders: ['set-cookie'],
  credentials: true,
};

app.use(cors(options));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/* @ts-ignore */
app.options('*', cors());

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// Then pass these options to cors:

// jwt authentication
app.use(cookieParser());
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (isProd) {
  app.use('/v1/auth', authLimiter);
}

// health routes
app.use('/health', health);

// v1 api routes
app.use('/v1', routes);

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// expressOasGenerator.handleRequests();

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

export default app;
