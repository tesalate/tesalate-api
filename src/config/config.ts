import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config();
// dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    APP_NAME: Joi.string().description('application name').default('tesalate'),
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(4400),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    MONGODB_VERSION: Joi.string().default('5.0.6'),
    REDIS_HOST: Joi.string().default('defualt'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().description('Password for Redis'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(90).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    TESLA_OAUTH_V3_URL: Joi.string().description('tesla oauth v3 api url').default('https://auth.tesla.com/oauth2/v3'),
    TESLA_OWNER_API_URL: Joi.string().description('tesla owner api url').default('https://owner-api.teslamotors.com'),
    TESLA_OWNERAPI_CLIENT_ID: Joi.string().required(),
    TESLA_OWNERAPI_CLIENT_SECRET: Joi.string().required(),
    PUBLIC_URL: Joi.string().description('the url for the site').required(),
    MAX_COOKIE_AGE: Joi.number()
      .default(86400 * 1000 * 60)
      .description('minutes after which cookies expire'),
    ACCEPTED_CORS: Joi.string().description('allowed urls for cors').required(),
    REQUIRES_INVITE: Joi.boolean().description('users must be invited to register').default(true),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  appName: envVars.APP_NAME,
  publicUrl: envVars.PUBLIC_URL,
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  requiresInvite: envVars.REQUIRES_INVITE,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '_test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    version: envVars.MONGODB_VERSION,
  },
  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    user: envVars.REDIS_USER,
    password: envVars.REDIS_PASSWORD ?? null,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    maxCookieAge: envVars.MAX_COOKIE_AGE,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  tesla: {
    oauthUrl: envVars.TESLA_OAUTH_V3_URL,
    ownerUrl: envVars.TESLA_OWNER_API_URL,
    clientId: envVars.TESLA_OWNERAPI_CLIENT_ID,
    clientSecret: envVars.TESLA_OWNERAPI_CLIENT_SECRET,
  },
  cors: {
    allowedOrigins: JSON.parse(envVars.ACCEPTED_CORS),
  },
};
