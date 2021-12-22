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
		const recipe = await prisma.recipe.findOne({
			where: {
				id: req.params.id,
			},
			include: {
				ingredients: true,
			},
		});
		res.json({ message: 'Recipe fetched', recipe: recipe });
	} catch (err) {
		console.log(err);
	}
});

module.exports = router;
