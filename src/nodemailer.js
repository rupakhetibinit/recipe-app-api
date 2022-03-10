const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	host: 'smtp.ethereal.email',
	port: 587,
	auth: {
		user: 'ana.hauck60@ethereal.email',
		pass: 'hqXpTgm9JkU7zuAhfb',
	},
});

module.exports = transporter;
