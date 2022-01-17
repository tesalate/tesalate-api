const fs = require('fs');
const path = require('path');
const moment = require('moment');
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const config = require('../config/config');
const logger = require('../config/logger');

const { appName } = config;
const copyrightYear = new Date().getFullYear();
const privacyPolicyLink = `${config.publicUrl}/privacy`;

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, html) => {
  const msg = { sender: config.email.SMTP_USERNAME, from: config.email.from, to, subject, html };
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
 * @param {string} token
 * @returns {Promise}
 */
const sendDataCollectorStoppedEmail = async (to, displayName) => {
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
  const subject = `⚠️ Oops, we are no longer connected to ${displayName} 🚘`;
  await sendEmail(to, subject, htmlToSend);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendDataCollectorStoppedEmail,
};
