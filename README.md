```bash 
___ ____ ____ ____ _    ____ ___ ____     ____ ___  _ 
 |  |___ [__  |__| |    |__|  |  |___  __ |__| |__] | 
 |  |___ ___] |  | |___ |  |  |  |___     |  | |    | 
 ```
[![Tests](https://github.com/tesalate/main-api/actions/workflows/ci.yml/badge.svg)](https://github.com/tesalate/main-api/actions/workflows/ci.yml)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
***

The main api for [Tesalate](https://app.tesalate.io).

## Quick Start

For the quickest start use [tesalate-compose](https://github.com/tesalate/tesalate-compose).

## Slow Start

1. Install the dependencies:

    ```bash
    yarn install
    ```

2. Set the environment variables:

    ```bash
    cp .env.example .env

    # open .env and modify the environment variables (if needed)
    ```

3. Start MongoDB
4. Start tesalate-api
    ```bash
    yarn dev
    ```


## Table of Contents

- [Features](#features)
- [Commands](#commands)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Authentication](#authentication)
- [Authorization](#authorization)
- [Logging](#logging)
- [Custom Mongoose Plugins](#custom-mongoose-plugins)
- [Linting](#linting)
- [Contributing](#contributing)

## Features

- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Authentication and authorization**: using [passport](http://www.passportjs.org)
- **Validation**: request data validation using [Joi](https://github.com/hapijs/joi)
- **Logging**: using [winston](https://github.com/winstonjs/winston) and [morgan](https://github.com/expressjs/morgan)
- **Testing**: unit and integration tests using [Jest](https://jestjs.io)
- **Error handling**: centralized error handling mechanism
- **API documentation**: with [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc) and [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)
- **Process management**: advanced production process management using [PM2](https://pm2.keymetrics.io)
- **Dependency management**: with [Yarn](https://yarnpkg.com)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Security**: set security HTTP headers using [helmet](https://helmetjs.github.io)
- **Sanitizing**: sanitize request data against xss and query injection
- **CORS**: Cross-Origin Resource-Sharing enabled using [cors](https://github.com/expressjs/cors)
- **Compression**: gzip compression with [compression](https://github.com/expressjs/compression)
- **CI**: continuous integration with [GitHub Actions](https://docs.github.com/en/actions)
- **Docker support**
- **Code coverage**: using [jest coverage report](https://github.com/ArtiomTr/jest-coverage-report-action)
- **Git hooks**: with [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
- **Editor config**: consistent editor configuration using [EditorConfig](https://editorconfig.org)

## Commands

Running locally:

```bash
yarn dev
```

Running in production:

Use [tesalate-compose](https://github.com/tesalate/tesalate-compose).

Testing:

```bash
# run all tests
yarn test

# run all tests in watch mode
yarn test:watch

# run test coverage
yarn test:coverage
```

Docker:

```bash
# run docker container in development mode
yarn docker:dev

# run docker container in production mode
yarn docker:prod

# run all tests in a docker container
yarn docker:test
```
OR use [tesalate-compose](https://github.com/tesalate/tesalate-compose)

Linting:

```bash
# run ESLint
yarn lint

# fix ESLint errors
yarn lint:fix

# run prettier
yarn prettier

# fix prettier errors
yarn prettier:fix
```

## Environment Variables

The environment variables can be generated with [tesalate-compose](https://github.com/tesalate/tesalate-compose) or you can copy/paste the following into a `.env` file in the root of the project:

```bash
#   ____  _______     __  _____ _   ___     __
#  |  _ \| ____\ \   / / | ____| \ | \ \   / /
#  | | | |  _|  \ \ / /  |  _| |  \| |\ \ / /
#  | |_| | |___  \ V /   | |___| |\  | \ V /
#  |____/|_____|  \_/    |_____|_| \_|  \_/
#

BUILD_ENVIRONMENT=dev

## Public
PUBLIC_URL=http://localhost:4400
APP_NAME=Tesalate

## Mongo DB
MONGODB_URL=mongodb://127.0.0.1:27017/example-db

## API
API_PORT=4400

## JWT
JWT_SECRET="gAwDJFnGc1pwv3WXD2txNtn6IQB..."
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=90
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=90
# Number of minutes after which a reset password token expires
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
# Number of minutes after which a verify email token expires
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=1440

# SMTP configuration options for the email service
# For testing, you can use a fake SMTP service like Ethereal: https://ethereal.email/create
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USERNAME=example.email@ethereal.email
SMTP_PASSWORD="1234"
EMAIL_FROM="Tesalate <noreply@Tesalate.io>"

## TESLA API
TESLA_OAUTH_V3_URL=https://auth.tesla.com/oauth2/v3
TESLA_OWNER_API_URL=https://owner-api.teslamotors.com/api/1
TESLA_OWNERAPI_CLIENT_ID=81527cff06843c8634fdc09e...
TESLA_OWNERAPI_CLIENT_SECRET=c7257eb71a564034f9419ee651c7d0e...

## CORS
ACCEPTED_CORS=["http://localhost:4400"]
```

## Project Structure

```
src\
 |--config\         # Environment variables and configuration related things
 |--controllers\    # Route controllers (controller layer)
 |--docs\           # Swagger files
 |--middleware\     # Custom express middleware
 |--models\         # Mongoose models (data layer)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--app.ts          # Express app
 |--db.ts           # Change stream setup
 |--index.js        # App entry point
 |--websockets.ts   # Websocket setup
```

## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:4400/v1/docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files.

### API Endpoints

List of available routes:

**Auth routes**:\
`POST /v1/auth/register` - register\
`POST /v1/auth/login` - login\
`POST /v1/auth/refresh-tokens` - refresh auth tokens\
`POST /v1/auth/forgot-password` - send reset password email\
`POST /v1/auth/reset-password` - reset password\
`POST /v1/auth/send-verification-email` - send verification email\
`POST /v1/auth/verify-email` - verify email

**Charge Session routes**:\
`GET /v1/` - gets charge sessions\
`GET /v1/:chargeSessionId - gets a charge session by id\
`DELETE /v1/:chargeSessionId` - deletes a single charge session

**Drive Session routes**:\
`GET /v1/` - gets drive sessions\
`GET /v1/:driveSessionId - gets a drive session by id\
`DELETE /v1/:driveSessionId` - deletes a single drive session

**Map Point routes**:\
`GET /v1/` - gets map points\
`GET /v1/distance/:vehicle` - gets map points that are n KM apart from each other\
`GET /v1/:mapPointId - gets a map point by id\
`DELETE /v1/:mapPointId` - deletes a single map point

**Reminder routes**:\
`GET /v1/` - gets all reminders\
`POST /v1/` - create a reminder\
`GET /v1/:reminderId` - get a reminder by id\
`PATCH /v1/:reminderId` - update a reminder by id\
`DELETE /v1/:reminderId` - delete a reminder by id

**Tesla Account routes**:\
`POST /v1/login` - link a tesla account\
`DELETE /v1/login` - unlink a tesla account\
`GET /v1/` - gets all Tesla Accounts <!--- Probably shouldn't have this --->\
`POST /v1/` - create a tesla account in db\
`GET /v1/:teslaAccountId` - get a tesla account by id\
`PATCH /v1/:teslaAccountId` - update a tesla account by id\
`DELETE /v1/:teslaAccountId` - delete a tesla account by id

**User routes**:\
`POST /v1/users` - create a user\
`GET /v1/users` - get all users\
`GET /v1/users/:userId` - get user\
`PATCH /v1/users/:userId` - update user\
`DELETE /v1/users/:userId` - delete user

**Vehicle routes**:\
`GET /v1/` - gets all vehicles\
`POST /v1/` - create a vehicle\
`GET /v1/:vehicleId` - get a vehicle by id\
`PATCH /v1/:vehicleId` - update a vehicle by id\
`DELETE /v1/:vehicleId` - delete a vehicle by id

**Vehicle Data routes**:\
`GET /v1/` - gets all vehicle data\
`GET /v1/:vehicleId` - get a vehicle data by id\
`DELETE /v1/:vehicleId` - delete a vehicle data by id


## Error Handling

The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

```typescript
import catchAsync from '../utils/catchAsync';

const controller = catchAsync(async (req, res) => {
  // this error will be forwarded to the error handling middleware
  throw new Error('Something wrong happened');
});
```

The error handling middleware sends an error response, which has the following format:

```json
{
  "code": 404,
  "message": "Not found"
}
```

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

For example, if you are trying to get a user from the DB who is not found, and you want to send a 404 error, the code should look something like:

```typescript
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import User from '../models/User';

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
};
```

## Validation

Request data is validated using [Joi](https://joi.dev/). Check the [documentation](https://joi.dev/api/) for more details on how to write Joi validation schemas.

The validation schemas are defined in the `src/validations` directory and are used in the routes by providing them as parameters to the `validate` middleware.

```typescript
import express from 'express';
import validate from '../../middleware/validate';
import userValidation from '../../validations/user.validation';
import userController from '../../controllers/user.controller';

const router = express.Router();

router.post('/users', validate(userValidation.createUser), userController.createUser);
```

## Authentication

To require authentication for certain routes, you can use the `auth` middleware.

```typescript
import express from 'express';
import auth from '../../middleware/auth';
import userController from '../../controllers/user.controller';

const router = express.Router();

router.post('/users', auth(), userController.createUser);
```

These routes require a valid JWT access token in the Authorization request header using the Bearer schema. If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

**Generating Access Tokens**:

An access token can be generated by making a successful call to the register (`POST /v1/auth/register`) or login (`POST /v1/auth/login`) endpoints. The response of these endpoints also contains refresh tokens (explained below).

An access token is valid for 90 minutes. You can modify this expiration time by changing the `JWT_ACCESS_EXPIRATION_MINUTES` environment variable in the .env file.

**Refreshing Access Tokens**:

After the access token expires, a new access token can be generated, by making a call to the refresh token endpoint (`POST /v1/auth/refresh-tokens`) and sending along a valid refresh token in the request body. This call returns a new access token and a new refresh token.

A refresh token is valid for 90 days. You can modify this expiration time by changing the `JWT_REFRESH_EXPIRATION_DAYS` environment variable in the .env file.

## Authorization

The `auth` middleware can also be used to require certain rights/permissions to access a route.

```typescript
import express from 'express';
import auth from '../../middleware/auth';
import userController from '../../controllers/user.controller';

const router = express.Router();

router.post('/users', auth('manageUsers'), userController.createUser);
```

In the example above, an authenticated user can access this route only if that user has the `manageUsers` permission.

The permissions are role-based. You can view the permissions/rights of each role in the `src/config/roles.js` file.

If the user making the request does not have the required permissions to access this route, a Forbidden (403) error is thrown.

## Logging

Import the logger from `src/config/logger.js`. It is using the [Winston](https://github.com/winstonjs/winston) logging library.

Logging should be done according to the following severity levels (ascending order from most important to least important):

```typescript
import logger from '<path to src>/config/logger';

logger.error('message'); // level 0
logger.warn('message'); // level 1
logger.info('message'); // level 2
logger.http('message'); // level 3
logger.verbose('message'); // level 4
logger.debug('message'); // level 5
```

In development mode, log messages of all severity levels will be printed to the console.

In production mode, only `info`, `warn`, and `error` logs will be printed to the console.\
It is up to the server (or process manager) to actually read them from the console and store them in log files.\
This app uses pm2 in production mode, which is already configured to store the logs in log files.

Note: API request information (request url, response code, timestamp, etc.) are also automatically logged (using [morgan](https://github.com/expressjs/morgan)).

## Custom Mongoose Plugins

The app also contains 2 custom mongoose plugins that you can attach to any mongoose model schema. You can find the plugins in `src/models/plugins`.

```typescript
import mongoose from 'mongoose';
const { toJSON, paginate } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    /* schema definition here */
  },
  { timestamps: true }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

const User = mongoose.model('User', userSchema);
```

### toJSON

The toJSON plugin applies the following changes in the toJSON transform call:

- removes \_\_v, createdAt, updatedAt, and any schema path that has private: true

### paginate

The paginate plugin adds the `paginate` static method to the mongoose schema.

Adding this plugin to the `User` model schema will allow you to do the following:

```typescript
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};
```

The `filter` param is a regular mongo filter.

The `options` param can have the following (optional) fields:

```typescript
const options = {
  sortBy: 'name:desc', // sort order
  limit: 5, // maximum results per page
  page: 2, // page number
};
```

The plugin also supports sorting by multiple criteria (separated by a comma): `sortBy: name:desc,role:asc`

The `paginate` method returns a Promise, which fulfills with an object having the following properties:

```json
{
  "results": [],
  "page": 2,
  "limit": 5,
  "totalPages": 10,
  "totalResults": 48
}
```

## Linting

Linting is done using [ESLint](https://eslint.org/) and [Prettier](https://prettier.io).

In this app, ESLint is configured to follow the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base) with some modifications. It also extends [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to turn off all rules that are unnecessary or might conflict with Prettier.

To modify the ESLint configuration, update the `.eslintrc.json` file. To modify the Prettier configuration, update the `.prettierrc.json` file.

To prevent a certain file or directory from being linted, add it to `.eslintignore` and `.prettierignore`.

To maintain a consistent coding style across different IDEs, the project contains `.editorconfig`

## Contributing

Contributions are more than welcome! Please check out the [contributing guide](CONTRIBUTING.md).

## License

[MIT](LICENSE)
