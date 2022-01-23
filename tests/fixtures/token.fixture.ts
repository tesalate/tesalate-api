import moment from 'moment';
import config from '../../src/config/config';
const { tokenTypes } = require('../../src/config/tokens');
import tokenService from '../../src/services/token.service';
const { userOne, admin, userTwo } = require('./user.fixture');

const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
const userOneAccessToken = tokenService.generateToken(userOne._id, accessTokenExpires, tokenTypes.ACCESS);
const userTwoAccessToken = tokenService.generateToken(userTwo._id, accessTokenExpires, tokenTypes.ACCESS);
const adminAccessToken = tokenService.generateToken(admin._id, accessTokenExpires, tokenTypes.ACCESS);

export { userOneAccessToken, userTwoAccessToken, adminAccessToken };
