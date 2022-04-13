const { PrismaClient } = require('@prisma/client');
const express = require('express');
const validateAuth = require('../middlewares/validateAuth');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/reviews', validateAuth, async (req, res) => {
	const { userId, recipeId, rating, review } = req.body;
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: parseInt(userId),
			},
		});
		const recipe = await prisma.recipe.findUnique({
			where: {
				id: parseInt(recipeId),
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
		const newReview = await prisma.review.create({
			data: {
				recipe: {
					connect: {
						id: parseInt(recipeId),
					},
				},
				user: {
					connect: {
						id: parseInt(userId),
					},
				},
				rating: parseInt(rating),
				review: review,
			},
			include: {
				recipe: true,
				user: true,
			},
		});
		return res.json({ success: true, message: 'rating added' });
	} catch (error) {
		console.log(error);
		return res.json({ success: false, message: 'Something Went Wrong' });
	}
});

router.delete('/reviews/:reviewId', validateAuth, async (req, res) => {
	const { reviewId } = req.params;
	try {
		const findReview = await prisma.review.findUnique({
			where: {
				id: parseInt(reviewId),
			},
		});
		if (!findReview) {
			return res.json({ success: false, message: 'Review not found' });
		}
		const review = await prisma.review.delete({
			where: {
				id: findReview.id,
			},
		});
		return res.json({
			success: true,
			message: 'Review Deleted',
			deletedReview: review,
		});
	} catch (error) {
		console.log(error);
		return res.json({ success: false, message: 'Something Went wrong' });
	}
});

router.patch('/reviews/:reviewId', validateAuth, async (req, res) => {
	const { rating, review } = req.body;
	const { reviewId } = req.params;
	try {
		const findReview = await prisma.review.findUnique({
			where: {
				id: parseInt(reviewId),
			},
		});
		if (!findReview) {
			return res.json({ success: false, message: 'Not Found' });
		}
		const updatedReview = await prisma.review.update({
			where: {
				id: parseInt(reviewId),
			},
			data: {
				review: review,
				rating: rating,
			},
		});
		return res.json({ success: true, updatedReview });
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
