const { PrismaClient } = require('@prisma/client');
const express = require('express');
const validateAuth = require('../middlewares/validateAuth');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/order', validateAuth, async (req, res) => {
	try {
		const order = await prisma.orders.create({
			data: {
				recipe: {
					connect: {
						id: req.body.recipeId,
					},
				},
				user: {
					connect: {
						id: req.body.userId,
					},
				},
				ingredients: {
					connect: req.body.ingredients,
				},
				total: req.body.total,
			},
			include: {
				recipe: true,
				user: true,
				ingredients: true,
			},
		});
		res.json({ message: 'Order created', order: order });
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
