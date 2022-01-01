const { PrismaClient } = require('@prisma/client');
const express = require('express');
const validateAuth = require('../middlewares/validateAuth');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/order', validateAuth, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.body.userId,
			},
		});

		if (!user) {
			return res.json({ success: false, message: 'User not found' });
		}

		const totalWallet = parseInt(user.wallet) - parseInt(req.body.total);
		const updatedUser = await prisma.user.update({
			where: {
				id: req.userId,
			},
			data: {
				wallet: totalWallet,
			},
		});

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
				id: req.body.id,
			},
			include: {
				recipe: true,
				user: true,
				ingredients: true,
			},
		});
		res.json({ message: 'Order created', order: order, user: updatedUser });
	} catch (err) {
		res.json({
			message: 'Something went wrong',
			error: {
				err: err,
				message: err.messge,
			},
		});
	}
});

// get all orders for a user
router.get('/orders/user/:userId', validateAuth, async (req, res) => {
	console.log(req.params.userId);
	try {
		const orders = await prisma.orders.findMany({
			where: {
				userId: {
					equals: parseInt(req.params.userId),
				},
			},
		});
		if (!orders) {
			res.json({ message: 'No orders found' });
		}
		res.json({ message: 'Orders fetched', orders: orders });
	} catch (err) {
		res.json({
			message: 'Something went wrong',
			error: {
				err,
				message: err.message,
			},
		});
	}
});

// cancel an order
router.delete('/order/:id', validateAuth, async (req, res) => {
	try {
		const findOrder = await prisma.orders.findUnique({
			where: {
				id: req.params.id,
			},
		});
		if (findOrder === null) {
			res.json({ message: 'Order not found' });
		}
		const user = await prisma.user.findUnique({
			where: {
				id: parseInt(findOrder.userId),
			},
		});
		if (user === null) {
			res.json({ message: 'User not found' });
		}
		const totalWallet = parseInt(user.wallet) + parseInt(findOrder.total);
		const userUpdated = await prisma.user.update({
			where: {
				id: parseInt(findOrder.userId),
			},
			data: {
				wallet: totalWallet,
			},
		});

		const order = await prisma.orders.delete({
			where: {
				id: req.params.id,
			},
		});

		res.json({ message: 'Order deleted', order: order, user: userUpdated });
	} catch (err) {
		res.json({ message: 'Something went wrong', error: err });
	}
});

// Deliver an order
router.patch('/order/:id', validateAuth, async (req, res) => {
	try {
		const deliveredOrder = await prisma.orders.update({
			where: {
				id: req.params.id,
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

// Get all orders

router.get('/orders', validateAuth, async (req, res, next) => {
	try {
		const getAllOrders = await prisma.orders.findMany({
			include: {
				user: true,
				ingredients: true,
				recipe: true,
			},
		});
		if (getAllOrders === null) {
			res.json({ message: 'No orders found' });
		}
		res.json({
			message: 'Orders fetched',
			orders: getAllOrders,
		});
	} catch (err) {
		res.json({ message: 'Something went wrong', error: err });
	}
});

module.exports = router;
