import { Strategy } from 'passport-jwt';
import config from './config';
import { tokenTypes } from './tokens';
import { User } from '../models';

const cookieExtractor = (req: { cookies: { token: null } }) => {
  let jwt = null;
  if (req && req.cookies) {
    jwt = req.cookies.token;
  }

  return jwt;
};

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: cookieExtractor,
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new Strategy(jwtOptions, jwtVerify);

export { jwtStrategy };
