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
    subject: "Welcome to Ximboa!",
    text: (f_Name) =>
      `Hello ${f_Name},\n\nThank you for registering at Ximboa! We're excited to have you on board.`,
  },
  loginSuccess: {
    subject: "Login Successful",
    text: (f_Name) =>
      `Hello ${f_Name},\n\nYou have successfully logged in to your account.`,
  },
  resetPassword: {
    subject: "Password Reset Request",
    text: (f_Name, resetLink) =>
      `Hello ${f_Name},\n\nClick the link below to reset your password:\n${resetLink}`,
  },
  enrollment: {
    subject: "Course Enrollment Successful",
    text: (f_Name, courseName) =>
      `Hello ${f_Name},\n\nYou have successfully enrolled in the course: ${courseName}.`,
  },
};

module.exports = { UserRolesEnum, AvailableUserRoles, emailTemplates };
