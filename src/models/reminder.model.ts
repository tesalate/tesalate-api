import mongoose, { Schema, Types, Model } from 'mongoose';
import { paginate, toJSON } from './plugins';
import { IPaginator, IToJSON } from './types';

export interface IReminder {
  type: string;
  message: string;
  when: number;
  remindWithin: number;
  completed: boolean;
  vehicle: string | Types.ObjectId;
  user: string | Types.ObjectId;
}

const reminder = new Schema<IReminder>(
  {
    type: {
      type: String,
      required: true,
      enum: ['odometer'],
    },
    message: {
      type: String,
      required: true,
      default: '',
    },
    when: {
      type: Number,
      required: true,
    },
    remindWithin: {
      type: Number,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    vehicle: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Vehicle',
      required: [true, 'vehicle is required'],
      autopopulate: false,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      autopopulate: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
reminder.plugin(toJSON);
reminder.plugin(paginate);

reminder.index({ vehicle: 'text', user: 1 });
reminder.index({ user: 1 });

interface ReminderModel extends Model<IReminder>, IPaginator, IToJSON {}

/**
 * @typedef Reminder
 */
const Reminder = mongoose.model<IReminder, ReminderModel>('Reminder', reminder);

export default Reminder;
