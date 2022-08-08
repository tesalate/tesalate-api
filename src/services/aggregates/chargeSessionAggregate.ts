import mongoose from 'mongoose';

const chargeSessionAggregate = (_id, user) => {
  return [
    { $match: { _id: mongoose.Types.ObjectId(_id), user } },
    {
      $unwind: {
        path: '$dataPoints',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: 'vehicledata',
        let: { locator: '$dataPoints' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$locator'] } } },
          {
            $project: {
              _id: 1,
              'charge_state.charger_power': 1,
              'charge_state.charge_miles_added_rated': 1,
              'charge_state.charge_energy_added': 1,
              'charge_state.fast_charger_type': 1,
              'charge_state.timestamp': 1,
              'charge_state.battery_level': 1,
              'charge_state.usable_battery_level': 1,
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
    { $sort: { 'populated.charge_state.timestamp': 1 } },
    {
      $group: {
        _id: '$_id',
        data: { $push: '$populated.charge_state' },
        startDate: { $first: '$startDate' },
        endDate: { $first: '$endDate' },
        batteryLevel: { $push: '$populated.charge_state.battery_level' },
        usableBatteryLevel: { $push: '$populated.charge_state.usable_battery_level' },
        chargerPower: { $push: '$populated.charge_state.charger_power' },
        labels: { $push: '$populated.charge_state.timestamp' },
        exTemp: { $push: '$populated.climate_state.outside_temp' },
        inTemp: { $push: '$populated.climate_state.inside_temp' },
      },
    },
    {
      $project: {
        graphData: {
          datasets: [
            { label: 'battery level', data: '$batteryLevel' },
            { label: 'usable battery level', data: '$usableBatteryLevel' },
            { label: 'charger power', data: '$chargerPower' },
          ],
          labels: '$labels',
        },
        sessionData: {
          startDate: {
            value: { $arrayElemAt: ['$data.timestamp', 0] },
            displayName: 'start date',
            displayOrder: 1,
            unit: '',
            displayType: 'date',
          },
          supercharger: {
            value: { $in: ['Tesla', '$data.fast_charger_type'] },
            displayName: 'supercharger',
            displayOrder: 8,
            unit: '',
            displayType: 'bool',
          },
          maxPower: {
            value: { $max: '$data.charger_power' },
            displayName: 'max power',
            displayOrder: 3,
            unit: ' kW',
            displayType: '',
          },
          avgPower: {
            value: { $trunc: [{ $avg: '$data.charger_power' }, 2] },
            displayName: 'average power',
            displayOrder: 4,
            unit: ' kW',
            displayType: '',
          },
          fromTo: {
            value: {
              $concat: [
                { $toString: { $arrayElemAt: ['$data.battery_level', 0] } },
                '% -> ',
                { $toString: { $arrayElemAt: ['$data.battery_level', -1] } },
              ],
            },
            displayName: 'from -> to',
            displayOrder: 2,
            unit: '%',
            displayType: '',
          },
          energyAdded: {
            value: { $max: '$data.charge_energy_added' },
            displayName: 'energy added',
            displayOrder: 7,
            unit: ' kWh',
            displayType: '',
          },
          milesAdded: {
            value: { $max: '$data.charge_miles_added_rated' },
            displayName: 'miles added',
            displayOrder: 5,
            unit: ' miles',
            displayType: '',
          },
          duration: {
            value: { $subtract: [{ $arrayElemAt: ['$data.timestamp', -1] }, { $arrayElemAt: ['$data.timestamp', 0] }] },
            displayName: 'duration',
            displayOrder: 6,
            unit: '',
            displayType: 'duration',
          },
          avgExTemp: {
            value: { $trunc: [{ $avg: '$exTemp' }, 0] },
            displayName: 'avg. ext. temp',
            displayOrder: 11,
            unit: '°',
            displayType: 'degrees',
          },
          avgInTemp: {
            value: { $trunc: [{ $avg: '$inTemp' }, 0] },
            displayName: 'avg. int. temp',
            displayOrder: 12,
            unit: '°',
            displayType: 'degrees',
          },
        },
      },
    },
  ];
};

export { chargeSessionAggregate };
