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
		res.json({ message: 'Something went wrong', error: err });
	}
});

// get all orders for a user
router.get('/orders', validateAuth, async (req, res) => {
	try {
		const orders = await prisma.orders.findMany({
			where: {
				user: {
					id: parseInt(req.body.userId),
				},
			},
			include: {
				recipe: true,
				ingredients: true,
			},
		});
		if (orders === null) {
			res.json({ message: 'No orders found' });
		}
		res.json({ message: 'Orders fetched', orders: orders });
	} catch (err) {
		res.json({ message: 'Something went wrong', error: err });
	}
});

// cancel an order
router.delete('/order/:id', validateAuth, async (req, res) => {
	try {
		const findOrder = await prisma.orders.findUnique({
			where: {
				id: parseInt(req.params.id),
			},
		});
		if (findOrder === null) {
			res.json({ message: 'Order not found' });
		}
		const order = await prisma.orders.delete({
			where: {
				id: parseInt(req.params.id),
			},
		});

		res.json({ message: 'Order deleted', order: order });
	} catch (err) {
		res.json({ message: 'Something went wrong', error: err });
	}
});

// Deliver an order
router.patch('/order/:id', validateAuth, async (req, res) => {
	try {
		const deliveredOrder = await prisma.orders.update({
			where: {
				id: parseInt(req.params.id),
			},
			data: {
				delivered: true,
			},
		});
		if (deliveredOrder === null) {
			res.json({ message: 'Order not found' });
		}
		res.json({ message: 'Order delivered', order: deliveredOrder });
	} catch (err) {
		res.json({ message: 'Something went wrong', error: err });
	}
});

// get all delivered orders
router.get('/orders/delivered', validateAuth, async (req, res) => {
	try {
		const getDeliveredOrders = await prisma.orders.findMany({
			where: {
				user: {
					id: parseInt(req.body.userId),
				},
				delivered: true,
			},
			include: {
				recipe: true,
				ingredients: true,
			},
		});
		if (getDeliveredOrders === null) {
			res.json({ message: 'No delivered orders found' });
		}
		res.json({
			message: 'Delivered orders fetched',
			orders: getDeliveredOrders,
		});
	} catch (err) {
		res.json({ message: 'Something went wrong', error: err });
	}
});

module.exports = router;
