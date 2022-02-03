import mongoose, { Schema, Types, Model } from 'mongoose';
import validator from 'validator';
import { toJSON, paginate } from './plugins';
import { IPaginator, IToJSON } from './types';
import { IUser } from './user.model';

export interface ITeslaAccount {
  user: string | Types.ObjectId;
  vehicles: string[] | Types.ObjectId[];
  email: string;
  access_token: string;
  refresh_token: string;
  linked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teslaAccountSchema = new Schema<ITeslaAccount>(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    access_token: {
      type: String,
      trim: true,
      private: true, // used by the toJSON plugin
    },
    refresh_token: {
      type: String,
      trim: true,
      private: true, // used by the toJSON plugin
    },
    linked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

teslaAccountSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'teslaAccount',
});

// add plugin that converts mongoose to json
teslaAccountSchema.plugin(toJSON);
teslaAccountSchema.plugin(paginate);
teslaAccountSchema.plugin(require('mongoose-autopopulate'));

teslaAccountSchema.index({ user: 1, email: 1 }, { unique: true });

teslaAccountSchema.post('save', async (account) => {
  try {
    const user = await mongoose.model<IUser>('User').findById(account.user);
    if (!user) return;
    user.teslaAccount = account._id;
    return user.save();
  } catch (err) {
    throw new Error('something went wrong post save of tesla account');
  }
});

teslaAccountSchema.post('remove', { query: false, document: true }, async (account) => {
  try {
    const user = await mongoose.model<IUser>('User').findById(account.user);
    if (!user) return;
    user.teslaAccount = null;
    return user.save();
  } catch (err) {
    throw new Error('something went wrong post remove of testa account');
  }
});

/**
 * Check if tesla account email is taken
 * @param {string} email - The tesla account email
 * @param {ObjectId} [excludeUserId] - The id of the tesla account to be excluded
 * @returns {Promise<boolean>}
 */
teslaAccountSchema.statics.isEmailTaken = async function (email: string, excludeUserId: Types.ObjectId): Promise<boolean> {
  const account = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!account;
};

interface TeslaAccountModel extends Model<ITeslaAccount>, IPaginator, IToJSON {
  isEmailTaken(username: string, excludeUserId?: Types.ObjectId): boolean;
}

/**
 * @typedef TeslaAccount
 */
const TeslaAccount = mongoose.model<ITeslaAccount, TeslaAccountModel>('TeslaAccount', teslaAccountSchema);

export default TeslaAccount;
