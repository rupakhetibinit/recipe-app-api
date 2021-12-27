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

module.exports = router;
