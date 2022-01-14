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
    'getReminders',
    'manageReminders',
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
    'getReminders',
    'manageReminders',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
