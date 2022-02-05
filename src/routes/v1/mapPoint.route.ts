import express from 'express';
import auth from '../../middleware/auth';
import validate from '../../middleware/validate';
import mapPointValidation from '../../validations/mapPoint.validation';
import mapPointController from '../../controllers/mapPoint.controller';

const router = express.Router();

router.route('/').get(auth('getMapPoints'), validate(mapPointValidation.getMapPoints), mapPointController.getMapPoints);

router
  .route('/distance/:vehicle')
  .get(
    auth('getMapPoints'),
    validate(mapPointValidation.getMapPointsByDistanceApart),
    mapPointController.getMapPointsByDistanceApart
  );

router
  .route('/:mapPointId')
  .get(auth('getMapPoints'), validate(mapPointValidation.getMapPoint), mapPointController.getMapPoint)
  .delete(auth('manageMapPoints'), validate(mapPointValidation.deleteMapPoint), mapPointController.deleteMapPoint);

export default router;

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Vehicle management and retrieval
 */

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Create a vehicle
 *     description: Users and admins can create vehicles.
 *     tags: [Vehicles]
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
 *               - vehicle_id
 *               - id_s
 *             properties:
 *               user:
 *                 type: string
 *                 description: the id of the user creating the vehicle
 *               vin:
 *                 type: string
 *               teslaAccount:
 *                 type: string
 *                 description: the id of the tesla account that belongs to this vehicle
 *               vehicle_id:
 *                 type: number
 *               id_s:
 *                 type: string
 *             example:
 *               user: 618dbb89a85101633aeff5e7
 *               vin: 6f12345678912M125N
 *               teslaAccount: J618dbb89b85101633aeff5e8
 *               vehicle_id: 12345678,
 *               id_s: "22446688"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Vehicle'
 *       "400":
 *         $ref: '#/components/responses/DuplicateVehicle'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all vehicles
 *     description: Only admins can retrieve all vehicles.
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vehiclename
 *         schema:
 *           type: string
 *         description: Vehiclename
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Vehicle role
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
 *         description: Maximum number of vehicles
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
 *                     $ref: '#/components/schemas/Vehicle'
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
 * /vehicles/{id}:
 *   get:
 *     summary: Get a vehicle
 *     description: Logged in vehicles can fetch only their own vehicle information. Only admins can fetch other vehicles.
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Vehicle'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a vehicle
 *     description: Logged in vehicles can only update their own information. Only admins can update other vehicles.
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle id
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
 *                $ref: '#/components/schemas/Vehicle'
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
 *     summary: Delete a vehicle
 *     description: Logged in vehicles can delete only themselves. Only admins can delete other vehicles.
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle id
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
