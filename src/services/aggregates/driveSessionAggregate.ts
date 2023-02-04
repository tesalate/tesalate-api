import mongoose from 'mongoose';
import { Session } from '../../models';
import Efficiency from '../../models/efficiency.model';
import { searchObject } from '../../utils/searchObj';

const driveSessionAggregate = async (_id, user) => {
  const [driveSession] = await Session.find({ _id: mongoose.Types.ObjectId(_id), user })
    .populate({
      path: 'dataPoints',
      select: 'vehicle_state.car_version',
      options: { limit: 1 },
    })
    .lean()
    .select('dataPoints');

  const version = driveSession['dataPoints'][0]['vehicle_state']['car_version'];

  const [eff] = await Efficiency.find(
    {
      [version]: { $exists: true },
      user,
    },
    { [version]: 1, _id: 0 }
  ).lean();

  const avg = searchObject(eff, 'avg') ?? 0;

  return [
    { $match: { _id: mongoose.Types.ObjectId(_id), user } },
    {
      $unwind: {
        path: '$dataPoints',
      },
    },
    {
      $lookup: {
        from: 'vehicledata',
        let: {
          locator: '$dataPoints',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$locator'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              'drive_state.power': 1,
              'drive_state.speed': 1,
              'drive_state.longitude': 1,
              'drive_state.latitude': 1,
              'drive_state.timestamp': 1,
              'drive_state.heading': 1,
              'charge_state.battery_level': 1,
              'charge_state.charge_energy_added': 1,
              'charge_state.charge_miles_added_ideal': 1,
              'charge_state.battery_range': 1,
              'vehicle_state.odometer': 1,
              'climate_state.outside_temp': 1,
              'climate_state.inside_temp': 1,
            },
          },
        ],
        as: 'populated',
      },
    },
    {
      $unwind: {
        path: '$populated',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $sort: {
        'populated.drive_state.timestamp': 1,
      },
    },
    {
      $group: {
        _id: '$_id',
        metadata: {
          $first: '$metadata',
        },
        data: {
          $push: '$populated.drive_state',
        },
        startDate: {
          $first: '$startDate',
        },
        endDate: {
          $first: '$endDate',
        },
        batteryLevel: {
          $push: '$populated.charge_state.battery_level',
        },
        batteryRange: {
          $push: '$populated.charge_state.battery_range',
        },
        energyAdded: {
          $last: '$populated.charge_state.charge_energy_added',
        },
        milesAdded: {
          $last: '$populated.charge_state.charge_miles_added_ideal',
        },
        power: {
          $push: '$populated.drive_state.power',
        },
        speed: {
          $push: '$populated.drive_state.speed',
        },
        odometer: {
          $push: '$populated.vehicle_state.odometer',
        },
        labels: {
          $push: '$populated.drive_state.timestamp',
        },
        exTemp: {
          $push: '$populated.climate_state.outside_temp',
        },
        inTemp: {
          $push: '$populated.climate_state.inside_temp',
        },
        mapData: {
          $push: {
            vehicle: '$vehicle',
            dataPoints: [
              {
                _id: '$populated._id',
                drive_state: {
                  latitude: '$populated.drive_state.latitude',
                  longitude: '$populated.drive_state.longitude',
                  heading: '$populated.drive_state.heading',
                },
              },
            ],
          },
        },
      },
    },
    {
      $project: {
        mapData: {
          $reverseArray: ['$mapData'],
        },
        metadata: 1,
        graphData: {
          datasets: [
            {
              label: 'speed',
              data: '$speed',
            },
            {
              label: 'power',
              data: '$power',
            },
          ],
          labels: '$labels',
        },
        sessionData: {
          startDate: {
            value: {
              $arrayElemAt: ['$data.timestamp', 0],
            },
            displayName: 'start date',
            displayOrder: 1,
            unit: '',
            displayType: 'date',
          },
          endDate: {
            value: {
              $arrayElemAt: ['$data.timestamp', -1],
            },
            displayName: 'end date',
            displayOrder: 1,
            unit: '',
            displayType: 'date',
          },
          distance: {
            value: {
              $trunc: [
                {
                  $subtract: [
                    {
                      $arrayElemAt: ['$odometer', -1],
                    },
                    {
                      $arrayElemAt: ['$odometer', 0],
                    },
                  ],
                },
                2,
              ],
            },
            displayName: 'distance',
            displayOrder: 2,
            unit: ' miles',
            displayType: '',
          },
          maxSpeed: {
            value: {
              $max: '$data.speed',
            },
            displayName: 'max speed',
            displayOrder: 3,
            unit: ' mph',
            displayType: '',
          },
          avgSpeed: {
            value: {
              $trunc: [
                {
                  $divide: [
                    {
                      $subtract: [
                        {
                          $arrayElemAt: ['$odometer', -1],
                        },
                        {
                          $arrayElemAt: ['$odometer', 0],
                        },
                      ],
                    },
                    {
                      $divide: [
                        {
                          $abs: {
                            $subtract: [
                              {
                                $arrayElemAt: ['$data.timestamp', 0],
                              },
                              {
                                $arrayElemAt: ['$data.timestamp', -1],
                              },
                            ],
                          },
                        },
                        3600000,
                      ],
                    },
                  ],
                },
                2,
              ],
            },
            displayName: 'avg. speed',
            displayOrder: 4,
            unit: ' mph',
            displayType: '',
          },
          maxPower: {
            value: {
              $max: '$data.power',
            },
            displayName: 'max power',
            displayOrder: 5,
            unit: ' kW',
            displayType: '',
          },
          avgPower: {
            value: {
              $trunc: [
                {
                  $avg: '$data.power',
                },
                2,
              ],
            },
            displayName: 'avg. power',
            displayOrder: 6,
            unit: ' kW',
            displayType: '',
          },
          maxRegen: {
            value: {
              $min: '$data.power',
            },
            displayName: 'max regen',
            displayOrder: 7,
            unit: ' kW',
            displayType: '',
          },
          efficiency: {
            value: {
              $cond: {
                if: {
                  $or: [
                    {
                      $eq: [
                        {
                          $subtract: [
                            {
                              $arrayElemAt: ['$odometer', -1],
                            },
                            {
                              $arrayElemAt: ['$odometer', 0],
                            },
                          ],
                        },
                        0,
                      ],
                    },
                    {
                      $eq: [
                        {
                          $subtract: [
                            {
                              $arrayElemAt: ['$batteryRange', 0],
                            },
                            {
                              $arrayElemAt: ['$batteryRange', -1],
                            },
                          ],
                        },
                        0,
                      ],
                    },
                  ],
                },
                then: 0,
                else: {
                  $trunc: [
                    {
                      $divide: [
                        {
                          $cond: {
                            if: { $eq: [avg, 0] },
                            then: {
                              $cond: {
                                if: {
                                  $or: [{ $eq: ['$energyAdded', 0] }, { $eq: ['$milesAdded', 0] }],
                                },
                                then: 241.9,
                                else: {
                                  $multiply: [
                                    {
                                      $divide: ['$energyAdded', '$milesAdded'],
                                    },
                                    1000,
                                  ],
                                },
                              },
                            },
                            else: avg,
                          },
                        },
                        {
                          $divide: [
                            {
                              $subtract: [
                                {
                                  $arrayElemAt: ['$odometer', -1],
                                },
                                {
                                  $arrayElemAt: ['$odometer', 0],
                                },
                              ],
                            },
                            {
                              $subtract: [
                                {
                                  $arrayElemAt: ['$batteryRange', 0],
                                },
                                {
                                  $arrayElemAt: ['$batteryRange', -1],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    2,
                  ],
                },
              },
            },
            displayName: 'efficiency',
            displayOrder: 9,
            unit: ' Wh/mi',
            displayType: '',
          },
          fromTo: {
            value: {
              $concat: [
                {
                  $toString: {
                    $arrayElemAt: ['$batteryLevel', 0],
                  },
                },
                '% -> ',
                {
                  $toString: {
                    $arrayElemAt: ['$batteryLevel', -1],
                  },
                },
              ],
            },
            displayName: 'from -> to',
            displayOrder: 10,
            unit: '%',
            displayType: '',
          },
          avgExTemp: {
            value: {
              $trunc: [
                {
                  $avg: '$exTemp',
                },
                0,
              ],
            },
            displayName: 'avg. ext. temp',
            displayOrder: 11,
            unit: '°',
            displayType: 'degrees',
          },
          avgInTemp: {
            value: {
              $trunc: [
                {
                  $avg: '$inTemp',
                },
                0,
              ],
            },
            displayName: 'avg. int. temp',
            displayOrder: 12,
            unit: '°',
            displayType: 'degrees',
          },
          duration: {
            value: {
              $subtract: [
                {
                  $arrayElemAt: ['$data.timestamp', -1],
                },
                {
                  $arrayElemAt: ['$data.timestamp', 0],
                },
              ],
            },
            displayName: 'duration',
            displayOrder: 8,
            unit: '',
            displayType: 'duration',
          },
          estTimeWaiting: {
            value: {
              $cond: [
                {
                  $gt: [
                    {
                      $size: '$data.speed',
                    },
                    2,
                  ],
                },
                {
                  $multiply: [
                    {
                      $reduce: {
                        input: '$data.speed',
                        initialValue: 0,
                        in: {
                          $add: [
                            0,
                            {
                              $size: {
                                $filter: {
                                  input: {
                                    $slice: [
                                      '$data.speed',
                                      1,
                                      {
                                        $subtract: [
                                          {
                                            $size: '$data.speed',
                                          },
                                          2,
                                        ],
                                      },
                                    ],
                                  },
                                  as: 'speed',
                                  cond: {
                                    $lte: ['$$speed', 0],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      $multiply: ['$metadata.interval', 1000],
                    },
                  ],
                },
                0,
              ],
            },
            displayName: 'est. time stopped',
            displayOrder: 12,
            unit: '',
            displayType: 'duration',
          },
        },
      },
    },
  ];
};

export { driveSessionAggregate };
