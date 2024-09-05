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

/**
 * @Email_Templates { registrationSuccess }
 */

const emailTemplates = {
  registrationSuccess: {
    subject: "Welcome to [AppName]!",
    text: (name) =>
      `Hello ${name},\n\nThank you for registering at [AppName]! We're excited to have you on board.`,
  },
  loginSuccess: {
    subject: "Login Successful",
    text: (name) =>
      `Hello ${name},\n\nYou have successfully logged in to your account.`,
  },
  resetPassword: {
    subject: "Password Reset Request",
    text: (name, resetLink) =>
      `Hello ${name},\n\nClick the link below to reset your password:\n${resetLink}`,
  },
  enrollment: {
    subject: "Course Enrollment Successful",
    text: (name, courseName) =>
      `Hello ${name},\n\nYou have successfully enrolled in the course: ${courseName}.`,
  },
};

module.exports = { UserRolesEnum, AvailableUserRoles, emailTemplates };
