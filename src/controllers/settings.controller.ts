import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { settingsService } from '../services';

const createSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.createSettings({ ...req.body, user: req.user._id });
  res.status(httpStatus.CREATED).send(settings);
});

const getSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.getSettingsByUserId(req.user._id, req.query.isMobile);
  if (!settings) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Settings not found');
  }
  res.send(settings);
});

const updateSettings = catchAsync(async (req, res) => {
  const settings = await settingsService.updateSettingsById(req.user._id, req.body);
  res.send(settings);
});

const deleteSettings = catchAsync(async (req, res) => {
  await settingsService.deleteSettingsById(req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createSettings,
  getSettings,
  updateSettings,
  deleteSettings,
};
