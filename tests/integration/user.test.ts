import request from 'supertest';
import faker from 'faker';
import mongoose, { Types } from 'mongoose';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { User } from '../../src/models';
import { userOne, userTwo, admin, insertUsers } from '../fixtures/user.fixture';
import { userOneAccessToken, adminAccessToken } from '../fixtures/token.fixture';

setupTestDB();

describe('User routes', () => {
  describe('POST /v1/users', () => {
    let newUser;
    const username = faker.internet.userName().toUpperCase();
    beforeEach(() => {
      newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username,
        displayName: username,
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
    });

    test('should return 201 and successfully create new user if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        _id: expect.anything(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username.toLowerCase(),
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: false,
        teslaAccount: null,
      });

      const dbUser = await User.findById(res.body._id);
      expect(dbUser).toBeDefined();
      expect(dbUser!.password).not.toBe(newUser.password);
      expect(dbUser!.toJSON()).toMatchObject({
        _id: expect.anything(),
        username: newUser.username.toLowerCase(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        isEmailVerified: false,
        teslaAccount: null,
      });
    });

    test('should be able to create an admin as well', async () => {
      await insertUsers([admin]);
      newUser.role = 'admin';

      const res = await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(res.body.role).toBe('admin');

      const dbUser = await User.findById(res.body._id);
      expect(dbUser!.role).toBe('admin');
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/users').send(newUser).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged in user is not admin', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(newUser)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      newUser.email = 'invalidEmail';

      await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([admin, userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 8 characters', async () => {
      await insertUsers([admin]);
      newUser.password = 'passwo1';

      await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain both letters and numbers', async () => {
      await insertUsers([admin]);
      newUser.password = 'password';

      await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);

      newUser.password = '1111111';

      await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if role is neither user nor admin', async () => {
      await insertUsers([admin]);
      newUser.role = 'invalid';

      await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if vehicles array is invalid', async () => {
      await insertUsers([admin]);
      newUser.vehicles = [false, true, {}];

      await request(app)
        .post('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/users', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]).toEqual({
        _id: userOne._id.toHexString(),
        username: userOne.username,
        firstName: userOne.firstName,
        lastName: userOne.lastName,
        displayName: userOne.displayName,
        email: userOne.email,
        role: userOne.role,
        isEmailVerified: userOne.isEmailVerified,
        teslaAccount: null,
        vehicles: [],
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app).get('/v1/users').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all users', async () => {
      await insertUsers([userOne, userTwo, admin]);

      await request(app).get('/v1/users').set('Cookie', `token=${userOneAccessToken}`).send().expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on username field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .query({ username: userOne.username })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(userOne._id.toHexString());
    });

    test('should correctly apply filter on role field', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .query({ role: 'user' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(userOne._id.toHexString());
      expect(res.body.results[1]._id).toBe(userTwo._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .query({ sortBy: 'role:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]._id).toBe(userOne._id.toHexString());
      expect(res.body.results[1]._id).toBe(userTwo._id.toHexString());
      expect(res.body.results[2]._id).toBe(admin._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .query({ sortBy: 'role:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0]._id).toBe(admin._id.toHexString());
      expect(res.body.results[1]._id).toBe(userOne._id.toHexString());
      expect(res.body.results[2]._id).toBe(userTwo._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .query({ sortBy: 'role:desc,username:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);

      const expectedOrder = [userOne, userTwo, admin].sort((a, b) => {
        if (a.role < b.role) {
          return 1;
        }
        if (a.role > b.role) {
          return -1;
        }
        return a.username < b.username ? -1 : 1;
      });

      expectedOrder.forEach((user, index) => {
        expect(res.body.results[index]._id).toBe(user._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(userOne._id.toHexString());
      expect(res.body.results[1]._id).toBe(userTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);

      const res = await request(app)
        .get('/v1/users')
        .set('Cookie', `token=${adminAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(admin._id.toHexString());
    });
  });

  describe('GET /v1/users/:userId', () => {
    test('should return 200 and the user object if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        _id: userOne._id.toHexString(),
        email: userOne.email,
        username: userOne.username,
        firstName: userOne.firstName,
        lastName: userOne.lastName,
        displayName: userOne.displayName,
        role: userOne.role,
        isEmailVerified: userOne.isEmailVerified,
        teslaAccount: null,
        vehicles: userOne.vehicles.map((id: Types.ObjectId) => id.toHexString()),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).get(`/v1/users/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .get(`/v1/users/${userTwo._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the user object if admin is trying to get another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/users/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/users/:userId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).delete(`/v1/users/${userOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete another user', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .delete(`/v1/users/${userTwo._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user', async () => {
      await insertUsers([userOne, admin]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/users/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if user already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/users/:userId', () => {
    test('should return 200 and successfully update user if data is ok', async () => {
      await insertUsers([userOne]);
      const username = faker.internet.userName().toUpperCase();
      const updateBody = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username,
        displayName: username,
        email: faker.internet.email().toLowerCase(),
        password: 'newPassword1',
        vehicles: Array(
          faker.datatype.number({
            min: 0,
            max: 12,
          })
        ).fill(mongoose.Types.ObjectId()),
      };

      const res = await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        _id: userOne._id.toHexString(),
        firstName: updateBody.firstName,
        lastName: updateBody.lastName,
        username: updateBody.username.toLowerCase(),
        displayName: updateBody.displayName,
        email: updateBody.email,
        role: 'user',
        isEmailVerified: false,
        teslaAccount: null,
        vehicles: [],
      });

      const dbUser = await User.findById(userOne._id);
      expect(dbUser).toBeDefined();
      expect(dbUser!.password).not.toBe(updateBody.password);
      expect(dbUser).toMatchObject({
        firstName: updateBody.firstName,
        lastName: updateBody.lastName,
        username: updateBody.username.toLowerCase(),
        displayName: updateBody.displayName,
        email: updateBody.email,
        role: 'user',
        isEmailVerified: false,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      const updateBody = { username: faker.name.findName() };

      await request(app).patch(`/v1/users/${userOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating another user', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { username: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${userTwo._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 if admin is updating another user', async () => {
      await insertUsers([userOne, admin]);
      const updateBody = { username: faker.name.findName() };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 if admin is updating another user that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = { username: 'wont_work' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      const updateBody = { username: faker.internet.userName() };

      await request(app)
        .patch(`/v1/users/invalidId`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is invalid', async () => {
      await insertUsers([userOne]);
      const updateBody = { email: 'invalidEmail' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is already taken', async () => {
      await insertUsers([userOne, userTwo]);
      const updateBody = { email: userTwo.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should not return 400 if email is my email', async () => {
      await insertUsers([userOne]);
      const updateBody = { email: userOne.email };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 400 if password length is less than 8 characters', async () => {
      await insertUsers([userOne]);
      const updateBody = { password: 'passwo1' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if password does not contain both letters and numbers', async () => {
      await insertUsers([userOne]);
      const updateBody = { password: 'password' };

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);

      updateBody.password = '11111111';

      await request(app)
        .patch(`/v1/users/${userOne._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
