/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
const UserRolesEnum = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TRAINER: "TRAINER",
  USER: "USER",
};

const AvailableUserRoles = Object.values(UserRolesEnum);

module.exports = { UserRolesEnum, AvailableUserRoles };
