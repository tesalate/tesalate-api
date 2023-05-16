import fs from 'fs';
import path from 'path';
import moment from 'moment';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import config from '../config/config';
import logger from '../config/logger';
import VehicleData from '../models/vehicleData.model';
import mongoose from 'mongoose';

const { appName } = config;
const copyrightYear = new Date().getFullYear();
const privacyPolicyLink = `${config.publicUrl}/privacy`;

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch((error) =>
      logger.warn(`Unable to connect to email server. Make sure you have configured the SMTP options in .env ${error.stack}`)
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise<void>}
 */
const sendEmail = async (to: string, subject: string, html): Promise<any> => {
  const msg = { sender: config.email.smtp.auth.user, from: config.email.from, to, subject, html };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const filePath = path.join(__dirname, '../templates/forgot-password.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    appName,
    copyrightYear,
    privacyPolicyLink,
    resetPasswordUrl: `${config.publicUrl}/reset-password?token=${token}`,
    validFor: moment.duration(config.jwt.resetPasswordExpirationMinutes * 60000).humanize(),
  };
  const htmlToSend = template(replacements);
  const subject = 'Reset password';

  await sendEmail(to, subject, htmlToSend);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const filePath = path.join(__dirname, '../templates/verify-email.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    appName,
    copyrightYear,
    privacyPolicyLink: `${config.publicUrl}/privacy`,
    verificationEmailUrl: `${config.publicUrl}/verify-email?token=${token}`,
    validFor: moment.duration(config.jwt.verifyEmailExpirationMinutes * 60000).humanize(),
  };
  const htmlToSend = template(replacements);
  const subject = 'Email Verification';
  await sendEmail(to, subject, htmlToSend);
};

/**
 * Send verification email
 * @param {string} to
 * @returns {Promise}
 */
const sendDataCollectorStoppedEmail = async (to) => {
  const filePath = path.join(__dirname, '../templates/data-collecting-stopped.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    appName,
    copyrightYear,
    teslaAccountLink: `${config.publicUrl}/settings/tesla-account`,
    teslaAccountEmail: to,
  };
  const htmlToSend = template(replacements);
  const subject = `⚠️ Oops, we are no longer connected to your Tesla account 🚘`;
  await sendEmail(to, subject, htmlToSend);
};

/** Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendInviteEmail = async (to, token) => {
  const filePath = path.join(__dirname, '../templates/invite-email.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    appName,
    copyrightYear,
    signupLink: `${config.publicUrl}/sign-up/${token}`,
    email: to,
    validFor: moment.duration(2.628e9).humanize(),
  };
  const htmlToSend = template(replacements);
  const subject = `🥳 You're invited to join ${config.appName} 🚘`;
  await sendEmail(to, subject, htmlToSend);
};

/** Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendEndOfWeekEmail = async (to, vehicleId) => {
  const filePath = path.join(__dirname, '../templates/end-of-weekl.html');
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const nowObjectId = new mongoose.Types.ObjectId(Math.floor(now.getTime() / 1000).toString(16) + '0000000000000000');
  const sevenDaysAgoObjectId = new mongoose.Types.ObjectId(
    Math.floor(sevenDaysAgo.getTime() / 1000).toString(16) + '0000000000000000'
  );
  const miles = await VehicleData.aggregate([
    {
      $match: {
        _id: {
          $gte: sevenDaysAgoObjectId,
          $lt: nowObjectId,
        },
        vehicle: new mongoose.Types.ObjectId(vehicleId),
      },
    },
    {
      $sort: {
        'drive_state.timestamp': 1,
      },
    },
    {
      $group: {
        _id: '$vehicle',
        start: {
          $first: '$vehicle_state.odometer',
        },
        end: {
          $last: '$vehicle_state.odometer',
        },
      },
    },
    {
      $project: {
        miles: {
          $subtract: ['$end', '$start'],
        },
      },
    },
  ]);

  const replacements = {
    appName,
    copyrightYear,
    miles,
    email: to,
    validFor: moment.duration(2.628e9).humanize(),
  };
  const htmlToSend = template(replacements);
  const subject = `🚘 ${config.appName} - Your week wrapped up`;
  await sendEmail(to, subject, htmlToSend);
};

export default {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendDataCollectorStoppedEmail,
  sendInviteEmail,
  sendEndOfWeekEmail,
};
