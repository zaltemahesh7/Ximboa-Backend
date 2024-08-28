/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
const UserRolesEnum = {
  // SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN1: "SELF_EXPERT",
  // ADMIN2: "INSTITUTE",
  // TRAINER: "TRAINER",
  USER: "USER",
};

const AvailableUserRoles = Object.values(UserRolesEnum);

module.exports = { UserRolesEnum, AvailableUserRoles };
