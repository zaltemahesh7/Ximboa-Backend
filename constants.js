/**
 * @type {{ ADMIN: "ADMIN"; USER: "USER"} as const}
 */
const UserRolesEnum = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SELF_EXPERT: "SELF_EXPERT",
  INSTITUTE: "INSTITUTE",
  TRAINER: "TRAINER",
  USER: "USER",
};

const AvailableUserRoles = Object.values(UserRolesEnum);

module.exports = { UserRolesEnum, AvailableUserRoles };
