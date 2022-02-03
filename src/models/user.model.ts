import mongoose, { Schema, Types, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { toJSON, paginate } from './plugins';
import { roles, UserRoles } from '../config/roles';
import { IPaginator, IToJSON } from './types';

export interface IUser {
  _id: string | Types.ObjectId;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRoles;
  isEmailVerified: boolean;
  teslaAccount: string | Types.ObjectId | null;
  vehicles: string[] | Types.ObjectId[];
  isPasswordMatch(password: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      lowercase: true,
      trim: true,
      validate(username: string) {
        if (!username.match(/^(?![0-9])(?=.{4,36}$)(?:[a-zA-Z_\d]+(?:(?:\.|-|_)[a-zA-Z])*)+$/)) {
          throw new Error('Invalid username');
        }
      },
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      unique: true,
      trim: true,
      default(this: IUser) {
        return this.username;
      },
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(email: string) {
        if (!validator.isEmail(email)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(password: string) {
        if (!password.match(/\d/) || !password.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    teslaAccount: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'TeslaAccount',
      default: null,
      autopopulate: {
        select: 'linked email _id vehicles',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        delete ret.id;
      },
    },
    toObject: {
      virtuals: true,
      transform(_, ret) {
        delete ret.id;
      },
    },
  }
);

userSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'user',
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
userSchema.plugin(require('mongoose-autopopulate'));

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email: string, excludeUserId: Types.ObjectId): Promise<boolean> {
  const user: IUser = (await this.findOne({ email, _id: { $ne: excludeUserId } })) as IUser;
  return !!user;
};

/**
 * Check if username is taken
 * @param {string} username - The user's username
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isUsernameTaken = async function (username: string, excludeUserId: Types.ObjectId): Promise<boolean> {
  const user = (await this.findOne({ username, _id: { $ne: excludeUserId } })) as IUser;
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
});

userSchema.post('remove', async (user: IUser) => {
  try {
    // if a user is deleted, remove all associated documents from all collections
    await mongoose.model('TeslaAccount').findOneAndDelete({ user: user._id });
    await mongoose.model('Vehicle').deleteMany({ user: user._id });
    await mongoose.model('Token').deleteMany({ user: user._id });
    await mongoose.model('DriveSession').deleteMany({ user: user._id });
    await mongoose.model('ChargeSession').deleteMany({ user: user._id });
    await mongoose.model('Reminder').deleteMany({ user: user._id });
    await mongoose.model('MapPoint').deleteMany({ user: user._id });
    await mongoose.model('VehicleData').deleteMany({ user: user._id });
  } catch (err) {
    throw new Error('something went wrong post remove of a user');
  }
});

interface UserModel extends Model<IUser>, IPaginator, IToJSON {
  isUsernameTaken(username: string, excludeUserId?: Types.ObjectId): boolean;
  isEmailTaken(username: string, excludeUserId?: Types.ObjectId): boolean;
}

/**
 * @typedef User
 */
const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
