import httpStatus from 'http-status';
import pick from 'lodash/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { teslaAccountService, emailService, smsService, userService } from '../services';

const linkTeslaAccount = catchAsync(async (req, res) => {
  const { access_token, linked, email, user, _id, createdAt, updatedAt } = await teslaAccountService.linkTeslaAccount({
    ...req.body,
    user: req.user,
  });
  const vehicles = await teslaAccountService.getAndSetVehiclesFromTesla({
    teslaAccount: _id,
    accessToken: access_token,
    user: req.user,
  });
  res
    .status(createdAt === updatedAt ? httpStatus.CREATED : httpStatus.OK)
    .send({ teslaAccount: { linked, email, user, _id }, vehicles });
});

const unlinkTeslaAccount = catchAsync(async (req, res) => {
  const teslaAccount = await teslaAccountService.updateTeslaAccountById(
    req.user,
    { linked: false, access_token: null, refresh_token: null },
    req.user._id
  );
  res.status(httpStatus.OK).send(teslaAccount);
});

const createTeslaAccount = catchAsync(async (req, res) => {
  const teslaAccount = await teslaAccountService.createTeslaAccount({
    ...req.body,
    user: req.user._id,
    teslaAccount: req.user.teslaAccount,
  });
  res.status(httpStatus.CREATED).send(teslaAccount);
});

const getTeslaAccounts = catchAsync(async (req, res) => {
  const filter = {
    ...pick(req.query, ['email', 'user', 'linked']),
    user: req.user._id,
  };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await teslaAccountService.queryTeslaAccounts(filter, options);
  res.send(result);
});

const getTeslaAccount = catchAsync(async (req, res) => {
  const teslaAccount = await teslaAccountService.getTeslaAccountById(req.params.teslaAccountId, req.user._id);
  if (!teslaAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'TeslaAccount not found');
  }
  res.send(teslaAccount);
});

const updateTeslaAccount = catchAsync(async (req, res) => {
  const teslaAccount = await teslaAccountService.updateTeslaAccountById(req.params.teslaAccountId, req.body, req.user._id);
  res.send(teslaAccount);
});

const deleteTeslaAccount = catchAsync(async (req, res) => {
  await teslaAccountService.deleteTeslaAccountById(req.params.teslaAccountId, req.user._id);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendDataCollectionStoppedNotification = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.query.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user not found');
  }
  await emailService.sendDataCollectorStoppedEmail(user.email);
  await smsService.sendDataCollectorStoppedSMS(user.phoneNumber);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTeslaAccount = catchAsync(async (req, res) => {
  const { refresh_token, email } = await teslaAccountService.getTeslaAccountTokens(req.user.teslaAccount._id, req.user._id);

  const { access_token, linked, user, _id, createdAt, updatedAt } = await teslaAccountService.linkTeslaAccount({
    email,
    refreshToken: refresh_token,
    user: req.user,
  });

  const vehicles = await teslaAccountService.getAndSetVehiclesFromTesla({
    teslaAccount: _id,
    accessToken: access_token,
    user: req.user,
  });

  res
    .status(createdAt === updatedAt ? httpStatus.CREATED : httpStatus.OK)
    .send({
      results: {
        linked,
        _id,
        email,
        user,
        createdAt,
        updatedAt,
        vehicles: vehicles.filter((vehicle) => vehicle.teslaAccount),
      },
    });
});

export default {
  linkTeslaAccount,
  unlinkTeslaAccount,
  createTeslaAccount,
  getTeslaAccounts,
  getTeslaAccount,
  updateTeslaAccount,
  deleteTeslaAccount,
  sendDataCollectionStoppedNotification,
  refreshTeslaAccount,
};
