import mongoose, {Schema} from 'mongoose';
import { toJSON } from './plugins';
import { IToJSON } from './types';

export interface IFlag extends IToJSON {
  systemName: string;
  type: string;
  message: string;
}

const flagSchema = new Schema<IFlag>(
  {
    systemName: {
      type: String,
      required: [true, 'Unique name is required'],
      unique: true,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info',
      required: [true, 'Type is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
flagSchema.plugin(toJSON);
flagSchema.index({ id: 1 });

/**
 * @typedef Flag
 */
const Flag = mongoose.model<IFlag>('Flag', flagSchema);

export default Flag;
