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
  instituteRequest: {
    subject: "New Institute Approval Request",
    html: (instituteName, createdBy, instituteId, logoUrl) => `
      <h3>New Institute Approval Request</h3>
        <p>A new institute has been created and is awaiting your approval:</p>
        <ul>
          <li><strong>Institute Name:</strong> ${instituteName}</li>
          <li><strong>Created By Admin ID:</strong> ${createdBy}</li>
          <li><strong>Institute ID:</strong> ${instituteId}</li>
        </ul>
        <p>Please review and approve the institute.</p>`,
  },
  registrationSuccess: {
    subject: "Welcome to Ximboa!",
    html: (name, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${name},</h2>
        <p>Thank you for registering at <strong>Ximboa</strong>! We're excited to have you on board.</p>
        <p>If you have any questions, feel free to contact us at support@Ximboa.com.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },
  loginSuccess: {
    subject: "Login Successful",
    html: (name, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${name},</h2>
        <p>You have successfully logged in to your account.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },
  resetPassword: {
    subject: "Password Reset Request",
    html: (name, resetLink, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${name},</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="color: #1a73e8;">Reset Password</a>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },
  enrollment: {
    subject: "Course Enrollment Successful",
    html: (name, courseName, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${name},</h2>
        <p>You have successfully enrolled in the course: <strong>${courseName}</strong>.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },
};

module.exports = { UserRolesEnum, AvailableUserRoles, emailTemplates };
