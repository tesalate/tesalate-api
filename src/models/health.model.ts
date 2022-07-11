import mongoose, { Schema } from 'mongoose';

export interface IHealth {
  _id: number;
  message: string;
}

const tokenSchema = new Schema<IHealth>(
  {
    _id: {
      default: 0,
    },
    message: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Health
 */
const Health = mongoose.model<IHealth>('Health', tokenSchema);

export default Health;
