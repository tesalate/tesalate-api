const express = require('express');
const validate = require('../../middleware/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');
const auth = require('../../middleware/auth');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/send-verification-email', auth(), authController.sendVerificationEmail);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a User
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jeramy
 *               lastName:
 *                 type: string
 *                 example: Walsh
 *               username:
 *                 type: string
 *                 example: Jeramy_Walsh
 *               displayName:
 *                 type: string
 *                 example: Jeramy_Walsh
 *               email:
 *                 type: string
 *                 example: jeramy.walsh20@hotmail.com
 *               password:
 *                 type: string
 *                 example: password1234
 *       required: true
 *     responses:
 *       '201':
 *         description: >
 *           Successfully registered user. The authentication and refresh tokens are
 *           returned in cookies named `token` and `refreshToken` respectively.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly
 *           "\0Set-Cookie":
 *             schema:
 *               type: string
 *               example: refreshToken=abcde123456789; Path=/v1/auth; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: user
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: false
 *                     teslaAccount:
 *                       example: null
 *                       nullable: true
 *                     vehicles:
 *                       type: array
 *                       items: {}
 *                       example:
 *                         - null
 *                     _id:
 *                       type: string
 *                       example: 61cb977d920b494e14d59f74
 *                     firstName:
 *                       type: string
 *                       example: Jeramy
 *                     lastName:
 *                       type: string
 *                       example: Walsh
 *                     username:
 *                       type: string
 *                       example: jeramy_walsh
 *                     displayName:
 *                       type: string
 *                       example: Jeramy_Walsh
 *                     email:
 *                       type: string
 *                       example: jeramy.walsh20@hotmail.com
 *           text/html:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: user
 *                     isEmailVerified:
 *                       type: boolean
 *                       example: false
 *                     teslaAccount:
 *                       example: null
 *                       nullable: true
 *                     vehicles:
 *                       type: array
 *                       items: {}
 *                       example:
 *                     _id:
 *                       type: string
 *                       example: 61cb977d920b494e14d59f74
 *                     firstName:
 *                       type: string
 *                       example: Nicklaus
 *                     lastName:
 *                       type: string
 *                       example: Champlin
 *                     username:
 *                       type: string
 *                       example: cleora97
 *                     displayName:
 *                       type: string
 *                       example: CLEORA97
 *                     email:
 *                       type: string
 *                       example: rahul92@gmail.com
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '"email" must be a valid email'
 *           text/html:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '"email" must be a valid email'
 *
 *
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in and returns the authentication cookies
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             example:
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly
 *           "\0Set-Cookie":
 *             schema:
 *               type: string
 *               example: refreshToken=abcde123456789; Path=/v1/auth; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       "401":
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 401
 *               message: Invalid email or password
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logs a user out and removes refresh token from database
 *     responses:
 *       '204':
 *         description: >
 *           Successfully refreshed tokens. The authentication and refresh tokens are
 *           returned in cookies named `token` and `refreshToken` respectively.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '"refreshToken" is required'
 *           text/html:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '"refreshToken" is required'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Please authenticate
 *           text/html:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Please authenticate
 *
 */

/**
 * @swagger
 * /auth/refresh-tokens:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh auth tokens and returns the authentication cookies
 *     responses:
 *       '204':
 *         description: >
 *           Successfully refreshed tokens. The authentication and refresh tokens are
 *           returned in cookies named `token` and `refreshToken` respectively.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=abcde12345; Path=/; HttpOnly
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '"refreshToken" is required'
 *           text/html:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '"refreshToken" is required'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Please authenticate
 *           text/html:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Please authenticate
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: An email will be sent to reset password.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             example:
 *               email: fake@example.com
 *     responses:
 *       '204':
 *         description: ''
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '"email" is required'
 *           text/html:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: '"email" is required'
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No users found with this email
 *           text/html:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No users found with this email
 *
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *    summary: Reset password
 *    tags:
 *      - Auth
 *    parameters:
 *      - in: query
 *        name: token
 *        required: true
 *        schema:
 *          type: string
 *        description: The reset password token
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - password
 *            properties:
 *              password:
 *                type: string
 *                format: password
 *                minLength: 8
 *                description: At least one number and one letter
 *            example:
 *              password: password1234
 *    responses:
 *      '204':
 *        description: No content
 *      '400':
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: number
 *                  example: 400
 *                message:
 *                  type: string
 *                  example: '"token" is required'
 *      '401':
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: number
 *                  example: 401
 *                message:
 *                  type: string
 *                  example: Please authenticate
 *
 */

/**
 * @swagger
 * /auth/send-verification-email:
 *   post:
 *     summary: Send verification email
 *     description: An email will be sent to verify email.
 *     tags:
 *       - Auth
 *     security:
 *       - cookieToken: []
 *     responses:
 *       '204':
 *         description: No content
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: Please authenticate
 */

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *    summary: verify email
 *    tags:
 *      - Auth
 *    parameters:
 *      - in: query
 *        name: token
 *        required: true
 *        schema:
 *          type: string
 *        description: The verify email token
 *    responses:
 *      '204':
 *         description: No content
 *      '400':
 *        description: Bad Request
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                code:
 *                  type: number
 *                  example: 400
 *                message:
 *                  type: string
 *                  example: '"token" is required'
 */
