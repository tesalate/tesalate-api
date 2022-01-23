import mongoose, { Schema, Types } from 'mongoose';
import { toJSON } from './plugins';
import { TokenTypesEnum } from '../config/tokens';
import { IToJSON } from './types';

export interface IToken extends IToJSON {
  token: string;
  user: string | Types.ObjectId;
  type: string;
  expiresAt: Date;
  blacklisted: boolean;
}

const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TokenTypesEnum),
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ user: 1 });

/**
 * @typedef Token
 */
const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;
