const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();
const validateAuth = require('../middlewares/validateAuth');

router.post('/recipes', validateAuth, async (req, res) => {
	try {
		const recipe = await prisma.recipe.create({
			data: {
				name: req.body.name,
				description: req.body.description,
				imageUrl: req.body.imageUrl,
				servings: req.body.servings,
				steps: req.body.steps,
				ingredients: {
					createMany: {
						data: req.body.ingredients,
					},
				},
			},
			include: {
				ingredients: true,
			},
		});
		res.json({ message: 'Recipe created', recipe: recipe });
	} catch (err) {
		console.log(error);
	}
});

router.get('/recipes', async (req, res) => {
	try {
		const recipes = await prisma.recipe.findMany({});
		res.json({ message: 'Recipes fetched', recipes: recipes });
	} catch (err) {
		console.log(err);
	}
});

// Get recipe by id
router.get('/recipes/:id', validateAuth, async (req, res) => {
	try {
		const recipe = await prisma.recipe.findUnique({
			where: {
				id: parseInt(req.params.id),
			},
			include: {
				ingredients: true,
			},
		});
		if (!recipe) {
			res.json({ message: 'Recipe not found' });
		}
		res.json({ message: 'Recipe fetched', recipe: recipe });
	} catch (err) {
		console.log(err);
		res.json({ error: 'Something went wrong', err: err });
	}
});

// Delete recipe by id
router.delete('/recipes/:id', validateAuth, async (req, res) => {
	try {
		const recipe = await prisma.recipe.delete({
			where: {
				id: req.params.id,
			},
		});
		if (!recipe) {
			res.json({ message: 'Recipe not found' });
		}
		res.json({ message: 'Recipe deleted', recipe: recipe });
	} catch (err) {
		res.json({ error: 'Something went wrong' });
	}
});

module.exports = router;
