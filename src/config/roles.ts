export enum UserRoles {
  admin = 'admin',
  user = 'user',
}

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
    'getSettings',
    'manageSettings',
    'getStats',
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
    'getSettings',
    'manageSettings',
    'send-invite',
    'getStats',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
