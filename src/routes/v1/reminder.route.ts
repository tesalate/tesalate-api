import express from 'express';
import auth from '../../middleware/auth';
import validate from '../../middleware/validate';
import reminderValidation from '../../validations/reminder.validation';
import reminderController from '../../controllers/reminder.controller';

const router = express.Router();

router
  .route('/')
  .post(auth('manageReminders'), validate(reminderValidation.createReminder), reminderController.createReminder)
  .get(auth('getReminders'), validate(reminderValidation.getReminders), reminderController.getReminders);

router
  .route('/:reminderId')
  .get(auth('getReminders'), validate(reminderValidation.getReminder), reminderController.getReminder)
  .patch(auth('manageReminders'), validate(reminderValidation.updateReminder), reminderController.updateReminder)
  .delete(auth('manageReminders'), validate(reminderValidation.deleteReminder), reminderController.deleteReminder);

export default router;

/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: Reminder management and retrieval
 */

/**
 * @swagger
 * /reminders:
 *   post:
 *     summary: Create a reminder
 *     description: Users and admins can create reminders.
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - vin
 *               - teslaAccount
 *               - reminder_id
 *               - id_s
 *             properties:
 *               user:
 *                 type: string
 *                 description: the id of the user creating the reminder
 *               vin:
 *                 type: string
 *               teslaAccount:
 *                 type: string
 *                 description: the id of the tesla account that belongs to this reminder
 *               reminder_id:
 *                 type: number
 *               id_s:
 *                 type: string
 *             example:
 *               user: 618dbb89a85101633aeff5e7
 *               vin: 6f12345678912M125N
 *               teslaAccount: J618dbb89b85101633aeff5e8
 *               reminder_id: 12345678,
 *               id_s: "22446688"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Reminder'
 *       "400":
 *         $ref: '#/components/responses/DuplicateReminder'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all reminders
 *     description: Only admins can retrieve all reminders.
 *     tags: [Reminders]
 *     security:
 *       - cookieToken: []
 *     parameters:
 *       - in: query
 *         name: remindername
 *         schema:
 *           type: string
 *         description: Remindername
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Reminder role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of reminders
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reminder'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /reminders/{id}:
 *   get:
 *     summary: Get a reminder
 *     description: Logged in reminders can fetch only their own reminder information. Only admins can fetch other reminders.
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reminder id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Reminder'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a reminder
 *     description: Logged in reminders can only update their own information. Only admins can update other reminders.
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reminder id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Reminder'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a reminder
 *     description: Logged in reminders can delete only themselves. Only admins can delete other reminders.
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reminder id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
