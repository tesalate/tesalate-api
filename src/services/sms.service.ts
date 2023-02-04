import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { Twilio } from 'twilio';
import config from '../config/config';
import logger from '../config/logger';

const {
  appName,
  sms: { from, auth, sid },
} = config;

const client = new Twilio(sid, auth);

const sendSMS = async (to: string, body: string): Promise<void> => {
  client.messages.create({ from, to, body });
};

const sendDataCollectorStoppedSMS = async (to) => {
  const body = `⚠️ Oops, we are no longer connected to your Tesla account 🚘\n\nPlease visit ${config.publicUrl} to re-link your account`;
  await sendSMS(to, body);
};

export default {
  sendSMS,
  sendDataCollectorStoppedSMS,
};
