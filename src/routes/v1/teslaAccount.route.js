const express = require('express');
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const teslaAccountValidation = require('../../validations/teslaAccount.validation');
const teslaAccountController = require('../../controllers/teslaAccount.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageTeslaAccounts'),
    validate(teslaAccountValidation.createTeslaAccount),
    teslaAccountController.createTeslaAccount
  )
  .get(auth('getTeslaAccounts'), validate(teslaAccountValidation.getTeslaAccounts), teslaAccountController.getTeslaAccounts);

router
  .route('/:teslaAccountId')
  .get(auth('getTeslaAccounts'), validate(teslaAccountValidation.getTeslaAccount), teslaAccountController.getTeslaAccount)
  .patch(
    auth('manageTeslaAccounts'),
    validate(teslaAccountValidation.updateTeslaAccount),
    teslaAccountController.updateTeslaAccount
  )
  .delete(
    auth('manageTeslaAccounts'),
    validate(teslaAccountValidation.deleteTeslaAccount),
    teslaAccountController.deleteTeslaAccount
  );

router
  .route('/login')
  .post(
    auth('manageTeslaAccounts'),
    validate(teslaAccountValidation.linkTeslaAccount),
    teslaAccountController.linkTeslaAccount
  )
  .delete(
    auth('manageTeslaAccounts'),
    validate(teslaAccountValidation.unlinkTeslaAccount),
    teslaAccountController.unlinkTeslaAccount
  );

router.post(
  '/send-data-collection-stopped-email',
  validate(teslaAccountValidation.sendDataCollectionStoppedEmail),
  teslaAccountController.sendDataCollectionStoppedEmail
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: TeslaAccounts
 *   description: TeslaAccount management and retrieval
 */

/**
 * @swagger
 * /teslaAccounts:
 *   post:
 *     summary: Create a teslaAccount
 *     description: Only admins can create other teslaAccounts.
 *     tags: [TeslaAccounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teslaAccountname
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - role
 *             properties:
 *               teslaAccountname:
 *                 type: string
 *                 description: must be unique
 *               firstName:
 *                 type: string
 *               lastName:
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
 *               role:
 *                  type: string
 *                  enum: [teslaAccount, admin]
 *             example:
 *               teslaAccountname: fake_name
 *               firstName: fake
 *               lastName: name
 *               email: fake@example.com
 *               password: password1
 *               role: teslaAccount
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TeslaAccount'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all teslaAccounts
 *     description: Only admins can retrieve all teslaAccounts.
 *     tags: [TeslaAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teslaAccountname
 *         schema:
 *           type: string
 *         description: TeslaAccountname
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: TeslaAccount role
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
 *         description: Maximum number of teslaAccounts
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
 *                     $ref: '#/components/schemas/TeslaAccount'
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
 * /teslaAccounts/{id}:
 *   get:
 *     summary: Get a teslaAccount
 *     description: Logged in teslaAccounts can fetch only their own teslaAccount information. Only admins can fetch other teslaAccounts.
 *     tags: [TeslaAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TeslaAccount id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TeslaAccount'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a teslaAccount
 *     description: Logged in teslaAccounts can only update their own information. Only admins can update other teslaAccounts.
 *     tags: [TeslaAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TeslaAccount id
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
 *                $ref: '#/components/schemas/TeslaAccount'
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
 *     summary: Delete a teslaAccount
 *     description: Logged in teslaAccounts can delete only themselves. Only admins can delete other teslaAccounts.
 *     tags: [TeslaAccounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TeslaAccount id
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
