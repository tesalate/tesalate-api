import express from 'express';
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import passport from 'passport';
import httpStatus from 'http-status';
import cookieParser from 'cookie-parser';
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

const app = express();

const options = {
  credentials: true,
  origin: function (origin, callback) {
    if (config.cors.allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  exposedHeaders: ['set-cookie'],
};

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
app.use(cors(options));

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
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

app.get('/', (_, res) => {
  res.send('ok');
});

// expressOasGenerator.handleRequests();

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

export default app;
