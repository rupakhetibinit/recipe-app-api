const { PrismaClient } = require('@prisma/client');
const express = require('express');
const validateAuth = require('../middlewares/validateAuth');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/reviews', validateAuth, async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: req.body.userId,
			},
		});
		const recipe = await prisma.user.findUnique({
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
		const review = await prisma.review.create({
			data: {
				recipe: {
					connect: {
						id: req.body.recipeId,
					},
				},
				user: {
					connect: {
						id: req.body.recipeId,
					},
				},
				rating: req.body.rating,
				review: req.body.review,
			},
			include: {
				recipe: true,
				user: true,
			},
		});
		return res.json({ success: true, message: 'rating added', review });
	} catch (error) {
		console.log(error);
		return res.json({ success: false, message: 'Something Went Wrong' });
	}
});

router.delete('/reviews/:reviewId', validateAuth, async (req, res) => {
	try {
		const findReview = await prisma.review.findUnique({
			where: {
				id: req.params.reviewId,
			},
		});
		const review = await prisma.review.delete({
			where: {
				id: findReview.id,
			},
		});
	} catch (error) {
		console.log(error);
		return res.json({ success: false, message: 'Something Went wrong' });
	}
});

router.patch('/reviews/:reviewId', validateAuth, async (req, res) => {
	try {
		const findReview = await prisma.review.findUnique({
			where: {
				id: req.params.reviewId,
			},
		});
		const updatedReview = prisma.review.update({
			where: {
				id: findReview.id,
			},
			data: {
				review: req.body.review,
				rating: req.body.rating,
			},
		});
		return res.json({ success: true, updatedReview });
	} catch (error) {}
});

module.exports = router;