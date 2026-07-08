const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("Email service connected successfully.");
  } catch (error) {
    console.warn("Email service not connected. Check SMTP settings in .env:", error.message);
  }
}

async function sendServiceRequestEmail({
  requesterEmail,
  contactNumber,
  selectedService,
  projectDescription,
  budgetRange,
  projectDeadline,
  attachmentFilenames = [],
  submittedAt,
}) {
  const attachmentList =
    attachmentFilenames.length > 0
      ? attachmentFilenames.map((name) => `\u2022 ${name}`).join("\n")
      : "No files attached";

  const emailBody = `
New Service Request \u2014 AKU Creative Services
============================================

Requester Details
-----------------
Email:          ${requesterEmail}
Contact Number: ${contactNumber}

Project Details
---------------
Service:        ${selectedService}
Budget Range:   ${budgetRange || "Not specified"}
Deadline:       ${projectDeadline || "Not specified"}

Project Description
-------------------
${projectDescription}

Attached Files
--------------
${attachmentList}

Submitted At
------------
${new Date(submittedAt).toLocaleString("en-GB", { timeZone: "Africa/Nairobi" })}
  `.trim();

  const mailOptions = {
    from: `"AKU Creative Services" <${process.env.EMAIL_FROM}>`,
    to: process.env.EMAIL_TO,
    replyTo: requesterEmail,
    subject: `New ${selectedService} Request \u2014 ${requesterEmail}`,
    text: emailBody,
  };

  await transporter.sendMail(mailOptions);
}

async function sendRequesterConfirmationEmail({ requesterEmail, selectedService }) {
  const mailOptions = {
    from: `"AKU Creative Services" <${process.env.EMAIL_FROM}>`,
    to: requesterEmail,
    subject: "We received your project request \u2014 AKU Creative Services",
    text: `
Hi,

Thank you for submitting your ${selectedService} request to AKU Creative Services.

We have received your brief and will be in touch within 24 hours to discuss next steps.

Best regards,
AKU Graduate School of Media and Communications
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  verifyEmailConnection,
  sendServiceRequestEmail,
  sendRequesterConfirmationEmail,
};
