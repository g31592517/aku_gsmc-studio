const nodemailer = require("nodemailer");

const transportConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  // nime assume ikuwe  plain/unencrypted SMTP on the internal
  // network for now.
  ignoreTLS: process.env.SMTP_IGNORE_TLS !== "false",
};

if (process.env.SMTP_USER) {
  transportConfig.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  };
}

const transporter = nodemailer.createTransport(transportConfig);

async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log(`Email service connected successfully (${transportConfig.host}:${transportConfig.port}).`);
  } catch (error) {
    console.warn(`Email service connection failed [${classifySmtpError(error)}] (${transportConfig.host}:${transportConfig.port}):`, error.message);
  }
}

// Inanisaidia ku distinguish connection problems, rejections and bad config in the logs 
function classifySmtpError(error) {
  if (["ECONNECTION", "ECONNREFUSED", "ETIMEDOUT", "ESOCKET", "EDNS"].includes(error.code)) {
    return "SMTP_CONNECTION_ERROR";
  }
  if (error.code === "EAUTH") return "SMTP_AUTH_ERROR";
  if (error.responseCode >= 500 || error.code === "EENVELOPE" || error.code === "EMESSAGE") {
    return "SMTP_REJECTED";
  }
  if (!transportConfig.host) return "SMTP_INVALID_CONFIG";
  return "SMTP_SEND_ERROR";
}


async function sendMail(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${mailOptions.to} (subject: "${mailOptions.subject}", messageId: ${info.messageId}).`);
    return info;
  } catch (error) {
    console.error(`Email send failed [${classifySmtpError(error)}] to ${mailOptions.to} (subject: "${mailOptions.subject}"):`, error.message);
    throw error;
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


Requester Details

Email:          ${requesterEmail}
Contact Number: ${contactNumber}

Project Details

Service:        ${selectedService}
Budget Range:   ${budgetRange || "Not specified"}
Deadline:       ${projectDeadline || "Not specified"}

Project Description

${projectDescription}

Attached Files

${attachmentList}

Submitted At

${new Date(submittedAt).toLocaleString("en-GB", { timeZone: "Africa/Nairobi" })}
  `.trim();

  const mailOptions = {
    from: requesterEmail,
    to: process.env.EMAIL_TO,
    replyTo: requesterEmail,
    subject: `New ${selectedService} Request \u2014 ${requesterEmail}`,
    text: emailBody,
  };

  await sendMail(mailOptions);
}

async function sendRequesterConfirmationEmail({ requesterEmail, selectedService }) {
  const mailOptions = {
    from: SENDER,
    to: requesterEmail,
    subject: "We received your project request \u2014 AKU Creative Services",
    text: `
Hi,

Thank you for submitting your ${selectedService} request to AKU Creative Services.

We have received your brief and we'll start working on it as soon as possible.

We will get back to you once the work has been done. Feel free to request more services.

We deliver the best outcome. 

Best regards,
AKU Graduate School of Media and Communications
    `.trim(),
  };

  await sendMail(mailOptions);
}

async function sendStatusUpdateEmail({ requesterEmail, requestId, newStatus }) {
  const readableStatus = {
    pending: "Pending",
    assigned: "Assigned to a team member",
    "in-progress": "In Progress",
    "awaiting-review": "Awaiting Review",
    "draft-approved": "Draft Approved",
    completed: "Completed",
  };

  const mailOptions = {
    from: SENDER,
    to: requesterEmail,
    subject: `Your request has been updated — AKU Creative Services`,
    text: `
Hi,

Your service request (ID: ${requestId}) has been updated.

Current Status: ${readableStatus[newStatus] || newStatus}

You can log in to AKU Creative Services to view the full details of your request.

Best regards,
AKU Graduate School of Media and Communications
    `.trim(),
  };

  await sendMail(mailOptions);
}

async function sendCompletedWorkEmail({ requesterEmail, requestId, finalFilenames = [], note }) {
  const fileList = finalFilenames.length > 0
    ? finalFilenames.map((name) => `• ${name}`).join("\n")
    : "";

  const mailOptions = {
    from: SENDER,
    to: requesterEmail,
    subject: `Your project is complete — AKU Creative Services`,
    text: `
Hi,

Great news — your service request (ID: ${requestId}) has been completed and the final files are ready.

Final Files
-----------
${fileList}
${note ? `\nNote from the team:\n${note}\n` : ""}
Sign in to "My Requests" on AKU Creative Services to download your completed work.

Best regards,
AKU Graduate School of Media and Communications
    `.trim(),
  };

  await sendMail(mailOptions);
}

async function sendDraftReadyEmail({ requesterEmail, requestId, draftFilenames = [], note }) {
  const fileList = draftFilenames.length > 0
    ? draftFilenames.map((name) => `• ${name}`).join("\n")
    : "";

  const mailOptions = {
    from: SENDER,
    to: requesterEmail,
    subject: `Your draft is ready for review — AKU Creative Services`,
    text: `
Hi,

A draft for your service request (ID: ${requestId}) is ready for your review.

Draft Files
-----------
${fileList}
${note ? `\nNote from the team:\n${note}\n` : ""}
Sign in to "My Requests" on AKU Creative Services to review the draft and approve it, or request changes.

Best regards,
AKU Graduate School of Media and Communications
    `.trim(),
  };

  await sendMail(mailOptions);
}

async function sendDraftApprovedEmail({ staffEmail, requestId }) {
  const mailOptions = {
    from: SENDER,
    to: staffEmail,
    subject: `Draft approved — you can now submit final work (Request #${requestId})`,
    text: `
Hi,

The client approved the draft for service request #${requestId}.

You can now submit the completed/final work for this request.

Best regards,
AKU Creative Services
    `.trim(),
  };

  await sendMail(mailOptions);
}

async function sendChangesRequestedEmail({ staffEmail, requestId, feedbackNote }) {
  const mailOptions = {
    from: SENDER,
    to: staffEmail,
    subject: `Client requested changes — Request #${requestId}`,
    text: `
Hi,

The client requested changes to the draft for service request #${requestId}.

Client feedback:
${feedbackNote || "(no additional feedback provided)"}

Please revise and submit a new draft when ready.

Best regards,
AKU Creative Services
    `.trim(),
  };

  await sendMail(mailOptions);
}

module.exports = {
  verifyEmailConnection,
  sendServiceRequestEmail,
  sendRequesterConfirmationEmail,
  sendStatusUpdateEmail,
  sendCompletedWorkEmail,
  sendDraftReadyEmail,
  sendDraftApprovedEmail,
  sendChangesRequestedEmail,
};
