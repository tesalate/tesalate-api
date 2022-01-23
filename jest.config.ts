// export default {
//   testEnvironment: 'node',
//   testEnvironmentOptions: {
//     NODE_ENV: 'test',
//   },
//   restoreMocks: true,
//   coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.js', 'tests', 'scripts'],
//   coverageReporters: ['text', 'lcov', 'clover', 'html'],
// };

// # jest.config.ts

import type { Config } from '@jest/types';
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'src/config', 'src/app.ts', 'tests', 'scripts', 'bin'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
};
export default config;
