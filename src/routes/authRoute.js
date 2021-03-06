const { PrismaClient } = require('@prisma/client');
const asyncMiddleware = require('../asyncMiddleware');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userSchema = require('../validations/userSchema');
const loginSchema = require('../validations/loginSchema');
const dotenv = require('dotenv');
const prisma = new PrismaClient();
const router = express.Router();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
// const transporter = require('../nodemailer');
dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
const validation = require('../middlewares/validationMiddleware');
const otpGenerator = require('otp-generator');
// Register

router.post(
	'/register',
	validation(userSchema),
	asyncMiddleware(async (req, res) => {
		const { name, email, password, isAdmin } = req.body;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (user && user.verified === true) {
			return res.status(403).json({
				success: false,
				error: 'User with email already exists',
			});
		}

		const savedUser = await prisma.user.create({
			data: {
				name: name,
				email: email,
				password: hashedPassword,
				isAdmin: isAdmin,
			},
		});

		const accessToken = jwt.sign(
			{ email, isAdmin },
			process.env.JWT_ACCESS_SECRET || 'secretaccess',
			{
				expiresIn: process.env.JWT_ACCESS_TIME || '30d',
			}
		);

		const verificationCode = otpGenerator.generate(4, {
			lowerCaseAlphabets: false,
			specialChars: false,
			upperCaseAlphabets: false,
		});

		const OAuth2Client = new google.auth.OAuth2(
			process.env.CLIENT_ID,
			process.env.CLIENT_SECRET,
			process.env.REDIRECT_URI
		);

		OAuth2Client.setCredentials({
			refresh_token: process.env.CLIENT_REFRESHTOKEN,
		});
		const gmailAccessToken = await OAuth2Client.getAccessToken();

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAuth2',
				user: process.env.CLIENT_EMAIL,
				clientId: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				refreshToken: process.env.CLIENT_REFRESHTOKEN,
				accessToken: gmailAccessToken,
			},
		});

		let info = await transporter.sendMail({
			from: `Recipe To Home <recipetohome@company.com>`,
			to: savedUser.email,
			subject: 'Verification Code',
			text: 'Here is your verification code',
			html: `<b>This is your code ${verificationCode}`,
		});

		await prisma.user.update({
			where: {
				email: email,
			},
			data: {
				Otp: parseInt(verificationCode),
			},
		});
		return res.status(201).json({
			success: true,
			userId: savedUser.id,
			name: savedUser.name,
			email: savedUser.email,
			isAdmin: savedUser.isAdmin,
			token: accessToken,
			location: savedUser.location,
			wallet: savedUser.wallet,
			phone: savedUser.phone,
			verified: savedUser.verified,
			verificationCode: verificationCode,
		});
	})
);

router.post(
	'/login',
	validation(loginSchema),
	asyncMiddleware(async (req, res) => {
		const { email, password } = req.body;
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (!user) {
			console.log('User not found');
			return res.sendStatus(404);
		}
		const isAdmin = user.isAdmin;
		const success = await bcrypt.compare(password, user.password);

		if (success) {
			const accessToken = jwt.sign(
				{ email, isAdmin },
				process.env.JWT_ACCESS_SECRET || 'secretaccess',
				{
					expiresIn: process.env.JWT_ACCESS_TIME || '30d',
				}
			);

			return res.status(201).json({
				userId: user.id,
				email: user.email,
				accessToken: accessToken,
				name: user.name,
				isAdmin: user.isAdmin,
				location: user.location,
				wallet: user.wallet,
				phone: user.phone,
				verified: user.verified,
			});
		} else {
			return res.json({
				success: false,
				message: `Error email or password doesn't match`,
			});
		}
	})
);

router.get('/token', async (req, res) => {
	try {
		const token =
			req.headers.authorization && req.headers.authorization.split(' ')[1];
		if (!token) {
			return res.sendStatus(401);
		}
		const decoded = jwt.verify(
			token,
			process.env.JWT_ACCESS_SECRET || 'secretaccess'
		);
		const user = await prisma.user.findUnique({
			where: {
				email: decoded.email,
			},
		});
		if (!user) {
			return res.json({
				success: false,
				error: 'User not found',
			});
		}
		const accessToken = jwt.sign(
			{ email: user.email, isAdmin: user.isAdmin },
			process.env.JWT_ACCESS_SECRET || 'secretaccess',
			{
				expiresIn: process.env.JWT_ACCESS_TIME || '30d',
			}
		);

		return res.status(200).json({
			success: true,
			userId: user.id,
			email: user.email,
			name: user.name,
			isAdmin: user.isAdmin,
			location: user.location,
			wallet: user.wallet,
			phone: user.phone,
			token: accessToken,
		});
	} catch (error) {
		console.log(error);
		if (error instanceof jwt.TokenExpiredError) {
			return res.json({
				success: false,
				error: 'Token expired',
			});
		}
		if (error instanceof jwt.JsonWebTokenError) {
			return res.json({
				success: false,
				error: 'Invalid token',
			});
		}
		return res.status(500).json({
			success: false,
			error: 'Internal Server Error',
		});
	}
});

router.post('/token', async (req, res) => {
	try {
		const { token, email } = req.body;

		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		const otp = user.Otp === token ? true : false;

		if (!otp) {
			return res.status(403).json({
				success: false,
				error: 'Failed to verify',
			});
		}
		console.log(otp);

		const updatedUser = await prisma.user.update({
			where: {
				email: user.email,
			},
			data: {
				verified: true,
			},
		});
		const isAdmin = user.isAdmin;
		const accessToken = jwt.sign(
			{ email, isAdmin },
			process.env.JWT_ACCESS_SECRET || 'secretaccess',
			{
				expiresIn: process.env.JWT_ACCESS_TIME || '30d',
			}
		);

		return res.status(200).json({
			success: true,
			userId: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
			token: accessToken,
			location: updatedUser.location,
			wallet: updatedUser.wallet,
			phone: updatedUser.phone,
			verified: updatedUser.verified,
		});
	} catch (error) {
		console.log(error);
		return res.json({ success: false, message: 'Failure. Please login again' });
	}
});

router.post('/resend', async (req, res) => {
	const { email } = req.body;
	try {
		const verificationCode = otpGenerator.generate(4, {
			lowerCaseAlphabets: false,
			specialChars: false,
			upperCaseAlphabets: false,
		});
		const user = prisma.user.update({
			where: {
				email: email,
			},
			data: {
				Otp: parseInt(verificationCode),
			},
		});

		const OAuth2Client = new google.auth.OAuth2(
			process.env.CLIENT_ID,
			process.env.CLIENT_SECRET,
			process.env.REDIRECT_URI
		);

		OAuth2Client.setCredentials({
			refresh_token: process.env.CLIENT_REFRESHTOKEN,
		});
		const gmailAccessToken = await OAuth2Client.getAccessToken();

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAuth2',
				user: process.env.CLIENT_EMAIL,
				clientId: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				refreshToken: process.env.CLIENT_REFRESHTOKEN,
				accessToken: gmailAccessToken,
			},
		});

		let info = await transporter.sendMail({
			from: `Recipe To Home <recipetohome@company.com>`,
			to: req.body.email,
			subject: 'Verification Code',
			text: 'Here is your verification code',
			html: `<b>This is your code ${verificationCode}`,
		});
		console.log(info);
		return res.json({ success: true, message: 'successful' });
	} catch (error) {
		console.log(error);
		return res.json({ success: false, message: 'Something went wrong' });
	}
});

module.exports = router;
