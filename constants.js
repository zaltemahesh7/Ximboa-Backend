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

  forgotPassword: {
    subject: "Password Reset Request",
    html: (name, resetLink, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Ximboa Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${name},</h2>
        <p>We received a request to reset your password for your <strong>Ximboa</strong> account.</p>
        <p>Please click the link below to reset your password:</p>
        <p><a href="${resetLink}" style="color: #1a73e8;">Reset Password</a></p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have any questions.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>`,
  },

  trainerRequest: {
    subject: "Trainer Request Pending Approval",
    html: (adminName, userName, instituteName, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Institute Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${adminName},</h2>
        <p>A new request has been submitted by <strong>${userName}</strong> to become a trainer under your institute <strong>${instituteName}</strong>.</p>
        <p>Please log in to your admin panel to review and approve this request.</p>
        <p>If you have any questions, feel free to contact us.</p>
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

  enrollmentNotificationToTrainer: {
    subject: "New Student Enrollment in Your Course!",
    html: (trainerName, studentName, courseName, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Course Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${trainerName},</h2>
        <p>We're excited to inform you that <strong>${studentName}</strong> has just enrolled in your course <strong>${courseName}</strong>!</p>
        <p>This is a great opportunity to share your expertise and help ${studentName} achieve their goals.</p>
        <p>You can view more details about the enrollment and manage your courses through your trainer dashboard.</p>
        <p>Thank you for being an important part of our team, and we look forward to seeing your students thrive under your guidance.</p>
        <p>Best regards,<br>Ximboa Team</p>
      </div>
    `,
  },

  roleChangeRequestToUser: {
    subject: "Your Role Change Request is Pending Approval",
    html: (userName, requested_Role, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Course Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h2>Hello ${userName},</h2>
        <p>Your request to change your role to <strong>${requested_Role}</strong> has been successfully submitted. It is currently awaiting approval by the admin.</p>
        <p>We will notify you once your request has been reviewed.</p>
        <p>Thank you,<br>The Team</p>
      </div>
    `,
  },

  roleChangeRequestToSuperAdmin: {
    subject: "Role Change Request",
    html: (requested_Role, userId, userEmail, userName, logoUrl) => `
      <div>
        <div style="text-align: center;">
          <img src="${logoUrl}" alt="Course Logo" style="width: 150px; margin-bottom: 20px;">
        </div>
        <h3>New Role Change Request</h3>
        <p>User <strong>${userName}</strong> (${userEmail}) has requested to change their role to <strong>${requested_Role}</strong>.</p>
        <p>User ID: ${userId}</p>
        <p>Please log in to your admin dashboard to approve or deny this request.</p>
      </div>
    `,
  },

  roleChangeApproved: {
    subject: "Your Role Change Request Has Been Approved",
    html: (userName, approvedRole, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${userName},</h2>
        <p>We are pleased to inform you that your request to change your role to <strong>${approvedRole}</strong> has been approved.</p>
        <p>Welcome to your new role!</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
  },

  roleChangeDenied: {
    subject: "Your Role Change Request Has Been Denied",
    html: (userName, requestedRole, logoUrl) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${userName},</h2>
        <p>Unfortunately, your request to change your role to <strong>${requestedRole}</strong> has been denied.</p>
        <p>If you have any questions, feel free to contact us.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
  },
};

module.exports = { UserRolesEnum, AvailableUserRoles, emailTemplates };
