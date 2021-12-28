const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const teslaAccountSchema = mongoose.Schema(
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
    },
    refresh_token: {
      type: String,
      trim: true,
    },
    linked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
teslaAccountSchema.plugin(toJSON);
teslaAccountSchema.plugin(paginate);

teslaAccountSchema.index({ user: 1, email: 1 }, { unique: true });

teslaAccountSchema.post('save', async (account) => {
  try {
    const user = await mongoose.model('User').findById(account.user);
    user.teslaAccount = account._id;
    return user.save();
  } catch (err) {
    throw new Error('something went wrong', err);
  }
});

teslaAccountSchema.post('remove', { query: false, document: true }, async (account) => {
  try {
    const user = await mongoose.model('User').findById(account.user);
    user.teslaAccount = null;
    return user.save();
  } catch (err) {
    throw new Error('something went wrong', err);
  }
});

/**
 * Check if tesla account email is taken
 * @param {string} email - The tesla account email
 * @param {ObjectId} [excludeUserId] - The id of the tesla account to be excluded
 * @returns {Promise<boolean>}
 */
teslaAccountSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const account = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!account;
};

/**
 * @typedef TeslaAccount
 */
const TeslaAccount = mongoose.model('TeslaAccount', teslaAccountSchema);

module.exports = TeslaAccount;
