const allRoles = {
  user: [
    'getVehicles',
    'manageVehicles',
    'manageTeslaAccounts',
    'getTeslaAccounts',
    'getVehicleDataPoints',
    'manageVehicleDataPoints',
    'getSessions',
    'manageSessions',
    'getMapPoints',
    'manageMapPoints',
  ],
  admin: [
    'getUsers',
    'manageUsers',
    'getVehicles',
    'manageVehicles',
    'manageTeslaAccounts',
    'getTeslaAccounts',
    'getVehicleDataPoints',
    'manageVehicleDataPoints',
    'getSessions',
    'manageSessions',
    'getMapPoints',
    'manageMapPoints',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
