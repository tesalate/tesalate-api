import mongoose from 'mongoose';
import faker from 'faker';
import { Flag } from '../../src/models';

const infoFlag = {
  _id: mongoose.Types.ObjectId(),
  systemName: 'info_flag',
  type: 'info',
  message: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 4 })),
};

const errorFlag = {
  _id: mongoose.Types.ObjectId(),
  systemName: 'warning_flag',
  type: 'warning',
  message: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 4 })),
};

const warningFlag = {
  _id: mongoose.Types.ObjectId(),
  systemName: 'error_flag',
  type: 'error',
  message: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 4 })),
};

const insertFlags = async (flags) => {
  await Flag.insertMany(flags.map((_flag) => _flag));
};

export { infoFlag, warningFlag, errorFlag, insertFlags };
