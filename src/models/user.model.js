const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      lowercase: true,
      trim: true,
      validate(username) {
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
      default() {
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
      validate(email) {
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
      validate(password) {
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
        select: 'linked email id',
      },
    },
    vehicles: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vehicle',
          autopopulate: true,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);
userSchema.plugin(require('mongoose-autopopulate'));

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if username is taken
 * @param {string} username - The user's username
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isUsernameTaken = async function (username, excludeUserId) {
  const user = await this.findOne({ username, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function () {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

userSchema.post('remove', async function (user) {
  try {
    await mongoose.model('TeslaAccount').findOneAndDelete({ user: user._id });
    await mongoose.model('Vehicle').deleteMany({ user: user._id });
    await mongoose.model('Token').deleteMany({ user: user._id });
  } catch (err) {
    throw new Error('something went wrong', err);
  }
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
