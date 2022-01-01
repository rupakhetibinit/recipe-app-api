const { PrismaClient } = require('@prisma/client');
const express = require('express');
const validateAuth = require('../middlewares/validateAuth');
const router = express.Router();
const prisma = new PrismaClient();

router.get('/users', validateAuth, async (req, res) => {
	try {
		const users = await prisma.user.findMany({
			include: {
				_count: {
					select: {
						orders: true,
					},
				},
			},
		});
		res.json({ success: true, message: 'Users fetched', users: users });
	} catch (err) {
		console.log(err);
		res.json({ error: 'Something went wrong', err: err, message: err.message });
	}
});

router.post('/users/wallet', validateAuth, async (req, res) => {
	const { userId, wallet } = req.body;
	try {
		const foundUser = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!foundUser) {
			return res.json({ success: false, message: 'User not found' });
		}
		const totalWallet = parseInt(foundUser.wallet) + parseInt(wallet);

		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				wallet: totalWallet,
			},
		});
		return res.json({ success: true, message: 'Wallet updated', user: user });
	} catch (err) {
		console.log(err);
		res.json({ error: 'Something went wrong', message: err.message });
	}
});

router.post('/users/location', validateAuth, async (req, res) => {
	const { userId, location } = req.body;
	try {
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				location: location,
			},
		});
		return res.json({ success: true, message: 'Location updated', user: user });
	} catch (err) {
		console.log(err);
		res.json({ error: 'Something went wrong', message: err.message });
	}
});

router.post('/users/phone', validateAuth, async (req, res) => {
	const { userId, phone } = req.body;
	try {
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				phone: phone,
			},
		});
		return res.json({ success: true, message: 'Phone updated', user: user });
	} catch (err) {
		console.log(err);
		res.json({ error: 'Something went wrong', message: err.message });
	}
});

router.post('/users/wallet/decrease', validateAuth, async (req, res) => {
	const { userId, wallet } = req.body;
	try {
		const foundUser = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!foundUser) {
			return res.json({ success: false, message: 'User not found' });
		}
		const totalWallet = parseInt(foundUser.wallet) - parseInt(wallet);
		if (totalWallet < 0) {
			return res.json({ success: false, message: 'Insufficient wallet' });
		}
		const user = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				wallet: totalWallet,
			},
		});
		return res.json({ success: true, message: 'Wallet updated', user: user });
	} catch (err) {
		console.log(err);
		res.json({ error: 'Something went wrong', message: err.message });
	}
});

router.get('/users/wallet/:userId', validateAuth, async (req, res) => {
	try {
		const { userId } = req.params;
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) {
			return res.json({ success: false, message: 'User not found' });
		}
		return res.json({ success: true, message: 'Wallet fetched', user: user });
	} catch (error) {
		console.log(error);
		res.json({ error: 'Something went wrong', message: error.message });
	}
});

module.exports = router;
