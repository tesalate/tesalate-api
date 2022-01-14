const httpStatus = require('http-status');
const { Reminder } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a reminder
 * @param {Object} reminderBody
 * @returns {Promise<Reminder>}
 */
const createReminder = async (reminderBody, user) => {
  return Reminder.create({ ...reminderBody, user });
};

/**
 * Query for reminders
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryReminders = async (filter, options) => {
  const reminders = await Reminder.paginate(filter, options);
  return reminders;
};

/**
 * Get reminder by id
 * @param {ObjectId} id
 * @param {ObjectId} user
 * @returns {Promise<Reminder>}
 */
const getReminderById = async (id, user) => {
  return Reminder.findOne({ _id: id, user });
};

/**
 * Get reminder by user id
 * @param {string} userId
 * @returns {Promise<Reminder[]>}
 */
const getRemindersByUserId = async (user) => {
  return Reminder.find({ user });
};

/**
 * Update reminder by id
 * @param {ObjectId} reminderId
 * @param {Object} updateBody
 * @returns {Promise<Reminder>}
 */
const updateReminderById = async (reminderId, updateBody, user) => {
  const reminder = await getReminderById(reminderId, user);
  if (!reminder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reminder not found');
  }
  Object.keys(updateBody).forEach((key) => {
    reminder[key] = updateBody[key];
  });
  await reminder.save();
  return reminder;
};

/**
 * Delete reminder by id
 * @param {ObjectId} reminderId
 * @returns {Promise<Reminder>}
 */
const deleteReminderById = async (reminderId, user) => {
  const reminder = await getReminderById(reminderId, user);
  if (!reminder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reminder not found');
  }
  await reminder.remove();
  return reminder;
};

module.exports = {
  createReminder,
  queryReminders,
  getReminderById,
  getRemindersByUserId,
  updateReminderById,
  deleteReminderById,
};
