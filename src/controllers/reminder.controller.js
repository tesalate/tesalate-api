const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { reminderService } = require('../services');
const pick = require('../utils/pick');

const createReminder = catchAsync(async (req, res) => {
  const reminder = await reminderService.createReminder(req.body, req.user);
  res.status(httpStatus.CREATED).send(reminder);
});

const getReminders = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, ['_id', 'type', 'message', 'when', 'remindWithin', 'completed', 'vehicle']),
    user: req.user._id,
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await reminderService.queryReminders(filter, options);
  res.send(result);
});

const getReminder = catchAsync(async (req, res) => {
  const reminder = await reminderService.getReminderById(req.params.reminderId, req.user._id);
  if (!reminder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reminder not found');
  }
  res.send(reminder);
});

const updateReminder = catchAsync(async (req, res) => {
  const reminder = await reminderService.updateReminderById(req.params.reminderId, req.body, req.user._id);
  res.send(reminder);
});

const deleteReminder = catchAsync(async (req, res) => {
  await reminderService.deleteReminderById(req.params.reminderId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
};
