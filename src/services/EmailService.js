// This is an email service that sends email using Nodemailer.
const nodemailer = require("nodemailer");

// function to send an email using gmail and nodemailer
// @param {string} to - email address of the receiver
// @param {string} subject - subject of the email
// @param {string} body - body of the email
// @param {string} from - sender's email address
const sendEmail = (to, from, subject, body) => {
	// create a mail transport object
	let transport = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: process.env.GMAIL_EMAIL,
			pass: process.env.GMAIL_PASSWORD,
		},
	});

	// create a mail message object
	let mailOptions = {
		from: from,
		to: to,
		subject: subject,
		text: body,
	};

	// send the message
	return transport.sendMail(mailOptions);
};

module.exports = { sendEmail };
