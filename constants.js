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
    <html>
    <head>
      <style>
        * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
}

.container {
    width: 100%;
    /* max-width: 1200px; */
    margin: 0 auto;
    /* padding: 20px; */
    box-shadow: 0 10px 30px rgba(17, 12, 46, 0.1);
    border-radius: 10px;
}

/* Header Section */
.header {
    display: flex;
 justify-content: space-between;
    align-items: center; /* Center items */
    background-color: #E9EEF8;
    padding: 20px;
    border-radius: 10px 10px 0 0;
}

.header-text {
    text-align: center; /* Center align text */
}

.logo {
    width: 150px;
    height: auto; /* Maintain aspect ratio */
}

.subject {
    font-size: 20px;
    /* font-weight: bold; */
}

.email a {
    color: #265BBD;
    text-decoration: none;
}

/* Banner Image */
.banner {
    width: 100%;
    height: auto; /* Maintain aspect ratio */
}

/* Content Section */
.content {
    padding: 0px 30px;
    margin: 20px;
}

.congrats-row {
    display: flex;
   justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.congrats-text {
    font-size: 35px;
    font-weight: bold;
    color: #307DFF;
    padding-top: 8%;
}

.btn-primary {
    background-color: #265BBD;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
}

/* Message Section */
.message-section {
    margin-bottom: 20px;
}

/* Table Section */
.table-container {
    overflow-x: auto;
    margin-bottom: 20px;
}

.info-table {
    width: 60%; /* Take full width */
    border-collapse: collapse;
}

.info-table td {
    padding: 15px;
    border: 1px solid #ddd;
    text-align: left;
}

/* Footer Section */
.footer {
    background-color: #265BBD;
    color: white;
    padding: 10px  26px;
    display: flex;
    justify-content: space-between;
    align-items: center; /* Center items */
    border-radius: 0 0 10px 10px;
    gap: 10px;
}

.footer-link {
    color: white;
    text-decoration: none;
}

.social-icons {
    display: flex;
    justify-content: center; /* Center items */
    font-size: 12px;
    flex-direction: row;
}

.icon-border {
    border: 1px solid white;
    border-radius: 50%;
    /* margin: 0 3px; */
    color: white;
    text-align: center;
    
}

.social-icons :hover {
    background-color: #E9EEF8;
    border-radius: 50%;
    color: black;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .header {
        flex-direction: column; /* Stack header items on smaller screens */
        align-items: center; /* Center align header items */
    }

    .congrats-row {
        flex-direction: column; /* Stack items vertically */
        align-items: center; /* Center items */
    }
    .congrats-text {
        margin: 15px 0;
    }
    .info-table {
        width: 100%; /* Full width for smaller screens */
    }

    .btn-primary {
        width: 100%; /* Full width buttons */
        padding: 15px; /* Larger padding for easier touch */
    }

    .footer {
        flex-direction: column; /* Stack footer items */
        align-items: center; /* Center align footer items */
    }
    .message-section{
        width: 100%;
        text-align: justify;
    }
    .social-icons{
        font-size: 12px;
    }
}
      </style>
    </head>
    <body>
      <div class="container">
    <!-- Header Section -->
    <div class="header">
        <img src=${logoUrl} alt="Ximboa Logo" class="logo">
        <div class="header-text">
            <p class="subject">Subject: Course Inquiry</p>
            <p class="email">Received from: <a href="mailto:test@test.com">test@test.com</a></p>
        </div>
    </div>

    <img src=${logoUrl} alt="Banner Image" class="banner">

    <!-- Content Section -->
    <div class="content">
        <div class="congrats-row">
            <p class="congrats-text">Congratulations!</p>
            <button class="btn-primary">Sign Up for It’s Free</button>
        </div>

        <div class="message-section">
            <p>Hi [Instructor/Institute Name]</p>
            <p>You have received a new inquiry regarding [Course Name].</p>
        </div>

        <!-- Table Section -->
        <div class="table-container">
            <table class="info-table">
                <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Amit Bhoj</td>
                    </tr>
                    <tr>
                        <td>Email</td>
                        <td>test@test.com</td>
                    </tr>
                    <tr>
                        <td>Subject</td>
                        <td>Course Inquiry</td>
                    </tr>
                    <tr>
                        <td>Message</td>
                        <td>When will the batch start?</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Dashboard Section -->
        <p >To see your inquiries from one single place, visit your dashboard.</p>
        <button class="btn-primary dashboard-btn" style="margin: 30px 0;">Go to Dashboard</button>
    </div>

    <!-- Footer Section -->
    <div class="footer">
        <a href="#" class="footer-link">www.ximboa.io</a>
        <div class="social-icons">
            <a href="#" class="icon-border"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="icon-border"><i class="fab fa-twitter"></i></a>
            <a href="#" class="icon-border"><i class="fab fa-instagram"></i></a>
            <a href="#" class="icon-border"><i class="fab fa-linkedin-in"></i></a>
            <a href="#" class="icon-border"><i class="fab fa-youtube"></i></a>
        </div>
        <a href="mailto:contact@ximboa.io" class="footer-link">contact@ximboa.io</a>
    </div>
</div>
    </body>
    </html>`,
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
