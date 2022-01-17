const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { teslaAccountService, emailService } = require('../services');

const linkTeslaAccount = catchAsync(async (req, res) => {
  // eslint-disable-next-line camelcase
  const { access_token, refresh_token, linked, email, user, _id, createdAt, updatedAt } =
    await teslaAccountService.linkTeslaAccount({
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

const sendDataCollectionStoppedEmail = catchAsync(async (req, res) => {
  const teslaAccount = await teslaAccountService.getTeslaAccountById(req.query.teslaAccountId, req.query.userId);
  if (!teslaAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'TeslaAccount not found');
  }
  await emailService.sendDataCollectorStoppedEmail(teslaAccount.email);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  linkTeslaAccount,
  unlinkTeslaAccount,
  createTeslaAccount,
  getTeslaAccounts,
  getTeslaAccount,
  updateTeslaAccount,
  deleteTeslaAccount,
  sendDataCollectionStoppedEmail,
};
