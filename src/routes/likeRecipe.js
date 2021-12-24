const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

// Like a recipe
router.post('/recipes/:id/like', async (req, res) => {
	try {
		const recipe = await prisma.recipe.findUnique({
			where: {
				id: parseInt(req.params.id),
			},
		});
		if (!recipe) {
			res.json({ message: 'Recipe not found' });
		}
		const user = await prisma.user.findUnique({
			where: {
				id: parseInt(req.body.userId),
			},
		});
		if (!user) {
			res.json({ message: 'User not found' });
		}
		const like = await prisma.recipe.update({
			where: {
				id: parseInt(req.params.id),
			},
			data: {
				likedBy: {
					connect: {
						id: req.body.userId,
					},
				},
			},
			include: {
				likedBy: true,
			},
		});

		res.json({ message: 'Recipe liked', like: like });
	} catch (err) {
		console.log(err);
		res.json({ error: 'Something went wrong', err: err, message: err.message });
	}
});

// Dislike a recipe
router.patch('/recipes/:id/like', async (req, res) => {
	try {
		const recipe = await prisma.recipe.findUnique({
			where: {
				id: parseInt(req.params.id),
			},
		});
		if (!recipe) {
			res.json({ message: 'Recipe not found' });
		}
		const user = await prisma.user.findUnique({
			where: {
				id: parseInt(req.body.userId),
			},
		});
		if (!user) {
			res.json({ message: 'User not found' });
		}
		const dislike = await prisma.recipe.update({
			where: {
				id: parseInt(req.params.id),
			},
			data: {
				likedBy: {
					disconnect: {
						id: req.body.userId,
					},
				},
			},
			include: {
				likedBy: true,
			},
		});
		res.json({ message: 'Recipe disliked', dislike: dislike });
	} catch (err) {
		console.log(err);
	}
});

// Get liked recipe of user
router.get('/user/liked/:id', async (req, res) => {
	try {
		const recipe = await prisma.recipe.findMany({
			where: {
				likedBy: {
					some: {
						id: parseInt(req.params.id),
					},
				},
			},
			include: {
				likedBy: true,
			},
		});
		if (!recipe) {
			res.json({ message: 'Recipe not found' });
		}
		res.json({ message: 'Liked Recipes', recipe: recipe });
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
