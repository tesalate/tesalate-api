import mongoose from 'mongoose';
import faker from 'faker';
const { Flag } = require('../../src/models');

const infoFlag = {
  _id: mongoose.Types.ObjectId(),
  systemName: faker.lorem.word(faker.datatype.number({ min: 6, max: 12 })),
  type: 'info',
  message: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 4 })),
};

const errorFlag = {
  _id: mongoose.Types.ObjectId(),
  systemName: faker.lorem.word(faker.datatype.number({ min: 6, max: 12 })),
  type: 'warning',
  message: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 4 })),
};

const warningFlag = {
  _id: mongoose.Types.ObjectId(),
  systemName: faker.lorem.word(faker.datatype.number({ min: 6, max: 12 })),
  type: 'error',
  message: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 4 })),
};

const insertFlags = async (flags) => {
  await Flag.insertMany(flags.map((_flag) => _flag));
};

export { infoFlag, warningFlag, errorFlag, insertFlags };
