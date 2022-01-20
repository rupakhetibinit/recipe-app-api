const { PrismaClient } = require('@prisma/client');

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userSchema = require('../validations/userSchema');
const loginSchema = require('../validations/loginSchema');
const dotenv = require('dotenv');
const prisma = new PrismaClient();
const router = express.Router();
dotenv.config();
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
const validation = require('../middlewares/validationMiddleware');

// Register

router.post('/register', validation(userSchema), async (req, res) => {
	try {
		const { name, email, password, isAdmin } = req.body;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (user) {
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
		});
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ success: false, error: 'Internal Sever Error' });
	}
});

router.post('/login', validation(loginSchema), async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});
		if (!user) {
			console.log('User not found');
			return res.status(404).send({ message: 'User not found' });
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
			const refreshToken = jwt.sign(
				{ email, isAdmin },
				process.env.JWT_REFRESH_SECRET || 'secretrefresh',
				{
					expiresIn: process.env.JWT_REFRESH_TIME || '30d',
				}
			);

			return res.json({
				userId: user.id,
				success: true,
				email: user.email,
				accessToken: accessToken,
				name: user.name,
				isAdmin: user.isAdmin,
				location: user.location,
				wallet: user.wallet,
				phone: user.phone,
			});
		} else {
			return res.json({
				success: false,
				message: `Error email or password doesn't match`,
			});
		}
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ success: false, error: 'Internal Sever Error' });
	}
});

router.get('/token', async (req, res) => {
	try {
		const token =
			req.headers.authorization && req.headers.authorization.split(' ')[1];
		if (!token) {
			return res.status(401).json({
				success: false,
				error: 'Token not found',
			});
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
			return res.status(404).json({
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
			userId: user.id,
			success: true,
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
			return res.status(401).json({
				success: false,
				error: 'Token expired',
			});
		}
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
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

module.exports = router;
