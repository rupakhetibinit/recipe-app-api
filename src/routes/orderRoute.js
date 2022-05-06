const { PrismaClient } = require('@prisma/client');
const express = require('express');
const validateAuth = require('../middlewares/validateAuth');
const router = express.Router();
const prisma = new PrismaClient();
const { Expo } = require('expo-server-sdk');

let expo = new Expo();

router.post('/order', validateAuth, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.body.userId,
			},
		});
		const recipe = await prisma.recipe.findUnique({
			where: {
				id: req.body.recipeId,
			},
		});
		if (!recipe) {
			return res
				.json({ success: false, message: 'Recipe not found' })
				.status(404);
		}

		if (!user) {
			return res
				.json({ success: false, message: 'User not found' })
				.status(404);
		}

		const totalWallet = parseInt(user.wallet) - parseInt(req.body.total);
		if (totalWallet < 0) {
			return res.json({
				success: false,
				message: 'Insufficient wallet balance',
			});
		}
		const updatedUser = prisma.user.update({
			where: {
				id: req.body.userId,
			},
			data: {
				wallet: user.wallet,
			},
		});

		const order = prisma.orders.create({
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
		console.log(order);
		const transaction = await prisma.$transaction([updatedUser, order]);

		return res.json({
			message: 'Order created',
			transaction: transaction,
			success: true,
			order: order,
			user: updatedUser,
		});
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
		const foundUser = await prisma.user.findUnique({
			where: {
				id: parseInt(deliveredOrder.userId),
			},
		});
		if (foundUser === null) {
			return res.json({ message: 'User not found' });
		}
		if (foundUser.wallet < deliveredOrder.total) {
			return res.json({
				success: false,
				message: 'Insufficient wallet balance',
			});
		}
		const totalWallet = foundUser.wallet - deliveredOrder.total;

		const user = await prisma.user.update({
			where: {
				id: parseInt(deliveredOrder.userId),
			},
			data: {
				wallet: totalWallet,
			},
		});
		if (deliveredOrder === null) {
			res.json({ message: 'Order not found' });
		}
		await expo.sendPushNotificationsAsync([
			{
				to: user.pushNotificationToken,
				sound: 'default',
				title: 'Order Delivered',
				body: `Your order with ${deliveredOrder.id
					.split('-')
					.toUpperCase()}  has been successfully delivered`,
			},
		]);

		res.json({ message: 'Order delivered', order: deliveredOrder, user: user });
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
			select: {
				id: true,
				delivered: true,
				createdAt: true,
				total: true,
				ingredients: true,
				user: {
					select: {
						name: true,
					},
				},
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
