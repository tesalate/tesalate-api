import request from 'supertest';
import faker from 'faker';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { Reminder } from '../../src/models';
import { reminderOneForAdmin, insertReminders, reminderOneForUser, reminderTwoForUser } from '../fixtures/reminder.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';

setupTestDB();

describe('Reminder routes', () => {
  describe('POST /v1/reminders', () => {
    let newReminder;
    beforeEach(() => {
      newReminder = {
        message: faker.lorem.sentence(),
        type: faker.random.arrayElement(['odometer']),
        when: faker.random.arrayElement([faker.datatype.number()]),
        remindWithin: faker.datatype.number(),
        vehicle: reminderOneForUser.vehicle,
      };
    });

    test('should return 201 and successfully create new reminder if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(newReminder)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        user: expect.anything(),
        _id: expect.anything(),
        message: newReminder.message,
        type: newReminder.type,
        completed: false,
        when: newReminder.when,
        remindWithin: newReminder.remindWithin,
        vehicle: newReminder.vehicle.toHexString(),
      });

      const dbReminder = await Reminder.findById(res.body._id);
      expect(dbReminder).toBeDefined();
      expect(dbReminder!.toJSON()).toEqual({
        _id: expect.anything(),
        user: userOne._id,
        message: newReminder.message,
        type: newReminder.type,
        completed: false,
        when: newReminder.when,
        remindWithin: newReminder.remindWithin,
        vehicle: newReminder.vehicle,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/reminders').send(newReminder).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if reminder is invalid due to wrong user type', async () => {
      await insertUsers([admin]);
      newReminder.user = 'invalidUserId';
      await request(app)
        .post('/v1/reminders')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newReminder)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if reminder type is invalid', async () => {
      await insertUsers([userOne, admin]);
      newReminder.type = { bad: true };

      await request(app)
        .post('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(newReminder)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/reminders', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne]);
      await insertReminders([reminderOneForAdmin, reminderOneForUser]);

      const res = await request(app)
        .get('/v1/reminders')
        .set('Cookie', `token=${adminAccessToken}`)
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
      const { _id, ...rest } = reminderOneForAdmin;
      expect(res.body.results[0]).toEqual({
        ...rest,
        _id: reminderOneForAdmin._id.toHexString(),
        user: reminderOneForAdmin.user.toHexString(),
        vehicle: reminderOneForAdmin.vehicle.toHexString(),
      });
    });

    test('should return 200 error if an admin tries to get all their reminders', async () => {
      await insertUsers([admin, userOne]);
      await insertReminders([reminderOneForUser, reminderTwoForUser, reminderOneForAdmin]);

      const res = await request(app).get('/v1/reminders').set('Cookie', `token=${adminAccessToken}`).expect(httpStatus.OK);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(reminderOneForAdmin._id.toHexString());
    });

    test('should return 200 error if regular user tries to get all of their reminders', async () => {
      await insertUsers([userOne]);
      await insertReminders([reminderOneForUser, reminderTwoForUser, reminderOneForAdmin]);

      const res = await request(app).get(`/v1/reminders`).set('Cookie', `token=${userOneAccessToken}`).expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(reminderOneForUser._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertReminders([reminderOneForAdmin]);

      await request(app).get('/v1/reminders').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on completed field', async () => {
      await insertUsers([userOne]);
      await insertReminders([
        { ...reminderOneForUser, completed: true },
        { ...reminderTwoForUser, completed: false },
      ]);

      const res = await request(app)
        .get('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ completed: true })
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
      expect(res.body.results[0]._id).toBe(reminderOneForUser._id.toHexString());
    });

    test('should return 0 reminders when searching for reminder that the user does not own', async () => {
      await insertUsers([userOne]);
      await insertReminders([reminderOneForAdmin, reminderTwoForUser]);

      const res = await request(app)
        .get('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vehicle: reminderOneForAdmin.vehicle.toHexString() })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0,
      });
      expect(res.body.results).toHaveLength(0);
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertReminders([reminderOneForUser, reminderTwoForUser]);

      const res = await request(app)
        .get('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ sortBy: '_id:asc' })
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
      expect(res.body.results[0]._id).toBe(reminderOneForUser._id.toHexString());
      expect(res.body.results[1]._id).toBe(reminderTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertReminders([reminderOneForUser, reminderTwoForUser]);

      const res = await request(app)
        .get('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ sortBy: '_id:desc' })
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
      expect(res.body.results[1]._id).toBe(reminderOneForUser._id.toHexString());
      expect(res.body.results[0]._id).toBe(reminderTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne]);
      await insertReminders([reminderOneForUser, reminderTwoForUser]);

      const res = await request(app)
        .get('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ sortBy: 'type:desc,completed:asc' })
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

      const expectedOrder = [reminderOneForUser, reminderTwoForUser].sort((a, b) => {
        if (a.type < b.type) {
          return 1;
        }
        if (a.type > b.type) {
          return -1;
        }
        return a.completed < b.completed ? -1 : 1;
      });

      expectedOrder.forEach((reminder, index) => {
        expect(res.body.results[index]._id).toBe(reminder._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne]);
      await insertReminders([reminderOneForUser, reminderTwoForUser]);

      const res = await request(app)
        .get('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(reminderOneForUser._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne]);
      await insertReminders([reminderOneForUser, reminderTwoForUser, reminderOneForAdmin]);

      const res = await request(app)
        .get('/v1/reminders')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ page: 2, limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(reminderTwoForUser._id.toHexString());
    });
  });

  describe('GET /v1/reminders/:reminderId', () => {
    test('should return 200 and the reminder object if data is ok', async () => {
      await insertUsers([admin]);
      await insertReminders([reminderOneForAdmin]);

      const res = await request(app)
        .get(`/v1/reminders/${reminderOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      const { _id, ...rest } = reminderOneForAdmin;
      expect(res.body).toEqual({
        ...rest,
        _id: reminderOneForAdmin._id.toHexString(),
        user: reminderOneForAdmin.user.toHexString(),
        vehicle: reminderOneForAdmin.vehicle.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertReminders([reminderOneForAdmin]);

      await request(app).get(`/v1/reminders/${reminderOneForAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if reminderId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/reminders/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if reminder is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/reminders/${reminderOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/reminders/:reminderId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);
      await insertReminders([reminderOneForUser]);

      await request(app)
        .delete(`/v1/reminders/${reminderOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbReminder = await Reminder.findById(reminderOneForUser._id);
      expect(dbReminder).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertReminders([reminderOneForAdmin]);

      await request(app).delete(`/v1/reminders/${reminderOneForAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if reminderId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/reminders/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if reminder is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/reminders/${reminderOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/reminders/:reminderId', () => {
    test('should return 200 and successfully update reminder if data is ok', async () => {
      await insertUsers([admin]);
      await insertReminders([reminderOneForAdmin]);

      const updateBody = {
        message: faker.lorem.sentence(),
        type: faker.random.arrayElement(['odometer']),
        completed: faker.datatype.boolean(),
        when: faker.random.arrayElement([faker.datatype.number()]),
        remindWithin: faker.datatype.number(),
      };

      const res = await request(app)
        .patch(`/v1/reminders/${reminderOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        ...updateBody,
        _id: reminderOneForAdmin._id.toHexString(),
        user: reminderOneForAdmin.user.toHexString(),
        vehicle: reminderOneForAdmin.vehicle.toHexString(),
      });

      const dbReminder = await Reminder.findById(reminderOneForAdmin._id);
      expect(dbReminder).toBeDefined();
      expect(dbReminder!.toJSON()).toMatchObject({
        ...updateBody,
        user: reminderOneForAdmin.user,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertReminders([reminderOneForAdmin]);
      const updateBody = { display_name: faker.name.findName() };

      await request(app).patch(`/v1/reminders/${reminderOneForAdmin._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if user is updating another users reminder', async () => {
      await insertUsers([userOne, admin]);
      await insertReminders([reminderOneForAdmin, reminderOneForUser]);
      const updateBody = { message: faker.name.findName() };

      await request(app)
        .patch(`/v1/reminders/${reminderOneForAdmin._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if admin is updating another reminder that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = { message: 'hello' };

      await request(app)
        .patch(`/v1/reminders/${reminderOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if user is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertReminders([reminderOneForAdmin]);
      const updateBody = { user: faker.internet.userName() };

      await request(app)
        .patch(`/v1/reminders/invalidId`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if vin is invalid', async () => {
      await insertUsers([admin]);
      await insertReminders([reminderOneForAdmin]);
      const updateBody = { vin: {} };

      await request(app)
        .patch(`/v1/reminders/${reminderOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if teslaAccount is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertReminders([reminderOneForAdmin]);
      const updateBody = { teslaAccount: faker.internet.userName() };

      await request(app)
        .patch(`/v1/reminders/invalidId`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
